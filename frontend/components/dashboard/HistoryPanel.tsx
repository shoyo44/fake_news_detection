"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, AlertTriangle, HelpCircle, ChevronRight, Trash2 } from "lucide-react";

export interface HistoryItem {
  id: string;
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  inputType: "text" | "url" | "pdf";
  preview: string;
  processedAt: string;
  result: object;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}

const verdictIcons = {
  REAL: <CheckCircle size={13} />,
  FAKE: <XCircle size={13} />,
  MISLEADING: <AlertTriangle size={13} />,
  UNVERIFIED: <HelpCircle size={13} />,
};

const verdictColors = {
  REAL: "var(--neon-green)",
  FAKE: "var(--neon-red)",
  MISLEADING: "var(--neon-amber)",
  UNVERIFIED: "var(--text-muted)",
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

const inputTypeEmoji = { text: "📝", url: "🔗", pdf: "📄" };

export default function HistoryPanel({ history, onLoad, onClear }: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card"
      style={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={16} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Recent Analyses</h3>
        </div>
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
          title="Clear history"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {history.map((item) => {
            const color = verdictColors[item.verdict];
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onLoad(item)}
                whileHover={{ scale: 1.01, background: "rgba(255,255,255,0.66)" }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.42)",
                  border: "1px solid rgba(255,255,255,0.62)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{inputTypeEmoji[item.inputType]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.preview}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 3,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        color,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {verdictIcons[item.verdict]}
                      {item.verdict}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {item.confidence}% · {formatRelativeTime(item.processedAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
