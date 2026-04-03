"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  { icon: "🔍", label: "Extracting claims...", detail: "AI is identifying key factual statements" },
  { icon: "📰", label: "Fetching news sources...", detail: "Searching verified news databases" },
  { icon: "🤖", label: "Running AI verification...", detail: "Multi-agent fact-checking in progress" },
  { icon: "⚖️", label: "Generating verdict...", detail: "Judge agent synthesizing results" },
];

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timings = [0, 5000, 12000, 20000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setCurrentStep(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card"
      style={{ padding: "40px 32px", textAlign: "center" }}
    >
      {/* Animated logo */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            width: 80,
            height: 80,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Outer ring */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            style={{ position: "absolute", inset: 0 }}
            className="animate-spin-slow"
          >
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="rgba(31,141,255,0.18)"
              strokeWidth="2"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="rgba(31,141,255,0.75)"
              strokeWidth="2"
              strokeDasharray="30 190"
              strokeLinecap="round"
            />
          </svg>
          {/* Inner ring */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            style={{ position: "absolute", inset: 0, animation: "spin-slow 2s linear infinite reverse" }}
          >
            <circle
              cx="40"
              cy="40"
              r="25"
              fill="none"
              stroke="rgba(139,120,255,0.48)"
              strokeWidth="1.5"
              strokeDasharray="15 140"
              strokeLinecap="round"
            />
          </svg>
          {/* Center */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            {steps[currentStep].icon}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: 8,
              color: "var(--text-primary)",
            }}
          >
            {steps[currentStep].label}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {steps[currentStep].detail}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Step indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 32,
        }}
      >
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `2px solid ${i < currentStep ? "rgba(24,168,116,0.42)" : i === currentStep ? "rgba(31,141,255,0.42)" : "rgba(119,138,170,0.18)"}`,
                background:
                  i < currentStep
                    ? "rgba(24,168,116,0.08)"
                    : i === currentStep
                      ? "rgba(31,141,255,0.08)"
                      : "rgba(255,255,255,0.34)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.4s ease",
              }}
            >
              {i < currentStep ? "✓" : step.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="score-bar-track" style={{ marginTop: 24, maxWidth: 300, margin: "24px auto 0" }}>
        <motion.div
          className="score-bar-fill"
          style={{
            background: "linear-gradient(90deg, var(--neon-blue), var(--neon-purple))",
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <p style={{ marginTop: 12, fontSize: "0.78rem", color: "var(--text-muted)" }}>
        Step {currentStep + 1} of {steps.length} — This may take up to 30 seconds
      </p>
    </motion.div>
  );
}
