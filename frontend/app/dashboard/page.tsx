"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Clock3,
  History,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  clearUserHistory,
  getUserHistory,
  setSelectedHistoryItem,
  UserHistoryItem,
} from "@/lib/history";
import VerdictCard from "@/components/dashboard/VerdictCard";
import ExplanationPanel from "@/components/dashboard/ExplanationPanel";
import RealityPanel from "@/components/dashboard/RealityPanel";
import EvidencePanel from "@/components/dashboard/EvidencePanel";
import ClaimBreakdown from "@/components/dashboard/ClaimBreakdown";
import SignalPanel from "@/components/dashboard/SignalPanel";
import BiasPanel from "@/components/dashboard/BiasPanel";
import PDFSummary from "@/components/dashboard/PDFSummary";
import ShareResult from "@/components/dashboard/ShareResult";
import { AnalysisResult } from "@/app/api/analyze/route";

function DonutChart({
  fake,
  misleading,
  real,
  total,
}: {
  fake: number;
  misleading: number;
  real: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const fakeAngle = (fake / safeTotal) * 360;
  const misleadingAngle = (misleading / safeTotal) * 360;
  const realAngle = (real / safeTotal) * 360;

  return (
    <div
      style={{
        width: 170,
        height: 170,
        borderRadius: "50%",
        background: `conic-gradient(
          var(--neon-red) 0deg ${fakeAngle}deg,
          var(--neon-amber) ${fakeAngle}deg ${fakeAngle + misleadingAngle}deg,
          var(--neon-green) ${fakeAngle + misleadingAngle}deg ${fakeAngle + misleadingAngle + realAngle}deg,
          rgba(119,138,170,0.18) ${fakeAngle + misleadingAngle + realAngle}deg 360deg
        )`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 20px 40px rgba(134,151,184,0.12)",
      }}
    >
      <div
        style={{
          width: 108,
          height: 108,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
          TOTAL RUNS
        </div>
      </div>
    </div>
  );
}

function HistoryResultDetails({
  item,
}: {
  item: UserHistoryItem;
}) {
  const result = item.result as AnalysisResult;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <VerdictCard verdict={result.verdict} confidence={result.confidence} />
        <ExplanationPanel explanation={result.explanation} />
        <ClaimBreakdown claims={result.claims} />
        <SignalPanel
          manipulationScore={result.manipulationScore}
          sourceCredibility={result.sourceCredibility}
          flaggedSentences={result.flaggedSentences}
        />
        <BiasPanel bias={result.bias} />
        {result.pdfSummary && result.pdfSummary.length > 0 && (
          <PDFSummary summary={result.pdfSummary} />
        )}
        <ShareResult result={result} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <RealityPanel
          whatReallyHappened={result.whatReallyHappened}
          realNewsSources={result.realNewsSources}
        />
        <EvidencePanel evidence={result.evidence} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    void getUserHistory(user.uid).then((items) => {
      if (!active) return;
      setHistory(items);
      setExpandedId((current) => current || items[0]?.id || null);
    });

    return () => {
      active = false;
    };
  }, [user]);

  const selectedItem = useMemo(() => {
    if (history.length === 0) return null;
    return history.find((item) => item.id === expandedId) || history[0];
  }, [history, expandedId]);

  const stats = useMemo(() => {
    const fake = history.filter((item) => item.verdict === "FAKE").length;
    const misleading = history.filter((item) => item.verdict === "MISLEADING").length;
    const real = history.filter((item) => item.verdict === "REAL").length;
    const pdf = history.filter((item) => item.inputType === "pdf").length;
    const url = history.filter((item) => item.inputType === "url").length;
    const text = history.filter((item) => item.inputType === "text").length;

    return {
      total: history.length,
      fake,
      misleading,
      real,
      pdf,
      url,
      text,
      latest: history[0]?.processedAt,
      averageConfidence:
        history.length > 0
          ? Math.round(history.reduce((sum, item) => sum + item.confidence, 0) / history.length)
          : 0,
    };
  }, [history]);

  if (loading || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(31,141,255,0.15)",
            borderTopColor: "var(--neon-blue)",
            borderRadius: "50%",
          }}
          className="animate-spin-slow"
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px 60px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong"
            style={{ padding: "28px" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.56)",
                    border: "1px solid rgba(255,255,255,0.72)",
                    color: "var(--neon-blue)",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 14,
                  }}
                >
                  <LayoutDashboard size={14} />
                  Personal Dashboard
                </div>
                <h1 style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: 8 }}>
                  Welcome back, <span className="gradient-text">{user.displayName?.split(" ")[0] || "Analyst"}</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", maxWidth: 700, lineHeight: 1.7 }}>
                  This page stores user history in MongoDB Atlas and keeps the dashboard focused on summary,
                  saved inputs, and expandable history entries.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.58)",
                    border: "1px solid rgba(255,255,255,0.72)",
                    borderRadius: 16,
                  }}
                >
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="Avatar" width={38} height={38} style={{ borderRadius: "50%" }} />
                  ) : (
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1578ff, #8b78ff)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                      }}
                    >
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {user.displayName || "Signed-in user"}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{user.email}</div>
                  </div>
                </div>

                <button className="btn-ghost" onClick={() => signOut()} style={{ color: "var(--neon-red)" }}>
                  Sign Out <LogOut size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { label: "Saved Runs", value: stats.total, icon: <History size={18} />, tint: "rgba(31,141,255,0.08)" },
              { label: "Average Confidence", value: `${stats.averageConfidence}%`, icon: <BarChart3 size={18} />, tint: "rgba(15,184,215,0.08)" },
              { label: "Fake Verdicts", value: stats.fake, icon: <Shield size={18} />, tint: "rgba(217,75,99,0.08)" },
            ].map((item) => (
              <div key={item.label} className="glass-card" style={{ padding: "20px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: item.tint,
                    border: "1px solid rgba(255,255,255,0.62)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    color: "var(--neon-blue)",
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
                  {item.value}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 6 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 260px) minmax(0, 1fr)", gap: 18, alignItems: "stretch" }}>
            <div className="glass-card" style={{ padding: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DonutChart fake={stats.fake} misleading={stats.misleading} real={stats.real} total={stats.total} />
            </div>

            <div className="glass-card" style={{ padding: "22px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 14 }}>
                INPUT TYPE DISTRIBUTION
              </div>
              {[
                { label: "Text", value: stats.text, color: "var(--neon-blue)" },
                { label: "URL", value: stats.url, color: "var(--neon-purple)" },
                { label: "PDF", value: stats.pdf, color: "var(--neon-cyan)" },
              ].map((item) => {
                const max = Math.max(stats.text, stats.url, stats.pdf, 1);
                const width = (item.value / max) * 100;
                return (
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>{item.label}</span>
                      <span style={{ fontSize: "0.82rem", color: item.color, fontWeight: 700 }}>{item.value}</span>
                    </div>
                    <div className="score-bar-track" style={{ height: 10 }}>
                      <div className="score-bar-fill" style={{ width: `${width}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  marginTop: 8,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.42)",
                  border: "1px solid rgba(255,255,255,0.62)",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Clock3 size={16} color="var(--neon-cyan)" />
                Latest saved run:
                <strong style={{ color: "var(--text-primary)" }}>
                  {stats.latest ? new Date(stats.latest).toLocaleString() : "No saved runs yet"}
                </strong>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>
                  STORED INPUT
                </div>
                {selectedItem ? (
                  <>
                    <div style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 6 }}>
                      {selectedItem.preview}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                      Input type: {selectedItem.inputType.toUpperCase()} • Saved at{" "}
                      {new Date(selectedItem.processedAt).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    No stored input yet. Run a verification to start building history.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => router.push("/checker")}>
                  Open Checker <ArrowRight size={16} />
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    if (selectedItem) {
                      setSelectedHistoryItem(user.uid, selectedItem);
                    }
                    router.push("/checker");
                  }}
                >
                  Continue Selected Run <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card-strong" style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 6 }}>
                  HISTORY
                </div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  Previous values and saved outputs
                </h2>
              </div>
              {history.length > 0 && (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    void clearUserHistory(user.uid).then(() => {
                      setHistory([]);
                      setExpandedId(null);
                    });
                  }}
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ padding: "14px 0", color: "var(--text-secondary)" }}>
                No saved history yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map((item) => {
                  const isOpen = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="glass-card"
                      style={{ padding: "16px 18px", overflow: "hidden" }}
                    >
                      <button
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 14,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "inherit",
                          padding: 0,
                          fontFamily: "inherit",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                            {item.preview}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                            {item.verdict} • {item.confidence}% confidence • {item.inputType.toUpperCase()} • {new Date(item.processedAt).toLocaleString()}
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <HistoryResultDetails item={item} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
