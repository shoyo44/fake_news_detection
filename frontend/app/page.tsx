"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Shield,
  Zap,
  Search,
  FileText,
  Link2,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Zap size={22} />,
    title: "Multi-Agent AI",
    desc: "Three specialized AI agents collaborate: Claim Extractor, Fact Checker, and Judge for faster, structured verdicts.",
    color: "var(--neon-blue)",
  },
  {
    icon: <Search size={22} />,
    title: "Evidence-Based",
    desc: "Every verdict is grounded in real reporting from verified publications with source match scores and support labels.",
    color: "var(--neon-purple)",
  },
  {
    icon: <FileText size={22} />,
    title: "Multi-Format Input",
    desc: "Analyze pasted text, full URLs, or uploaded PDFs from the same streamlined checker page.",
    color: "var(--neon-cyan)",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleCTA = () => {
    router.push(user ? "/checker" : "/login");
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.5)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.42)",
          boxShadow: "0 10px 30px rgba(134,151,184,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #1578ff, #8b78ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(31,141,255,0.18)",
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <span
            style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em" }}
            className="gradient-text"
          >
            TruthGuard X
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/about" className="btn-ghost" style={{ textDecoration: "none" }}>
            About
          </Link>
          <Link href={user ? "/dashboard" : "/login"} className="btn-ghost" style={{ textDecoration: "none" }}>
            Dashboard
          </Link>
          {user ? (
            <>
              <Image
                src={user.photoURL || "/default-avatar.png"}
                alt="Avatar"
                width={32}
                height={32}
                style={{
                  borderRadius: "50%",
                  border: "2px solid rgba(31,141,255,0.25)",
                  boxShadow: "0 8px 20px rgba(134,151,184,0.14)",
                }}
              />
              <button
                className="btn-primary"
                onClick={() => router.push("/checker")}
                style={{ padding: "8px 20px", fontSize: "0.875rem" }}
              >
                Checker
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={() => router.push("/login")}
              style={{ padding: "8px 20px", fontSize: "0.875rem" }}
            >
              Sign In
            </button>
          )}
        </div>
      </motion.nav>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, 0.9fr)",
          gap: 28,
          alignItems: "center",
          padding: "92px 24px 80px",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              className="glass-card"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 999,
                marginBottom: 28,
                fontSize: "0.8rem",
                color: "var(--neon-blue)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--neon-blue)",
                  display: "inline-block",
                }}
                className="animate-pulse-glow"
              />
              Instant News Verification
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(3rem, 7vw, 5.4rem)",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              marginBottom: 24,
            }}
          >
            <span className="gradient-text">TruthGuard</span>
            <span
              style={{
                background: "linear-gradient(135deg, #ef5da8, #8b78ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 14px 30px rgba(139,120,255,0.12)",
              }}
            >
              {" "}X
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: "clamp(1.05rem, 2.4vw, 1.3rem)",
              color: "var(--text-secondary)",
              maxWidth: 620,
              marginBottom: 36,
              lineHeight: 1.75,
            }}
          >
            Verify reality with AI intelligence. Detect misinformation, fake news,
            and misleading content with a CSI-style backend, per-user history,
            and a dedicated checker workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
          >
            <button
              className="btn-primary"
              onClick={handleCTA}
              style={{ padding: "16px 36px", fontSize: "1rem", gap: 10 }}
            >
              Open Checker
              <ArrowRight size={18} />
            </button>
            <Link
              href="/about"
              className="btn-ghost"
              style={{ padding: "16px 28px", fontSize: "1rem", textDecoration: "none" }}
            >
              About Project
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              display: "flex",
              gap: 18,
              marginTop: 54,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Session Security", value: "5 min timeout" },
              { label: "Checker Layout", value: "2-column" },
              { label: "History", value: "User scoped" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card"
                style={{
                  minWidth: 160,
                  padding: "18px 22px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                  className="gradient-text"
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--text-muted)",
                    marginTop: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          style={{ position: "relative", minHeight: 560 }}
        >
          <div
            className="glass-card-strong"
            style={{
              padding: "26px",
              minHeight: 560,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 30%, rgba(31,141,255,0.14), transparent 30%), radial-gradient(circle at 65% 55%, rgba(139,120,255,0.16), transparent 28%), radial-gradient(circle at 35% 75%, rgba(15,184,215,0.12), transparent 26%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "10% 12%",
                perspective: 1200,
                pointerEvents: "none",
              }}
            >
              <motion.div
                animate={{ rotateY: [0, 12, -8, 0], rotateX: [0, -8, 6, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: "12% 10%",
                  borderRadius: 38,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.18))",
                  border: "1px solid rgba(255,255,255,0.65)",
                  boxShadow:
                    "0 40px 90px rgba(31,141,255,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 28,
                    left: 28,
                    right: 28,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.54)",
                      border: "1px solid rgba(255,255,255,0.76)",
                      color: "var(--neon-blue)",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={13} />
                    LIVE DETECTION
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(31,141,255,0.85), rgba(139,120,255,0.85))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      boxShadow: "0 14px 30px rgba(31,141,255,0.22)",
                    }}
                  >
                    <Shield size={18} />
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    inset: "112px 34px 34px",
                    display: "grid",
                    gridTemplateRows: "auto auto 1fr",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      padding: "18px",
                      borderRadius: 22,
                      background: "rgba(255,255,255,0.44)",
                      border: "1px solid rgba(255,255,255,0.7)",
                    }}
                  >
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.08em" }}>
                      THREAT SIGNAL
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--neon-red)", letterSpacing: "-0.04em" }}>
                          FAKE
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem", marginTop: 4 }}>
                          Claim contradicted by trusted sources
                        </div>
                      </div>
                      <div
                        style={{
                          width: 86,
                          height: 86,
                          borderRadius: "50%",
                          background:
                            "conic-gradient(from 180deg, rgba(217,75,99,0.92) 0 310deg, rgba(255,255,255,0.45) 310deg 360deg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 18px 40px rgba(217,75,99,0.18)",
                        }}
                      >
                        <div
                          style={{
                            width: 58,
                            height: 58,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.94)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--neon-red)",
                            fontWeight: 900,
                          }}
                        >
                          90%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    {[
                      { title: "Manipulation", value: "5.0 / 10", color: "var(--neon-pink)" },
                      { title: "Source Match", value: "4 articles", color: "var(--neon-cyan)" },
                    ].map((item) => (
                      <div
                        key={item.title}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 18,
                          background: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.66)",
                        }}
                      >
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.08em" }}>
                          {item.title}
                        </div>
                        <div style={{ fontWeight: 900, color: item.color, fontSize: "1.1rem" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      borderRadius: 26,
                      background: "rgba(255,255,255,0.34)",
                      border: "1px solid rgba(255,255,255,0.62)",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        icon: <XCircle size={16} color="var(--neon-red)" />,
                        text: "The claim conflicts with recent verified reporting.",
                      },
                      {
                        icon: <CheckCircle size={16} color="var(--neon-green)" />,
                        text: "The checker preserves user-scoped history for every saved run.",
                      },
                      {
                        icon: <AlertTriangle size={16} color="var(--neon-amber)" />,
                        text: "The checker input panel can collapse after analysis for cleaner review.",
                      },
                    ].map((item) => (
                      <div
                        key={item.text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: 16,
                          background: "rgba(255,255,255,0.48)",
                          border: "1px solid rgba(255,255,255,0.7)",
                          color: "var(--text-secondary)",
                          fontSize: "0.86rem",
                          lineHeight: 1.55,
                        }}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section
        id="features"
        style={{ padding: "72px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            Built for{" "}
            <span className="gradient-text">Serious Fact-Checking</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto" }}>
            Every analysis is powered by a CSI-style backend and presented in a
            dedicated user workflow.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card glass-card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredFeature(i)}
              onHoverEnd={() => setHoveredFeature(null)}
              style={{
                padding: "32px",
                cursor: "default",
                borderColor:
                  hoveredFeature === i
                    ? `${feature.color}38`
                    : "rgba(255,255,255,0.64)",
                background:
                  hoveredFeature === i
                    ? "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.68))"
                    : undefined,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${feature.color}16`,
                  border: `1px solid ${feature.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: feature.color,
                  marginBottom: 20,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  marginBottom: 10,
                  color: "var(--text-primary)",
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: "50px 24px", maxWidth: 820, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <h2
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            See It In Action
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            A lighter verdict experience with glass surfaces and smooth, readable motion.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="glass-card"
          style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.74)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                background: "rgba(216,144,21,0.08)",
                border: "1px solid rgba(216,144,21,0.22)",
                borderRadius: 999,
              }}
            >
              <AlertTriangle size={16} color="var(--neon-amber)" />
              <span
                style={{
                  color: "var(--neon-amber)",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                }}
              >
                MISLEADING
              </span>
            </div>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Confidence:{" "}
              <span style={{ color: "var(--neon-amber)", fontWeight: 700 }}>
                78%
              </span>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { text: "Study shows 90% effectiveness", status: "Disputed", icon: <XCircle size={14} />, color: "var(--neon-red)" },
              { text: "No peer review completed", status: "Verified", icon: <CheckCircle size={14} />, color: "var(--neon-green)" },
              { text: "Published by major health journal", status: "Unverified", icon: <AlertTriangle size={14} />, color: "var(--neon-amber)" },
            ].map((claim) => (
              <div
                key={claim.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.52)",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.66)",
                }}
              >
                <span style={{ color: claim.color }}>{claim.icon}</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", flex: 1 }}>
                  {claim.text}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: claim.color,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: `${claim.color}18`,
                    border: `1px solid ${claim.color}24`,
                  }}
                >
                  {claim.status}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-muted)",
              fontSize: "0.8rem",
            }}
          >
            <Link2 size={12} />
            <span>3 supporting articles found from verified news sources</span>
          </div>
        </motion.div>
      </section>

      <section
        style={{
          padding: "80px 24px 120px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-card"
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "60px 40px",
            border: "1px solid rgba(255,255,255,0.74)",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: 16,
            }}
          >
            🛡️
          </div>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            Ready to Verify?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 36,
              fontSize: "1rem",
            }}
          >
            Open the dedicated checker workspace and investigate suspicious claims
            with a clearer, more focused review flow.
          </p>
          <button
            className="btn-primary"
            onClick={handleCTA}
            style={{ padding: "16px 40px", fontSize: "1rem" }}
          >
            Start Analyzing Now <ChevronRight size={18} />
          </button>
        </motion.div>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.5)",
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span className="gradient-text" style={{ fontWeight: 700 }}>
          TruthGuard X
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          © 2025 TruthGuard X. Designed with liquid glass clarity.
        </span>
      </footer>
    </div>
  );
}
