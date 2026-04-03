"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Sparkles } from "lucide-react";
import InputTabs from "@/components/dashboard/InputTabs";
import AnalysisLoader from "@/components/dashboard/AnalysisLoader";
import VerdictCard from "@/components/dashboard/VerdictCard";
import ExplanationPanel from "@/components/dashboard/ExplanationPanel";
import RealityPanel from "@/components/dashboard/RealityPanel";
import EvidencePanel from "@/components/dashboard/EvidencePanel";
import ClaimBreakdown from "@/components/dashboard/ClaimBreakdown";
import SignalPanel from "@/components/dashboard/SignalPanel";
import BiasPanel from "@/components/dashboard/BiasPanel";
import PDFSummary from "@/components/dashboard/PDFSummary";
import ShareResult from "@/components/dashboard/ShareResult";
import HistoryPanel from "@/components/dashboard/HistoryPanel";
import { AnalysisResult } from "@/app/api/analyze/route";
import {
  clearSelectedHistoryItem,
  clearUserHistory,
  getSelectedHistoryItem,
  getUserHistory,
  appendUserHistory,
  UserHistoryItem,
} from "@/lib/history";

interface CheckerWorkspaceProps {
  userId: string;
  headline?: string;
  description?: string;
}

export default function CheckerWorkspace({
  userId,
  headline = "Fake News Checker",
  description = "Run the CSI-backed verification pipeline against text, URLs, and PDFs in a dedicated two-column workspace.",
}: CheckerWorkspaceProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | undefined>();
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [isComposerMinimized, setIsComposerMinimized] = useState(false);

  useEffect(() => {
    let active = true;

    void getUserHistory(userId).then((items) => {
      if (active) {
        setHistory(items);
      }
    });

    const selected = getSelectedHistoryItem(userId);
    if (selected) {
      setResult(selected.result);
      clearSelectedHistoryItem(userId);
    }
    return () => {
      active = false;
    };
  }, [userId]);

  const handleAnalyze = useCallback(
    async (data: {
      inputType: "text" | "url" | "pdf";
      text?: string;
      url?: string;
      pdfBase64?: string;
      pdfName?: string;
    }) => {
      setAnalyzing(true);
      setResult(null);
      setError(null);
      setPdfName(data.pdfName);
      setIsComposerMinimized(true);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Analysis failed");
        }

        setResult(json);

        const preview =
          data.inputType === "text"
            ? (data.text || "").slice(0, 80)
            : data.inputType === "url"
              ? data.url || ""
              : data.pdfName || "PDF Document";

        const historyItem: UserHistoryItem = {
          id: Date.now().toString(),
          verdict: json.verdict,
          confidence: json.confidence,
          inputType: data.inputType,
          preview,
          processedAt: json.processedAt || new Date().toISOString(),
          result: json,
        };

        const updated = await appendUserHistory(userId, historyItem);
        setHistory(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      } finally {
        setAnalyzing(false);
      }
    },
    [userId]
  );

  const handleLoadHistory = useCallback((item: UserHistoryItem) => {
    setResult(item.result);
    setError(null);
    setIsComposerMinimized(true);
  }, []);

  const handleClearHistory = useCallback(() => {
    void clearUserHistory(userId).then(() => {
      setHistory([]);
    });
  }, [userId]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.45fr) minmax(320px, 0.9fr)",
        gap: 24,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.56)",
              border: "1px solid rgba(255,255,255,0.72)",
              color: "var(--neon-blue)",
              fontSize: "0.74rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            <Sparkles size={14} />
            CSI Verification Pipeline
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              marginBottom: 8,
            }}
          >
            {headline.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="gradient-text">{headline.split(" ").slice(-1)}</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: 760, fontSize: "0.96rem" }}>
            {description}
          </p>
        </motion.div>

        {(isComposerMinimized || analyzing || result) ? (
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 6 }}>
                  ANALYZE CONTEXT
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {analyzing
                    ? "Analysis is running. Expand if you want to change the input after this run."
                    : "The input form is minimized so you can focus on the output. Expand it any time."}
                </div>
              </div>
              <button
                className="btn-ghost"
                onClick={() => setIsComposerMinimized((value) => !value)}
                style={{ gap: 6, padding: "8px 14px", fontSize: "0.82rem" }}
              >
                {isComposerMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                {isComposerMinimized ? "Expand Input" : "Minimize Input"}
              </button>
            </div>

            {!isComposerMinimized && (
              <div style={{ marginTop: 16 }}>
                <InputTabs onAnalyze={handleAnalyze} loading={analyzing} />
              </div>
            )}
          </div>
        ) : (
          <InputTabs onAnalyze={handleAnalyze} loading={analyzing} />
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "16px 20px",
                background: "rgba(217,75,99,0.08)",
                border: "1px solid rgba(217,75,99,0.18)",
                borderRadius: 16,
                color: "var(--neon-red)",
                fontSize: "0.875rem",
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisLoader />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Verification Results
                </h2>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setResult(null);
                    setIsComposerMinimized(false);
                  }}
                  style={{ gap: 6, fontSize: "0.8rem", padding: "7px 14px" }}
                >
                  <RotateCcw size={13} />
                  New Check
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
                  gap: 16,
                  alignItems: "start",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <VerdictCard verdict={result.verdict} confidence={result.confidence} />
                  <ExplanationPanel explanation={result.explanation} />
                  <ClaimBreakdown claims={result.claims} />
                  <SignalPanel
                    manipulationScore={result.manipulationScore}
                    sourceCredibility={result.sourceCredibility}
                    flaggedSentences={result.flaggedSentences}
                  />
                  <BiasPanel bias={result.bias} />
                  {result.pdfSummary && result.pdfSummary.length > 0 && (
                    <PDFSummary summary={result.pdfSummary} fileName={pdfName} />
                  )}
                  <ShareResult result={result} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <RealityPanel
                    whatReallyHappened={result.whatReallyHappened}
                    realNewsSources={result.realNewsSources}
                  />
                  <EvidencePanel evidence={result.evidence} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 110 }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 10 }}>
            WORKSPACE TIPS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Paste a full article paragraph for better claim extraction.",
              "Use article URLs when you want domain credibility to influence the verdict.",
              "Your analysis history is saved per signed-in user on this device.",
            ].map((tip) => (
              <div
                key={tip}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.42)",
                  border: "1px solid rgba(255,255,255,0.62)",
                  color: "var(--text-secondary)",
                  fontSize: "0.84rem",
                  lineHeight: 1.55,
                }}
              >
                {tip}
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <HistoryPanel
            history={history}
            onLoad={handleLoadHistory}
            onClear={handleClearHistory}
          />
        )}
      </div>
    </div>
  );
}
