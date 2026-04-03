"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Users } from "lucide-react";
import { teamMembers } from "@/lib/team";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 72px" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong"
          style={{ padding: "34px 32px", marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "linear-gradient(135deg, #1578ff, #8b78ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 24px rgba(31,141,255,0.18)",
              }}
            >
              <Users size={20} color="white" />
            </div>
            <span
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
              }}
            >
              Project Team
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", fontWeight: 900, letterSpacing: "-0.05em", marginBottom: 14 }}>
            About <span className="gradient-text">TruthGuard X</span>
          </h1>
          <p style={{ maxWidth: 760, color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.98rem" }}>
            TruthGuard X is a misinformation detection platform with a light liquid-glass
            interface and a CSI-inspired verification backend. It combines structured claim
            extraction, credibility scoring, Tavily evidence search, and verdict synthesis in
            one workflow.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Shield size={18} color="var(--neon-blue)" />
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Team Members</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.registerNumber}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  style={{
                    padding: "18px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.48)",
                    border: "1px solid rgba(255,255,255,0.68)",
                    boxShadow: "0 14px 30px rgba(134,151,184,0.08)",
                  }}
                >
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>
                    TEAMMATE {index + 1}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1.04rem", marginBottom: 6 }}>
                    {member.name}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: 10 }}>
                    {member.role}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(31,141,255,0.08)",
                      border: "1px solid rgba(31,141,255,0.14)",
                      color: "var(--neon-blue)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    {member.registerNumber}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 10 }}>
                PROJECT NOTES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "The teammate names and register numbers are placeholder entries because no actual member details were present in the repository.",
                  "Replace the values in lib/team.ts with your real team details when ready.",
                  "The frontend keeps the current visual style, while the backend follows the CSI project workflow.",
                ].map((note) => (
                  <div
                    key={note}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.44)",
                      border: "1px solid rgba(255,255,255,0.62)",
                      color: "var(--text-secondary)",
                      fontSize: "0.86rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 10 }}>
                QUICK LINKS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Link href="/" className="btn-ghost" style={{ textDecoration: "none", justifyContent: "space-between" }}>
                  Homepage <ArrowRight size={15} />
                </Link>
                <Link href="/checker" className="btn-primary" style={{ textDecoration: "none", justifyContent: "space-between" }}>
                  Open Checker <ArrowRight size={15} />
                </Link>
                <Link href="/dashboard" className="btn-ghost" style={{ textDecoration: "none", justifyContent: "space-between" }}>
                  User Dashboard <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
