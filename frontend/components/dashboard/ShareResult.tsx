"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { AnalysisResult } from "@/app/api/analyze/route";

interface ShareResultProps {
  result: AnalysisResult;
}

export default function ShareResult({ result }: ShareResultProps) {
  const [copied, setCopied] = useState(false);

  const generateSummary = () => {
    const lines = [
      `🛡️ TruthGuard X Analysis`,
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `Verdict: ${result.verdict}`,
      `Confidence: ${result.confidence}%`,
      ``,
      `Key Findings:`,
      ...result.explanation.slice(0, 3).map((e) => `• ${e}`),
      ``,
      `Claims Checked: ${result.claims.length}`,
      `• Verified: ${result.claims.filter((c) => c.status === "Verified").length}`,
      `• Disputed: ${result.claims.filter((c) => c.status === "Disputed").length}`,
      `• Unverified: ${result.claims.filter((c) => c.status === "Unverified").length}`,
      ``,
      `Analyzed by TruthGuard X — AI Misinformation Detection`,
    ];
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = generateSummary();
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="glass-card"
      style={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--neon-green)",
            }}
          >
            <Share2 size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Share Analysis</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Copy a formatted summary to clipboard
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: copied
              ? "rgba(74,222,128,0.1)"
              : "rgba(255,255,255,0.52)",
            border: `1px solid ${copied ? "rgba(74,222,128,0.28)" : "rgba(255,255,255,0.68)"}`,
            borderRadius: 12,
            color: copied ? "var(--neon-green)" : "var(--text-primary)",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy Summary
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
