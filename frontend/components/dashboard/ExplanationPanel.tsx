"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface ExplanationPanelProps {
  explanation: string[];
}

export default function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card"
      style={{ padding: "28px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(167,139,250,0.12)",
            border: "1px solid rgba(167,139,250,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-purple)",
          }}
        >
          <Lightbulb size={18} />
        </div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          AI Explanation
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {explanation.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 14px",
              background: "rgba(167,139,250,0.05)",
              borderRadius: 12,
              borderLeft: "3px solid rgba(167,139,250,0.4)",
            }}
          >
            <span
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(167,139,250,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--neon-purple)",
                marginTop: 1,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.65,
                color: "var(--text-secondary)",
              }}
            >
              {point}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
