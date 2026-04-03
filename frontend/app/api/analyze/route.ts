import { NextRequest, NextResponse } from "next/server";
import { runCsiAnalysis, CsiAnalyzeResponse, CsiEvidenceItem } from "@/lib/csiBackend";
import { cleanText } from "@/lib/textUtils";

export const runtime = "nodejs";
// maxDuration 60 removed for Vercel Hobby compatibility
export const dynamic = "force-dynamic";

export interface AnalysisResult {
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  explanation: string[];
  evidence: Array<{
    title: string;
    source: string;
    url: string;
    matchScore: number;
    label: "Supports" | "Contradicts" | "Neutral";
    publishedAt: string;
    snippet?: string;
    claim?: string;
  }>;
  claims: Array<{
    claim: string;
    status: "Verified" | "Disputed" | "Unverified";
    confidence: number;
    reasoning: string;
  }>;
  bias: {
    emotionalTone: string;
    clickbaitScore: number;
    politicalLean: number;
  };
  pdfSummary?: string[];
  inputType: "text" | "url" | "pdf";
  processedAt: string;
  whatReallyHappened?: string | null;
  realNewsSources?: Array<{
    title: string;
    url: string;
    source: string;
    summary: string;
    published_date?: string | null;
  }>;
  manipulationScore?: number;
  biasScore?: number;
  biasType?: string;
  sentimentIntensity?: number;
  flaggedSentences?: string[];
  sourceCredibility?: number;
  processingTimeMs?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputType, text, url, pdfBase64 } = body;

    if (!inputType) {
      return NextResponse.json({ error: "inputType is required" }, { status: 400 });
    }

    let csiResult: CsiAnalyzeResponse;

    if (inputType === "text") {
      if (!text?.trim()) {
        return NextResponse.json({ error: "Text content is required" }, { status: 400 });
      }
      csiResult = await runCsiAnalysis({ text: cleanText(text) });
    } else if (inputType === "url") {
      if (!url?.trim()) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
      }
      csiResult = await runCsiAnalysis({ url });
    } else if (inputType === "pdf") {
      if (!pdfBase64) {
        return NextResponse.json({ error: "PDF data is required" }, { status: 400 });
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const buffer = Buffer.from(pdfBase64, "base64");
      const pdfData = await pdfParse(buffer);
      csiResult = await runCsiAnalysis({ text: cleanText(pdfData.text || "") });
    } else {
      return NextResponse.json({ error: "Invalid inputType" }, { status: 400 });
    }

    const result: AnalysisResult = {
      verdict: mapVerdict(csiResult.verdict),
      confidence: csiResult.confidence_score,
      explanation: splitExplanation(csiResult.explanation),
      evidence: csiResult.evidence.map(mapEvidenceItem),
      claims: mapClaims(csiResult),
      bias: {
        emotionalTone: inferEmotionalTone(csiResult),
        clickbaitScore: inferClickbaitScore(csiResult),
        politicalLean: inferPoliticalLean(csiResult),
      },
      inputType: inputType as "text" | "url" | "pdf",
      processedAt: new Date().toISOString(),
      whatReallyHappened: csiResult.what_really_happened,
      realNewsSources: csiResult.real_news_sources,
      manipulationScore: csiResult.manipulation_score,
      biasScore: csiResult.bias_score,
      biasType: csiResult.bias_type,
      sentimentIntensity: csiResult.sentiment_intensity,
      flaggedSentences: csiResult.flagged_sentences,
      sourceCredibility: csiResult.source_credibility,
      processingTimeMs: csiResult.processing_time_ms,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mapVerdict(
  verdict: CsiAnalyzeResponse["verdict"]
): AnalysisResult["verdict"] {
  if (verdict === "Real") return "REAL";
  if (verdict === "Fake") return "FAKE";
  if (verdict === "Misleading") return "MISLEADING";
  return "UNVERIFIED";
}

function splitExplanation(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.length > 0 ? sentences : [normalized || "Analysis unavailable."];
}

function mapEvidenceItem(
  item: CsiEvidenceItem
): AnalysisResult["evidence"][number] {
  const label = inferEvidenceLabel(item);
  return {
    title: item.title,
    source: extractDomain(item.url),
    url: item.url,
    matchScore: normalizeScore(item.score),
    label,
    publishedAt: "",
    snippet: item.snippet,
    claim: item.claim,
  };
}

function mapClaims(csiResult: CsiAnalyzeResponse): AnalysisResult["claims"] {
  return csiResult.claims.map((claim) => {
    const claimEvidence = csiResult.evidence.filter((item) => item.claim === claim);
    let status: AnalysisResult["claims"][number]["status"] = "Unverified";

    if (csiResult.verdict === "Real") {
      status = "Verified";
    } else if (csiResult.verdict === "Fake") {
      status = "Disputed";
    } else if (claimEvidence.length > 0 && claimEvidence.some((item) => inferEvidenceLabel(item) === "Contradicts")) {
      status = "Disputed";
    }

    return {
      claim,
      status,
      confidence: csiResult.confidence_score,
      reasoning: csiResult.explanation,
    };
  });
}

function inferEmotionalTone(csiResult: CsiAnalyzeResponse): string {
  if (csiResult.sentiment_intensity >= 7.5) return "Sensational";
  if (csiResult.sentiment_intensity >= 5.5) return "Alarming";
  if (csiResult.sentiment_intensity <= 2.5) return "Calm";
  return "Neutral";
}

function inferClickbaitScore(csiResult: CsiAnalyzeResponse): number {
  const combined = csiResult.manipulation_score * 7 + csiResult.sentiment_intensity * 3;
  return clamp(Math.round(combined), 0, 100);
}

function inferPoliticalLean(csiResult: CsiAnalyzeResponse): number {
  const intensity = clamp(Math.round(csiResult.bias_score / 2), 0, 5);
  if (csiResult.bias_type === "Left") return -intensity;
  if (csiResult.bias_type === "Right") return intensity;
  if (csiResult.bias_type === "Authoritarian") return Math.max(3, intensity);
  return 0;
}

function inferEvidenceLabel(item: CsiEvidenceItem): "Supports" | "Contradicts" | "Neutral" {
  const text = `${item.title} ${item.snippet}`.toLowerCase();
  if (
    /\b(false|debunked|debunk|hoax|fake|denied|not true|misleading|contradicts|disproved|disproven)\b/.test(
      text
    )
  ) {
    return "Contradicts";
  }
  if (/\b(true|confirmed|supports|verified|officially|accurate)\b/.test(text)) {
    return "Supports";
  }
  return "Neutral";
}

function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value >= 0 && value <= 1) return Math.round(value * 100) / 100;
  return Math.round(Math.min(1, value / 10) * 100) / 100;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
