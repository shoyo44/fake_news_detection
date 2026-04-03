"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

type Verdict = "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";

interface VerdictCardProps {
  verdict: Verdict;
  confidence: number;
}

const verdictConfig: Record<
  Verdict,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; glow: string }
> = {
  REAL: {
    label: "REAL",
    color: "var(--neon-green)",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.3)",
    icon: <CheckCircle size={28} />,
    glow: "glow-green",
  },
  FAKE: {
    label: "FAKE",
    color: "var(--neon-red)",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.3)",
    icon: <XCircle size={28} />,
    glow: "glow-red",
  },
  MISLEADING: {
    label: "MISLEADING",
    color: "var(--neon-amber)",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.3)",
    icon: <AlertTriangle size={28} />,
    glow: "glow-amber",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    color: "var(--text-secondary)",
    bg: "rgba(255,255,255,0.44)",
    border: "rgba(255,255,255,0.68)",
    icon: <HelpCircle size={28} />,
    glow: "",
  },
};

function CircularConfidence({ value, color }: { value: number; color: string }) {
  const [animated, setAnimated] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(119,138,170,0.12)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* Glow circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 70 70)"
          opacity="0.3"
          filter="blur(4px)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "1.8rem",
            fontWeight: 900,
            color,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {animated}%
        </span>
        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.08em" }}>
          CONFIDENCE
        </span>
      </div>
    </div>
  );
}

function TruthGauge({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const labels = ["Fake", "Misleading", "Uncertain", "Likely Real", "Real"];
  const labelIndex = Math.min(4, Math.floor(animated / 20));

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        <span>0</span>
        <span style={{ color, fontWeight: 600 }}>
          Truth Score: {animated}
        </span>
        <span>100</span>
      </div>
      <div className="score-bar-track" style={{ height: 10 }}>
        <motion.div
          className="score-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${animated}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          style={{ background: `linear-gradient(90deg, var(--neon-red), ${color})` }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: "0.7rem",
          color: "var(--text-muted)",
        }}
      >
        {labels.map((l, i) => (
          <span
            key={l}
            style={{
              color: i === labelIndex ? color : "var(--text-muted)",
              fontWeight: i === labelIndex ? 600 : 400,
              transition: "all 0.3s",
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VerdictCard({ verdict, confidence }: VerdictCardProps) {
  const config = verdictConfig[verdict];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-card ${config.glow}`}
      style={{
        padding: "32px",
        border: `1px solid ${config.border}`,
        background: config.bg,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 28,
        }}
      >
        {/* Verdict Badge */}
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            INTELLIGENCE VERDICT
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: `${config.color}18`,
                border: `1px solid ${config.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: config.color,
              }}
            >
              {config.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  color: config.color,
                  lineHeight: 1,
                }}
              >
                {config.label}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                AI multi-agent analysis
              </div>
            </div>
          </div>
        </div>

        {/* Circular Confidence */}
        <CircularConfidence value={confidence} color={config.color} />
      </div>

      {/* Truth Gauge */}
      <TruthGauge
        score={
          verdict === "REAL"
            ? confidence
            : verdict === "FAKE"
            ? 100 - confidence
            : verdict === "MISLEADING"
            ? 50 - Math.floor(confidence * 0.2)
            : 50
        }
        color={config.color}
      />
    </motion.div>
  );
}
