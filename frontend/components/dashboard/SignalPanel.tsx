"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

interface SignalPanelProps {
  manipulationScore?: number;
  sourceCredibility?: number;
  flaggedSentences?: string[];
}

export default function SignalPanel({
  manipulationScore = 0,
  sourceCredibility = 50,
  flaggedSentences = [],
}: SignalPanelProps) {
  if (!flaggedSentences.length && manipulationScore === 0 && sourceCredibility === 50) {
    return null;
  }

  const manipulationPct = Math.max(0, Math.min(100, manipulationScore * 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="glass-card"
      style={{ padding: "28px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(239,93,168,0.1)",
            border: "1px solid rgba(239,93,168,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-pink)",
          }}
        >
          <ShieldAlert size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Detection Signals</h3>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Manipulation and source-strength signals from the CSI pipeline
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: flaggedSentences.length ? 18 : 0 }}>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(239,93,168,0.06)",
            border: "1px solid rgba(239,93,168,0.14)",
          }}
        >
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.05em" }}>
            MANIPULATION SCORE
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neon-pink)", marginBottom: 8 }}>
            {manipulationScore.toFixed(1)}/10
          </div>
          <div className="score-bar-track" style={{ height: 6 }}>
            <div className="score-bar-fill" style={{ width: `${manipulationPct}%`, background: "var(--neon-pink)" }} />
          </div>
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(15,184,215,0.06)",
            border: "1px solid rgba(15,184,215,0.14)",
          }}
        >
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.05em" }}>
            SOURCE CREDIBILITY
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neon-cyan)", marginBottom: 8 }}>
            {sourceCredibility}/100
          </div>
          <div className="score-bar-track" style={{ height: 6 }}>
            <div className="score-bar-fill" style={{ width: `${sourceCredibility}%`, background: "var(--neon-cyan)" }} />
          </div>
        </div>
      </div>

      {flaggedSentences.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            FLAGGED SENTENCES
          </div>
          {flaggedSentences.map((sentence, index) => (
            <motion.div
              key={`${sentence}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.44)",
                border: "1px solid rgba(255,255,255,0.62)",
                color: "var(--text-secondary)",
                fontSize: "0.86rem",
                lineHeight: 1.6,
              }}
            >
              {sentence}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
