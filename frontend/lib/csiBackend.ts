import { cleanText, truncateText } from "@/lib/textUtils";

const TRUSTED_DOMAINS = [
  "bbc.com",
  "reuters.com",
  "apnews.com",
  "npr.org",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "factcheck.org",
  "snopes.com",
  "politifact.com",
  "fullfact.org",
  "bloomberg.com",
  "economist.com",
  "bbc.co.uk",
  "thehindu.com",
  "timesofindia.indiatimes.com",
  "hindustantimes.com",
  "indianexpress.com",
  "ndtv.com",
  "indiatoday.in",
  "theprint.in",
  "dailythanthi.com",
  "dinamalar.com",
  "dinakaran.com",
  "puthiyathalaimurai.com",
  "news18.com",
];

const KNOWN_CREDIBLE = new Set([
  "bbc.com",
  "reuters.com",
  "apnews.com",
  "npr.org",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "bloomberg.com",
  "bbc.co.uk",
  "economist.com",
  "nature.com",
  "science.org",
  "who.int",
  "cdc.gov",
  "nih.gov",
  "nasa.gov",
  "britannica.com",
  "snopes.com",
  "factcheck.org",
  "politifact.com",
  "fullfact.org",
  "thehindu.com",
  "timesofindia.indiatimes.com",
  "hindustantimes.com",
  "indianexpress.com",
  "ndtv.com",
  "indiatoday.in",
  "theprint.in",
  "dailythanthi.com",
  "dinamalar.com",
  "dinakaran.com",
  "puthiyathalaimurai.com",
  "news18.com",
]);

const KNOWN_SATIRE = new Set([
  "theonion.com",
  "babylonbee.com",
  "clickhole.com",
  "waterfordwhispersnews.com",
]);

const KNOWN_UNRELIABLE = new Set([
  "naturalnews.com",
  "infowars.com",
  "breitbart.com",
  "beforeitsnews.com",
  "yournewswire.com",
  "worldnewsdailyreport.com",
  "empirenews.net",
  "abcnews-us.com",
  "newslo.com",
]);

const SUSPICIOUS_TLDS = new Set([".tk", ".ml", ".ga", ".cf", ".gq", ".xyz"]);

const CLAIM_EXTRACTOR_PROMPT = `You are a fact-checking assistant. Your job is to extract the main factual assertions from a news article or text.

RULES:
1. Return ONLY a JSON array of strings.
2. Focus on the PRIMARY news story or core assertions (e.g. "Person X did Y").
3. IGNORE background context, geographical facts, generic definitions, and universal truths/tautologies (e.g. "Tamil Nadu is a state", "The sun rises in the east").
4. Extract ONLY claims that are verifiable news events or specific allegations.
5. Extract 1 to 3 high-impact claims maximum.
6. Do not include opinions.`;

const LINGUISTIC_PROMPT = `You are a linguistic analysis expert specializing in detecting misinformation tactics.
Analyze the text for these manipulation patterns:
- Fear-mongering and false urgency
- Emotional clickbait language
- Scapegoating or conspiracy framing
- Opinion presented as fact
- Sensational exaggeration

Return ONLY a valid JSON object with this structure:
{
  "manipulation_score": <float 0.0 to 10.0>,
  "tactics_detected": ["tactic1", "tactic2"],
  "flagged_sentences": ["sentence1", "sentence2"],
  "analysis": "<one sentence summary>"
}`;

const BIAS_PROMPT = `You are a political science and psychology expert. 
Analyze the text to detect ideological bias and emotional tone.

Return ONLY a valid JSON object:
{
  "bias_score": <float 0.0 to 10.0, 0=neutral, 10=extremely biased>,
  "bias_type": "<None|Left|Right|Authoritarian|Other>",
  "sentiment_intensity": <float 0.0 to 10.0, 0=calm/factual, 10=high-arousal/outraged>,
  "primary_emotions": ["emotion1", "emotion2"],
  "is_high_arousal": <boolean, true if likely to trigger strong emotional reaction>
}`;

const VERDICT_PROMPT = `You are an extremely strict and skeptical fact-checking analyst. 
Your goal is to verify if the provided evidence DIRECTLY and EXPLICITLY supports or contradicts the claims.

RULES FOR VERDICT:
- "Real": Only if the evidence snippets EXPLICITLY confirm the specific claim and the actors involved. 
- "Fake": Use this if:
    (a) The evidence snippets from fact-checkers (Snopes, FactCheck.org, PolitiFact, Reuters, BBC, etc.) EXPLICITLY label the claim as FALSE, DEBUNKED, or a HOAX.
    (b) Multiple reputable sources state this specific claim has been scientifically disproven or officially denied.
    (c) The claim is a well-known conspiracy theory (e.g. "5G spreads COVID", "vaccines cause autism") that has been repeatedly debunked.
- "Misleading": Use this ONLY if the claim is a distortion or missing context, but NOT outright false. Also use this if there is NO DIRECT EVIDENCE at all despite finding related topics.

CRITICAL: Do NOT confuse "Misleading" with "Fake". If fact-checkers call it FALSE or DEBUNKED, that is FAKE, not Misleading.
Do NOT hallucinate. If the evidence mentions a topic but DOES NOT mention the specific person in the claim, treat the claim as UNVERIFIED/MISLEADING. 
Do NOT claim Wikipedia or Al Jazeera verified something unless it is literally in the provided snippets.

Return ONLY a valid JSON object:
{
  "verdict": "<Real|Misleading|Fake>",
  "confidence_score": <integer 0-100>,
  "explanation": "<2-3 sentences explaining exactly why the evidence does or does not support the claim.>"
}`;

export interface CsiEvidenceItem {
  claim: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
}

export interface CsiRealNewsSource {
  title: string;
  url: string;
  source: string;
  summary: string;
  published_date?: string | null;
}

export interface CsiAnalyzeResponse {
  verdict: "Real" | "Misleading" | "Fake";
  confidence_score: number;
  explanation: string;
  what_really_happened?: string | null;
  real_news_sources: CsiRealNewsSource[];
  claims: string[];
  manipulation_score: number;
  bias_score: number;
  bias_type: string;
  sentiment_intensity: number;
  flagged_sentences: string[];
  source_credibility: number;
  evidence: CsiEvidenceItem[];
  processing_time_ms: number;
  article_title?: string;
  domain?: string;
}

interface AnalyzeInput {
  text?: string;
  url?: string;
}

export async function runCsiAnalysis({
  text,
  url,
}: AnalyzeInput): Promise<CsiAnalyzeResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  const response = await fetch(`${apiUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, url }) // Forward request directly to Python backend
  });

  if (!response.ok) {
    throw new Error(`Python Backend Error: ${await response.text()}`);
  }

  return (await response.json()) as CsiAnalyzeResponse;
}

async function extractClaims(text: string): Promise<string[]> {
  const prompt = `Extract the key factual claims from this text:\n\n${text.slice(0, 3000)}`;

  try {
    const response = await cloudflareChat({
      prompt,
      systemPrompt: CLAIM_EXTRACTOR_PROMPT,
      maxTokens: 512,
    });

    const parsed = parseJSONArray(response);
    if (parsed.length > 0) {
      return parsed.slice(0, 3).map(String);
    }
  } catch {}

  return text
    .split(".")
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30)
    .slice(0, 3);
}

async function analyzeLinguistics(text: string) {
  const prompt = `Analyze this text for manipulation and misinformation tactics:\n\n${text.slice(0, 3000)}`;

  try {
    const response = await cloudflareChat({
      prompt,
      systemPrompt: LINGUISTIC_PROMPT,
      maxTokens: 768,
    });
    const parsed = parseJSONObject(response);
    return {
      manipulation_score: coerceNumber(parsed.manipulation_score, 5),
      tactics_detected: Array.isArray(parsed.tactics_detected)
        ? parsed.tactics_detected.map(String)
        : [],
      flagged_sentences: Array.isArray(parsed.flagged_sentences)
        ? parsed.flagged_sentences.map(String)
        : [],
      analysis: typeof parsed.analysis === "string" ? parsed.analysis : "Analysis unavailable.",
    };
  } catch {
    return {
      manipulation_score: 5,
      tactics_detected: [],
      flagged_sentences: [],
      analysis: "Analysis unavailable.",
    };
  }
}

async function analyzeBiasSentiment(text: string) {
  const prompt = `Analyze the tone and bias of this text:\n\n${text.slice(0, 3000)}`;

  try {
    const response = await cloudflareChat({
      prompt,
      systemPrompt: BIAS_PROMPT,
      maxTokens: 512,
    });
    const parsed = parseJSONObject(response);
    return {
      bias_score: coerceNumber(parsed.bias_score, 0),
      bias_type: typeof parsed.bias_type === "string" ? parsed.bias_type : "None",
      sentiment_intensity: coerceNumber(parsed.sentiment_intensity, 0),
      primary_emotions: Array.isArray(parsed.primary_emotions)
        ? parsed.primary_emotions.map(String)
        : [],
      is_high_arousal: Boolean(parsed.is_high_arousal),
    };
  } catch {
    return {
      bias_score: 0,
      bias_type: "None",
      sentiment_intensity: 0,
      primary_emotions: [] as string[],
      is_high_arousal: false,
    };
  }
}

async function searchClaims(claims: string[]): Promise<CsiEvidenceItem[]> {
  const evidence: CsiEvidenceItem[] = [];

  for (const claim of claims.slice(0, 3)) {
    try {
      const names = extractProperNames(claim);
      let results = await tavilySearch({
        query: `${claim} fact check debunked`,
        search_depth: "advanced",
        max_results: 5,
        include_domains: TRUSTED_DOMAINS,
      });

      if (results.length === 0) {
        results = await tavilySearch({
          query: claim,
          search_depth: "advanced",
          max_results: 3,
        });
      }

      for (const result of results) {
        const content = result.content || "";
        if (
          names.length > 0 &&
          !names.some((name) => content.toLowerCase().includes(name.toLowerCase()))
        ) {
          continue;
        }

        evidence.push({
          claim,
          title: result.title || "",
          url: result.url || "",
          snippet: content.slice(0, 300),
          score: typeof result.score === "number" ? result.score : 0,
        });
      }
    } catch {}
  }

  return evidence;
}

async function findRealNews(topicQuery: string): Promise<{
  sources: CsiRealNewsSource[];
  what_really_happened: string;
}> {
  try {
    const rawSources = await tavilySearch({
      query: topicQuery,
      search_depth: "advanced",
      max_results: 3,
      include_domains: TRUSTED_DOMAINS,
    });

    if (rawSources.length === 0) {
      return { sources: [], what_really_happened: "" };
    }

    const sources = rawSources.map((result) => ({
      title: result.title || "",
      url: result.url || "",
      source: extractDomain(result.url),
      summary: (result.content || "").slice(0, 250),
      published_date: null,
    }));

    const context = rawSources
      .map((result) => `- ${result.title || ""}: ${(result.content || "").slice(0, 200)}`)
      .join("\n");

    try {
      const whatReallyHappened = await cloudflareChat({
        prompt: `Based on these credible news sources, write a 2-3 sentence plain-English summary of what actually happened (the real story):\n\n${context}`,
        maxTokens: 256,
      });

      return {
        sources,
        what_really_happened: stripCodeFences(whatReallyHappened).trim(),
      };
    } catch {
      return {
        sources,
        what_really_happened: "See the credible sources below for the accurate story.",
      };
    }
  } catch {
    return { sources: [], what_really_happened: "" };
  }
}

async function generateVerdict(input: {
  source_credibility: number;
  manipulation_score: number;
  evidence: CsiEvidenceItem[];
  claims: string[];
  source_flags: string[];
}): Promise<{
  verdict: "Real" | "Misleading" | "Fake";
  confidence_score: number;
  explanation: string;
}> {
  const evidenceSummary =
    input.evidence.length > 0
      ? input.evidence
          .slice(0, 5)
          .map((item) => `- ${item.title} (${item.url}): ${item.snippet}`)
          .join("\n")
      : "No cross-references found.";

  const prompt = `Analyze these signals and determine the verdict:

source_credibility_score: ${input.source_credibility}/100
source_flags: ${JSON.stringify(input.source_flags)}
manipulation_score: ${input.manipulation_score}/10
claims: ${JSON.stringify(input.claims)}
cross_reference_evidence:
${evidenceSummary}`;

  if (input.evidence.length === 0) {
    if (input.manipulation_score >= 7.5) {
      return {
        verdict: "Fake",
        confidence_score: 75,
        explanation:
          "No credible sources were found to support this claim, and the content displays high manipulation indicators. This combination strongly suggests the claim is fabricated or a known debunked conspiracy.",
      };
    }

    return {
      verdict: "Misleading",
      confidence_score: 40,
      explanation:
        "No direct cross-referenced evidence could be found to verify these specific claims from reputable sources.",
    };
  }

  try {
    const response = await cloudflareChat({
      prompt,
      systemPrompt: VERDICT_PROMPT,
      maxTokens: 512,
    });
    const parsed = parseJSONObject(response);
    let verdict = normalizeCsiVerdict(parsed.verdict);
    const explanation =
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "Verdict determined from evidence.";
    let confidence = Math.round(coerceNumber(parsed.confidence_score, 50));

    const lowerExplanation = explanation.toLowerCase();
    const skepticWords = [
      "not supported",
      "unverified",
      "no direct evidence",
      "lack of evidence",
      "misleading",
    ];
    if (verdict === "Real" && skepticWords.some((word) => lowerExplanation.includes(word))) {
      verdict = "Misleading";
      confidence = Math.min(confidence, 45);
    }

    return {
      verdict,
      confidence_score: clamp(confidence, 0, 100),
      explanation,
    };
  } catch {}

  const score = input.source_credibility - input.manipulation_score * 5;
  const verdict = score >= 65 ? "Real" : score >= 35 ? "Misleading" : "Fake";
  return {
    verdict,
    confidence_score: clamp(Math.round(score), 0, 100),
    explanation: "Verdict determined from source credibility and manipulation signals.",
  };
}

async function cloudflareChat(input: {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}): Promise<string> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const model = process.env.CF_LLM_MODEL || "@cf/meta/llama-3.1-8b-instruct";

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare AI credentials are not configured");
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const messages = [];
  if (input.systemPrompt) {
    messages.push({ role: "system", content: input.systemPrompt });
  }
  messages.push({ role: "user", content: input.prompt });

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          max_tokens: input.maxTokens ?? 1024,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        lastError = await response.text();
        throw new Error(`Cloudflare AI error (${response.status}): ${lastError}`);
      }

      const data = (await response.json()) as {
        result?: { response?: string };
      };
      const text = data.result?.response;
      if (!text) {
        throw new Error("Cloudflare AI returned an empty response");
      }
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown Cloudflare AI error";
      if (attempt === 1) {
        throw new Error(lastError);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error(lastError);
}

async function tavilySearch(input: {
  query: string;
  search_depth: "basic" | "advanced";
  max_results: number;
  include_domains?: string[];
}): Promise<Array<{ title?: string; url?: string; content?: string; score?: number }>> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: input.query,
      search_depth: input.search_depth,
      max_results: input.max_results,
      include_domains: input.include_domains,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Tavily error (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as {
    results?: Array<{ title?: string; url?: string; content?: string; score?: number }>;
  };
  return data.results || [];
}

async function scrapeUrl(url: string): Promise<{
  title: string;
  content: string;
  domain: string;
}> {
  const parsed = new URL(url);
  const domain = parsed.hostname.replace(/^www\./, "");

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const titleMatch =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ||
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = cleanText(titleMatch?.[1] || "") || url;

  const stripped = cleanText(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, " ")
  );

  return {
    title,
    content: truncateText(stripped, 4000),
    domain,
  };
}

function createInlineTextPayload(text?: string) {
  const content = cleanText(text || "");
  return {
    title: content.slice(0, 80) || "Text analysis",
    content,
    domain: "",
  };
}

function scoreDomain(domain: string) {
  const normalized = domain.toLowerCase().replace(/^www\./, "");
  const flags: string[] = [];
  let score = 50;

  if (KNOWN_CREDIBLE.has(normalized)) {
    score = 90;
    flags.push("trusted_source");
  } else if (KNOWN_SATIRE.has(normalized)) {
    score = 20;
    flags.push("known_satire_site");
  } else if (KNOWN_UNRELIABLE.has(normalized)) {
    score = 10;
    flags.push("known_unreliable_source");
  } else {
    const tld = normalized.includes(".") ? `.${normalized.split(".").pop()}` : "";
    if (tld && SUSPICIOUS_TLDS.has(tld)) {
      score -= 20;
      flags.push("suspicious_tld");
    }
    if (["truth", "real", "secret", "expose", "alert", "breaking"].some((keyword) => normalized.includes(keyword))) {
      score -= 15;
      flags.push("sensational_domain_name");
    }
    if ((normalized.match(/\./g) || []).length > 1) {
      score -= 10;
      flags.push("multiple_subdomains");
    }
  }

  return {
    credibility_score: clamp(score, 0, 100),
    is_known_satire: KNOWN_SATIRE.has(normalized),
    is_known_unreliable: KNOWN_UNRELIABLE.has(normalized),
    flags,
  };
}

function extractProperNames(claim: string): string[] {
  const words = claim.split(/\s+/);
  const names: string[] = [];

  for (let i = 0; i < words.length - 1; i += 1) {
    const w1 = words[i].replace(/[,.?!'"`]/g, "");
    const w2 = words[i + 1].replace(/[,.?!'"`]/g, "");
    if (
      w1 &&
      w2 &&
      w1[0] === w1[0]?.toUpperCase() &&
      w2[0] === w2[0]?.toUpperCase() &&
      w1.length > 2 &&
      w2.length > 2 &&
      !["The", "This", "That", "These", "Those", "Scientists", "According"].includes(w1)
    ) {
      names.push(`${w1} ${w2}`);
    }
  }

  return names;
}

function parseJSONObject(text: string): Record<string, unknown> {
  const sanitized = stripCodeFences(text);
  const start = sanitized.indexOf("{");
  const end = sanitized.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("No JSON object found");
  }
  return JSON.parse(sanitized.slice(start, end + 1)) as Record<string, unknown>;
}

function parseJSONArray(text: string): unknown[] {
  const sanitized = stripCodeFences(text);
  const start = sanitized.indexOf("[");
  const end = sanitized.lastIndexOf("]");
  if (start === -1 || end <= start) {
    throw new Error("No JSON array found");
  }
  return JSON.parse(sanitized.slice(start, end + 1)) as unknown[];
}

function stripCodeFences(value: string): string {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function normalizeCsiVerdict(value: unknown): "Real" | "Misleading" | "Fake" {
  if (value === "Real" || value === "Misleading" || value === "Fake") {
    return value;
  }
  return "Misleading";
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function coerceNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
