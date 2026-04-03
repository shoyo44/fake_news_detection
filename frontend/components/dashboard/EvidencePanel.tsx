"use client";

import { motion } from "framer-motion";
import { ExternalLink, Newspaper } from "lucide-react";

interface Evidence {
  title: string;
  source: string;
  url: string;
  matchScore: number;
  label: "Supports" | "Contradicts" | "Neutral";
  publishedAt: string;
}

interface EvidencePanelProps {
  evidence: Evidence[];
}

const labelConfig = {
  Supports: { color: "var(--neon-green)", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)", emoji: "✓" },
  Contradicts: { color: "var(--neon-red)", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", emoji: "✗" },
  Neutral: { color: "var(--text-muted)", bg: "rgba(255,255,255,0.42)", border: "rgba(255,255,255,0.62)", emoji: "~" },
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function EvidencePanel({ evidence }: EvidencePanelProps) {
  if (evidence.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "28px", textAlign: "center" }}>
        <Newspaper size={32} style={{ margin: "0 auto 12px", color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No supporting articles found. This may indicate the topic is very niche or very recent.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
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
            background: "rgba(34,211,238,0.12)",
            border: "1px solid rgba(34,211,238,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-cyan)",
          }}
        >
          <Newspaper size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Evidence Sources</h3>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {evidence.length} article{evidence.length !== 1 ? "s" : ""} found
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {evidence.map((article, i) => {
          const cfg = labelConfig[article.label];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              style={{
                padding: "14px 16px",
                background: "rgba(255,255,255,0.42)",
                border: "1px solid rgba(255,255,255,0.62)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "all 0.2s ease",
              }}
              whileHover={{
                background: "rgba(255,255,255,0.66)",
                borderColor: "rgba(255,255,255,0.78)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <span style={{ flex: 1, lineHeight: 1.4 }}>{article.title}</span>
                    <ExternalLink size={12} style={{ flexShrink: 0, color: "var(--text-muted)", marginTop: 2 }} />
                  </a>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    height: "fit-content",
                  }}
                >
                  <span>{cfg.emoji}</span>
                  {article.label}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--neon-cyan)",
                    fontWeight: 600,
                  }}
                >
                  {article.source}
                </span>
                {article.publishedAt && (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {formatDate(article.publishedAt)}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Match</span>
                  <div className="score-bar-track" style={{ width: 60, height: 4 }}>
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${article.matchScore * 100}%`,
                        background: cfg.color,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.72rem", color: cfg.color, fontWeight: 600 }}>
                    {Math.round(article.matchScore * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
