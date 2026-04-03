"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface BiasPanelProps {
  bias: {
    emotionalTone: string;
    clickbaitScore: number;
    politicalLean: number;
  };
}

function AnimatedBar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
  return (
    <div className="score-bar-track" style={{ height: 8 }}>
      <motion.div
        className="score-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        style={{ background: color }}
      />
    </div>
  );
}

function PoliticalLeanMeter({ lean }: { lean: number }) {
  // lean: -5 to 5 → convert to 0-100 percentage
  const percentage = ((lean + 5) / 10) * 100;

  const getColor = () => {
    if (lean < -2) return "#60a5fa"; // blue/left
    if (lean > 2) return "#f87171"; // red/right
    return "var(--neon-purple)"; // center/purple
  };

  const getLabel = () => {
    if (lean <= -3) return "Far Left";
    if (lean <= -1) return "Left-Leaning";
    if (lean <= 1) return "Center";
    if (lean <= 3) return "Right-Leaning";
    return "Far Right";
  };

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 8 }}>
        {/* Track */}
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "linear-gradient(90deg, rgba(96,165,250,0.3) 0%, rgba(167,139,250,0.3) 50%, rgba(248,113,113,0.3) 100%)",
          }}
        />
        {/* Needle */}
        <motion.div
          initial={{ left: "50%" }}
          animate={{ left: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          style={{
            position: "absolute",
            top: -4,
            transform: "translateX(-50%)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: getColor(),
            border: "2px solid rgba(255,255,255,0.8)",
            boxShadow: `0 0 10px ${getColor()}80`,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
        }}
      >
        <span>← Left</span>
        <span style={{ color: getColor(), fontWeight: 700 }}>{getLabel()}</span>
        <span>Right →</span>
      </div>
    </div>
  );
}

const toneColors: Record<string, string> = {
  Neutral: "var(--neon-blue)",
  Calm: "var(--neon-green)",
  Optimistic: "var(--neon-cyan)",
  Sensational: "var(--neon-amber)",
  "Fear-inducing": "var(--neon-red)",
  "Fear-Inducing": "var(--neon-red)",
  Angry: "var(--neon-red)",
  Alarming: "var(--neon-amber)",
  Unknown: "var(--text-muted)",
};

function getClickbaitLabel(score: number) {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 75) return "High";
  return "Very High";
}

function getClickbaitColor(score: number) {
  if (score < 25) return "var(--neon-green)";
  if (score < 50) return "var(--neon-blue)";
  if (score < 75) return "var(--neon-amber)";
  return "var(--neon-red)";
}

export default function BiasPanel({ bias }: BiasPanelProps) {
  const toneColor = toneColors[bias.emotionalTone] || "var(--text-secondary)";
  const clickbaitColor = getClickbaitColor(bias.clickbaitScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card"
      style={{ padding: "28px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(244,114,182,0.12)",
            border: "1px solid rgba(244,114,182,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--neon-pink)",
          }}
        >
          <Activity size={18} />
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Bias Detection</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Emotional Tone */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Emotional Tone
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: toneColor,
                padding: "2px 10px",
                borderRadius: 6,
                background: `${toneColor}18`,
                border: `1px solid ${toneColor}30`,
              }}
            >
              {bias.emotionalTone}
            </span>
          </div>
          <div className="score-bar-track" style={{ height: 6 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, var(--neon-green), ${toneColor})`,
                width:
                  bias.emotionalTone === "Neutral" || bias.emotionalTone === "Calm"
                    ? "20%"
                    : bias.emotionalTone === "Sensational" || bias.emotionalTone.includes("Fear")
                    ? "80%"
                    : "50%",
                transition: "width 1s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            <span>Calm</span>
            <span>Sensational</span>
          </div>
        </div>

        {/* Clickbait Score */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Clickbait Score
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: clickbaitColor }}>
                {bias.clickbaitScore}/100
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: clickbaitColor,
                  padding: "1px 8px",
                  borderRadius: 6,
                  background: `${clickbaitColor}18`,
                  border: `1px solid ${clickbaitColor}30`,
                }}
              >
                {getClickbaitLabel(bias.clickbaitScore)}
              </span>
            </div>
          </div>
          <AnimatedBar value={bias.clickbaitScore} color={clickbaitColor} />
        </div>

        {/* Political Lean */}
        <div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Political Bias
            </span>
          </div>
          <PoliticalLeanMeter lean={bias.politicalLean} />
        </div>
      </div>
    </motion.div>
  );
}
