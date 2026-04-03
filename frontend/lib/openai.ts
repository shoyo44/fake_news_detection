const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return apiKey;
}

async function generateStructuredJson<T>(
  systemInstruction: string,
  userPrompt: string,
  temperature: number
): Promise<T> {
  const response = await fetch(
    `${GEMINI_API_URL}?key=${encodeURIComponent(getGeminiApiKey())}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const content = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!content) {
    throw new Error("Gemini API returned an empty response");
  }

  return JSON.parse(stripCodeFences(content)) as T;
}

export async function extractClaims(text: string): Promise<string[]> {
  try {
    const parsed = await generateStructuredJson<Record<string, unknown>>(
      `You are an expert fact-checker. Extract distinct, verifiable factual claims from the provided text.
Return a JSON object with a single key "claims" whose value is an array of strings.
Each string should be a concise, searchable claim.
Extract at most 5 of the most important claims. Focus on claims that can be verified against news sources.`,
      `Extract the key factual claims from this text:\n\n${text}`,
      0.2
    );

    const claims =
      parsed.claims ||
      parsed.factual_claims ||
      parsed.results ||
      Object.values(parsed)[0];

    return Array.isArray(claims) ? claims.slice(0, 5).filter(isString) : [];
  } catch {
    return [];
  }
}

export interface ClaimVerification {
  claim: string;
  status: "Verified" | "Disputed" | "Unverified";
  confidence: number;
  reasoning: string;
}

export async function factCheckClaims(
  claims: string[],
  articles: Array<{ title: string; description: string; source: string }>
): Promise<ClaimVerification[]> {
  if (claims.length === 0) return [];

  const articlesSummary = articles
    .slice(0, 8)
    .map(
      (a, i) =>
        `Article ${i + 1}: "${a.title}" (${a.source})\n${a.description || ""}`
    )
    .join("\n\n");

  try {
    const parsed = await generateStructuredJson<{
      verifications?: ClaimVerification[];
    }>(
      `You are a professional fact-checker with access to news articles. Verify each claim against the provided articles.
Return a JSON object with a "verifications" array. Each item must have:
- "claim": the original claim string
- "status": "Verified" | "Disputed" | "Unverified"
- "confidence": number 0-100
- "reasoning": brief explanation (1-2 sentences)

Only mark as "Verified" if articles clearly support it. "Disputed" if articles contradict it. "Unverified" if insufficient information.`,
      `Claims to verify:\n${claims.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nAvailable news articles:\n${articlesSummary || "No articles found."}`,
      0.2
    );

    return Array.isArray(parsed.verifications)
      ? parsed.verifications.map(normalizeVerification)
      : [];
  } catch {
    return claims.map((claim) => ({
      claim,
      status: "Unverified" as const,
      confidence: 0,
      reasoning: "Could not verify.",
    }));
  }
}

export interface JudgeVerdict {
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  explanation: string[];
  bias: {
    emotionalTone: string;
    clickbaitScore: number;
    politicalLean: number;
  };
  pdfSummary?: string[];
}

export async function judgeVerdict(
  originalText: string,
  claimResults: ClaimVerification[],
  inputType: string
): Promise<JudgeVerdict> {
  const claimsSummary = claimResults
    .map(
      (c) =>
        `- "${c.claim}" → ${c.status} (${c.confidence}% confidence): ${c.reasoning}`
    )
    .join("\n");

  const isPDF = inputType === "pdf";

  try {
    const parsed = await generateStructuredJson<Partial<JudgeVerdict>>(
      `You are the final AI judge in a multi-agent fact-checking system. Based on the claim verifications, give a final verdict on the content's authenticity.

Return a JSON object with:
- "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED"
- "confidence": number 0-100
- "explanation": array of 3-5 strings explaining your reasoning
- "bias": object with:
  - "emotionalTone": string (e.g. "Neutral", "Sensational", "Fear-inducing", "Optimistic")
  - "clickbaitScore": number 0-100
  - "politicalLean": number from -5 (far left) to 5 (far right), 0 = center
${isPDF ? '- "pdfSummary": array of 3-5 key points from the document' : ""}

Verdicts:
- REAL: Content is factually accurate and verifiable
- FAKE: Content contains false information
- MISLEADING: Contains some facts but presented in a misleading way
- UNVERIFIED: Insufficient evidence to determine authenticity`,
      `Original text:\n${originalText.slice(0, 1500)}\n\nClaim verification results:\n${claimsSummary || "No claims could be extracted."}`,
      0.3
    );

    return {
      verdict: normalizeVerdict(parsed.verdict),
      confidence: clampNumber(parsed.confidence, 50),
      explanation: Array.isArray(parsed.explanation)
        ? parsed.explanation.filter(isString)
        : ["Could not determine verdict."],
      bias: {
        emotionalTone:
          typeof parsed.bias?.emotionalTone === "string"
            ? parsed.bias.emotionalTone
            : "Unknown",
        clickbaitScore: clampNumber(parsed.bias?.clickbaitScore, 0),
        politicalLean: clampNumber(parsed.bias?.politicalLean, 0),
      },
      pdfSummary: Array.isArray(parsed.pdfSummary)
        ? parsed.pdfSummary.filter(isString)
        : undefined,
    };
  } catch {
    return {
      verdict: "UNVERIFIED",
      confidence: 0,
      explanation: ["Analysis failed. Please try again."],
      bias: { emotionalTone: "Unknown", clickbaitScore: 0, politicalLean: 0 },
    };
  }
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stripCodeFences(value: string): string {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function clampNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeVerdict(value: unknown): JudgeVerdict["verdict"] {
  if (
    value === "REAL" ||
    value === "FAKE" ||
    value === "MISLEADING" ||
    value === "UNVERIFIED"
  ) {
    return value;
  }

  return "UNVERIFIED";
}

function normalizeVerification(value: ClaimVerification): ClaimVerification {
  return {
    claim: isString(value.claim) ? value.claim : "Unknown claim",
    status:
      value.status === "Verified" ||
      value.status === "Disputed" ||
      value.status === "Unverified"
        ? value.status
        : "Unverified",
    confidence: clampNumber(value.confidence, 0),
    reasoning: isString(value.reasoning)
      ? value.reasoning
      : "Could not verify.",
  };
}
