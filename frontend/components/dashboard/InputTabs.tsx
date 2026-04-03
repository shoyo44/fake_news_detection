"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { FileText, Link2, AlignLeft, CloudUpload, X } from "lucide-react";

type TabType = "text" | "url" | "pdf";

interface InputTabsProps {
  onAnalyze: (data: {
    inputType: TabType;
    text?: string;
    url?: string;
    pdfBase64?: string;
    pdfName?: string;
  }) => void;
  loading: boolean;
}

export default function InputTabs({ onAnalyze, loading }: InputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "text", label: "Text", icon: <AlignLeft size={16} /> },
    { id: "url", label: "URL", icon: <Link2 size={16} /> },
    { id: "pdf", label: "PDF", icon: <FileText size={16} /> },
  ];

  const handleFile = (file: File) => {
    if (file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (activeTab === "text" && !text.trim()) return;
    if (activeTab === "url" && !url.trim()) return;
    if (activeTab === "pdf" && !pdfFile) return;

    if (activeTab === "pdf" && pdfFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        onAnalyze({ inputType: "pdf", pdfBase64: base64, pdfName: pdfFile.name });
      };
      reader.readAsDataURL(pdfFile);
      return;
    }

    onAnalyze({
      inputType: activeTab,
      text: activeTab === "text" ? text : undefined,
      url: activeTab === "url" ? url : undefined,
    });
  };

  const canSubmit = () => {
    if (loading) return false;
    if (activeTab === "text") return text.trim().length > 20;
    if (activeTab === "url") return url.trim().startsWith("http");
    if (activeTab === "pdf") return !!pdfFile;
    return false;
  };

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          background: "rgba(255,255,255,0.38)",
          borderRadius: 14,
          padding: 6,
          border: "1px solid rgba(255,255,255,0.58)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: activeTab === tab.id ? "1px solid rgba(31,141,255,0.24)" : "1px solid transparent",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, rgba(31,141,255,0.12), rgba(139,120,255,0.16))"
                  : "transparent",
              color:
                activeTab === tab.id ? "var(--neon-blue)" : "var(--text-muted)",
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Areas */}
      <AnimatePresence mode="wait">
        {activeTab === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              className="glass-input"
              placeholder="Paste the content you want to fact-check here. Include any claims, statements, or news article text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              style={{ padding: "16px", fontSize: "0.9rem", resize: "vertical", lineHeight: 1.7 }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              {text.length} characters {text.length < 20 && text.length > 0 && <span style={{ color: "var(--neon-amber)", marginLeft: 8 }}>— need at least 20</span>}
            </div>
          </motion.div>
        )}

        {activeTab === "url" && (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ position: "relative" }}>
              <Link2
                size={16}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="url"
                className="glass-input"
                placeholder="https://example.com/news-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ padding: "16px 16px 16px 44px", fontSize: "0.9rem" }}
              />
            </div>
            <p
              style={{
                marginTop: 10,
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              Enter the full URL of a news article, blog post, or web page. TruthGuard X will extract and analyze its content.
            </p>
          </motion.div>
        )}

        {activeTab === "pdf" && (
          <motion.div
            key="pdf"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {pdfFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "20px",
                  background: "rgba(31,141,255,0.06)",
                  border: "1px solid rgba(31,141,255,0.16)",
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(56,189,248,0.15)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--neon-blue)",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pdfFile.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {(pdfFile.size / 1024).toFixed(1)} KB • PDF Document
                  </div>
                </div>
                <button
                  onClick={() => setPdfFile(null)}
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.62)",
                    borderRadius: 8,
                    padding: 6,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? "rgba(31,141,255,0.38)" : "rgba(119,138,170,0.22)"}`,
                  borderRadius: 16,
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDragging ? "rgba(31,141,255,0.07)" : "rgba(255,255,255,0.44)",
                  transition: "all 0.2s ease",
                }}
              >
                <CloudUpload
                  size={40}
                  style={{ margin: "0 auto 16px", color: "var(--text-muted)" }}
                />
                <p style={{ fontWeight: 600, marginBottom: 6, fontSize: "0.95rem" }}>
                  Drop your PDF here
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  or click to browse files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyze Button */}
      <motion.button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={!canSubmit()}
        whileHover={canSubmit() ? { scale: 1.01 } : {}}
        whileTap={canSubmit() ? { scale: 0.99 } : {}}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "15px",
          justifyContent: "center",
          fontSize: "0.975rem",
          opacity: canSubmit() ? 1 : 0.4,
          cursor: canSubmit() ? "pointer" : "not-allowed",
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: 18,
                height: 18,
                border: "2px solid rgba(255,255,255,0.2)",
                borderTopColor: "white",
                borderRadius: "50%",
              }}
              className="animate-spin-slow"
            />
            Analyzing...
          </>
        ) : (
          "🔍 Analyze Content"
        )}
      </motion.button>
    </div>
  );
}
