"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ maxWidth: 440, width: "100%", padding: "52px 40px", textAlign: "center" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🔍</div>
        <h1
          style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 12 }}
          className="gradient-text"
        >
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "0.95rem" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <button
          className="btn-primary"
          onClick={() => router.push("/")}
          style={{ gap: 8 }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}
