"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, AlertCircle, Terminal, ExternalLink } from "lucide-react";

export default function LoginPage() {
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setError(null);
    setSigning(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(31,141,255,0.16) 0%, transparent 70%)",
            top: "10%",
            left: "12%",
            filter: "blur(60px)",
            animation: "float1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,120,255,0.18) 0%, transparent 70%)",
            bottom: "12%",
            right: "10%",
            filter: "blur(60px)",
            animation: "float2 25s ease-in-out infinite",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-strong"
        style={{
          width: "100%",
          maxWidth: 460,
          padding: "48px 40px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 40px 120px rgba(134,151,184,0.24), 0 0 0 1px rgba(255,255,255,0.4)",
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          style={{ marginBottom: 24 }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 24,
              background: "linear-gradient(135deg, #1578ff, #8b78ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 16px 36px rgba(31,141,255,0.22)",
            }}
          >
            <Shield size={38} color="white" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              marginBottom: 10,
            }}
            className="gradient-text"
          >
            TruthGuard X
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.97rem", marginBottom: 32, lineHeight: 1.7 }}>
            Sign in to enter the liquid-glass dashboard and run AI-backed
            misinformation analysis.
          </p>
        </motion.div>

        {!configured && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "16px",
              background: "rgba(216,144,21,0.08)",
              border: "1px solid rgba(216,144,21,0.18)",
              borderRadius: 18,
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--neon-amber)", fontWeight: 700, fontSize: "0.875rem" }}>
              <AlertCircle size={16} />
              Setup Required
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
              Create a <code style={{ color: "var(--neon-cyan)", background: "rgba(15,184,215,0.08)", padding: "1px 6px", borderRadius: 4 }}>.env.local</code> file in your project root with your Firebase and API keys.
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.48)",
                borderRadius: 12,
                padding: "10px 12px",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "var(--neon-green)",
                textAlign: "left",
                lineHeight: 1.8,
                border: "1px solid rgba(255,255,255,0.68)",
              }}
            >
              <div style={{ color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={11} /> .env.local
              </div>
              NEXT_PUBLIC_FIREBASE_API_KEY=...<br />
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...<br />
              NEXT_PUBLIC_FIREBASE_PROJECT_ID=...<br />
              NEXT_PUBLIC_FIREBASE_APP_ID=...<br />
              GEMINI_API_KEY=...<br />
              GNEWS_API_KEY=...
            </div>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: "0.78rem", color: "var(--neon-blue)", textDecoration: "none" }}
            >
              Open Firebase Console <ExternalLink size={11} />
            </a>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(217,75,99,0.08)", border: "1px solid rgba(217,75,99,0.18)", borderRadius: 14, color: "var(--neon-red)", fontSize: "0.875rem", marginBottom: 16, textAlign: "left" }}
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={configured ? { scale: 1.02, y: -1 } : {}}
          whileTap={configured ? { scale: 0.98 } : {}}
          onClick={configured ? handleSignIn : undefined}
          disabled={signing || !configured}
          title={!configured ? "Set up .env.local first" : undefined}
          style={{
            width: "100%",
            padding: "15px 20px",
            background: !configured
              ? "rgba(255,255,255,0.38)"
              : signing
                ? "rgba(255,255,255,0.54)"
                : "rgba(255,255,255,0.74)",
            border: `1px solid ${!configured ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)"}`,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            cursor: signing || !configured ? "not-allowed" : "pointer",
            opacity: !configured ? 0.55 : 1,
            transition: "all 0.25s ease",
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: "0.975rem",
            fontFamily: "inherit",
            boxShadow: configured ? "0 18px 32px rgba(134,151,184,0.15)" : "none",
          }}
        >
          {signing ? (
            <>
              <div style={{ width: 20, height: 20, border: "2px solid rgba(20,32,51,0.12)", borderTopColor: "var(--neon-blue)", borderRadius: "50%" }} className="animate-spin-slow" />
              Signing in...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 24, lineHeight: 1.6 }}
        >
          {configured
            ? "Smooth sign-in unlocks the full analysis workspace."
            : "Configure .env.local to enable authentication."}
        </motion.p>
      </motion.div>
    </div>
  );
}
