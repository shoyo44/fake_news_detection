"use client";

import { motion } from "framer-motion";
import { Newspaper, Sparkles, ExternalLink } from "lucide-react";

interface RealNewsSource {
  title: string;
  url: string;
  source: string;
  summary: string;
  published_date?: string | null;
}

interface RealityPanelProps {
  whatReallyHappened?: string | null;
  realNewsSources?: RealNewsSource[];
}

export default function RealityPanel({
  whatReallyHappened,
  realNewsSources = [],
}: RealityPanelProps) {
  if (!whatReallyHappened && realNewsSources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="glass-card"
      style={{ padding: "28px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(31,141,255,0.1)",
            border: "1px solid rgba(31,141,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-blue)",
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>What Really Happened</h3>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            CSI-style recovery of the likely real story
          </div>
        </div>
      </div>

      {whatReallyHappened && (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(31,141,255,0.06)",
            border: "1px solid rgba(31,141,255,0.14)",
            marginBottom: realNewsSources.length > 0 ? 16 : 0,
          }}
        >
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>
            {whatReallyHappened}
          </p>
        </div>
      )}

      {realNewsSources.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.78rem", letterSpacing: "0.05em" }}>
            <Newspaper size={13} />
            CREDIBLE SOURCES
          </div>
          {realNewsSources.map((source, index) => (
            <motion.a
              key={`${source.url}-${index}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              style={{
                textDecoration: "none",
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.44)",
                border: "1px solid rgba(255,255,255,0.62)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.45 }}>
                  {source.title}
                </span>
                <ExternalLink size={13} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
              </div>
              <span style={{ fontSize: "0.76rem", color: "var(--neon-cyan)", fontWeight: 600 }}>
                {source.source}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                {source.summary}
              </span>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
