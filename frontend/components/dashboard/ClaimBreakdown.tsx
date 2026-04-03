"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface Claim {
  claim: string;
  status: "Verified" | "Disputed" | "Unverified";
  confidence: number;
  reasoning: string;
}

interface ClaimBreakdownProps {
  claims: Claim[];
}

const statusConfig = {
  Verified: {
    color: "var(--neon-green)",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.25)",
    icon: <CheckCircle size={15} />,
  },
  Disputed: {
    color: "var(--neon-red)",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.25)",
    icon: <XCircle size={15} />,
  },
  Unverified: {
    color: "var(--neon-amber)",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.25)",
    icon: <HelpCircle size={15} />,
  },
};

export default function ClaimBreakdown({ claims }: ClaimBreakdownProps) {
  if (claims.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
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
            background: "rgba(56,189,248,0.12)",
            border: "1px solid rgba(56,189,248,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-blue)",
          }}
        >
          <BookOpen size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Claim Breakdown</h3>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {claims.filter((c) => c.status === "Verified").length} verified ·{" "}
            {claims.filter((c) => c.status === "Disputed").length} disputed ·{" "}
            {claims.filter((c) => c.status === "Unverified").length} unverified
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {claims.map((claim, i) => {
          const cfg = statusConfig[claim.status];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              style={{
                padding: "14px 16px",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  &ldquo;{claim.claim}&rdquo;
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: `${cfg.color}18`,
                    border: `1px solid ${cfg.color}35`,
                    color: cfg.color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cfg.icon}
                  {claim.status}
                </div>
              </div>

              {claim.reasoning && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.55,
                    marginBottom: 8,
                  }}
                >
                  {claim.reasoning}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="score-bar-track" style={{ flex: 1, height: 4 }}>
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${claim.confidence}%`,
                      background: cfg.color,
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", color: cfg.color, fontWeight: 600, minWidth: 36 }}>
                  {claim.confidence}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
