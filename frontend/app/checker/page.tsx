"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CheckerWorkspace from "@/components/checker/CheckerWorkspace";

export default function CheckerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

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
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          padding: "28px 24px 60px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong"
          style={{ padding: "18px 22px", marginBottom: 22 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              <Shield size={20} color="white" />
            </div>
            <div>
              <div className="gradient-text" style={{ fontWeight: 800, fontSize: "1rem" }}>
                TruthGuard X Checker
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem" }}>
                Dedicated two-column verification workspace
              </div>
            </div>
          </div>
        </motion.div>

        <CheckerWorkspace userId={user.uid} />
      </div>
    </div>
  );
}
