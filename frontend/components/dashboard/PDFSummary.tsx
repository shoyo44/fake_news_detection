"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface PDFSummaryProps {
  summary: string[];
  fileName?: string;
}

export default function PDFSummary({ summary, fileName }: PDFSummaryProps) {
  if (!summary || summary.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card"
      style={{
        padding: "28px",
        border: "1px solid rgba(56,189,248,0.15)",
      }}
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
            background: "rgba(56,189,248,0.12)",
            border: "1px solid rgba(56,189,248,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-blue)",
          }}
        >
          <FileText size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>PDF Key Points</h3>
          {fileName && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {fileName}
            </div>
          )}
        </div>
      </div>

      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {summary.map((point, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 14px",
              background: "rgba(56,189,248,0.05)",
              borderRadius: 10,
              borderLeft: "3px solid rgba(56,189,248,0.4)",
            }}
          >
            <span
              style={{
                color: "var(--neon-blue)",
                fontWeight: 700,
                fontSize: "0.85rem",
                minWidth: 20,
              }}
            >
              {i + 1}.
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {point}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
