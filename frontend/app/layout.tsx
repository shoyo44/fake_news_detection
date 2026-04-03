import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TruthGuard X — AI Misinformation Detection",
  description:
    "Verify reality with AI intelligence. TruthGuard X uses multi-agent AI to detect misinformation, fake news, and misleading content from text, URLs, and PDFs.",
  keywords:
    "AI, misinformation, fact-check, fake news detection, truth verification, AI powered",
  openGraph: {
    title: "TruthGuard X",
    description: "Verify Reality with AI Intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>
          <div className="animated-bg" aria-hidden="true">
            <div
              className="mesh-orb"
              style={{
                width: 280,
                height: 280,
                top: "22%",
                left: "18%",
                background:
                  "radial-gradient(circle, rgba(15,184,215,0.18) 0%, rgba(15,184,215,0.03) 56%, transparent 72%)",
              }}
            />
            <div
              className="mesh-orb"
              style={{
                width: 360,
                height: 360,
                bottom: "12%",
                left: "52%",
                background:
                  "radial-gradient(circle, rgba(239,93,168,0.14) 0%, rgba(239,93,168,0.02) 58%, transparent 74%)",
                animationDelay: "-8s",
              }}
            />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
