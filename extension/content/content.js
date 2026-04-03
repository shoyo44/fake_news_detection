// TruthGuard Content Script
// Renders the side panel overlay on the current page

(function () {
  "use strict";

  // Prevent double-injection
  if (window.__tg_initialized) return;
  window.__tg_initialized = true;

  // ── Create Panel DOM ─────────────────────────────────────────────────────────
  const root = document.createElement("div");
  root.id = "tg-panel-root";

  root.innerHTML = `
    <div id="tg-panel">
      <div id="tg-header">
        <div id="tg-logo">
          <div id="tg-logo-icon">🛡️</div>
          <div id="tg-logo-text">Truth<span>Guard</span></div>
        </div>
        <button id="tg-close" title="Close">✕</button>
      </div>
      <div id="tg-body">
        <div id="tg-content"></div>
      </div>
      <div id="tg-footer">
        <span>Powered by <strong>TruthGuard AI</strong></span>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  const panel = root.querySelector("#tg-panel");
  const body = root.querySelector("#tg-content");
  const closeBtn = root.querySelector("#tg-close");

  closeBtn.addEventListener("click", closePanel);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("tg-open")) {
      closePanel();
    }
  });

  function closePanel() {
    panel.classList.remove("tg-open");
  }

  function openPanel() {
    panel.classList.add("tg-open");
  }

  // ── Verdict Helpers ──────────────────────────────────────────────────────────
  function getVerdictClass(verdict = "") {
    const v = verdict.toLowerCase();
    if (v === "real") return "verdict-real";
    if (v === "fake") return "verdict-fake";
    return "verdict-misleading";
  }

  function getVerdictIcon(verdict = "") {
    const v = verdict.toLowerCase();
    if (v === "real") return "✅";
    if (v === "fake") return "❌";
    return "⚠️";
  }

  function getVerdictLabel(verdict = "") {
    const v = verdict.toLowerCase();
    if (v === "real") return "Verified Real";
    if (v === "fake") return "Likely Fake";
    return "Misleading";
  }

  function getVerdictSubtext(verdict = "") {
    const v = verdict.toLowerCase();
    if (v === "real") return "This content appears credible";
    if (v === "fake") return "This content contradicts verified facts";
    return "This content may be partially inaccurate";
  }

  // ── Render Loading ───────────────────────────────────────────────────────────
  function renderLoading() {
    body.innerHTML = `
      <div id="tg-loading">
        <div class="tg-spinner"></div>
        <p>Analyzing with AI agents…</p>
      </div>
    `;
  }

  // ── Render Error ─────────────────────────────────────────────────────────────
  function renderError(msg) {
    body.innerHTML = `
      <div id="tg-error">
        <strong>⚠️ Analysis Failed</strong>
        ${msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Could not reach the TruthGuard website API. Make sure the app is running at <strong>localhost:3000</strong>."
          : escapeHtml(msg)
        }
      </div>
    `;
  }

  // ── Render Result ────────────────────────────────────────────────────────────
  function renderResult(data) {
    const verdict = data.verdict || "Unknown";
    const vClass = getVerdictClass(verdict);
    const confidence = data.confidence ?? data.confidence_score ?? 0;
    const explanation = Array.isArray(data.explanation)
      ? data.explanation.join(" ")
      : data.explanation || "No explanation provided.";
    const flagged = data.flaggedSentences || data.flagged_sentences || [];
    const sources = data.realNewsSources || data.real_news_sources || [];
    const whatHappened = data.whatReallyHappened || data.what_really_happened || "";

    let html = `
      <!-- Verdict Card -->
      <div class="tg-verdict-card ${vClass}">
        <div class="tg-verdict-icon">${getVerdictIcon(verdict)}</div>
        <div class="tg-verdict-text">
          <h3>${getVerdictLabel(verdict)}</h3>
          <p>${getVerdictSubtext(verdict)}</p>
        </div>
      </div>

      <!-- Confidence -->
      <div class="tg-section">
        <p class="tg-section-title">Confidence Score</p>
        <div class="tg-confidence-row ${vClass}">
          <div class="tg-confidence-bar">
            <div class="tg-confidence-fill" style="width: 0%" data-target="${confidence}%"></div>
          </div>
          <div class="tg-confidence-pct">${confidence}%</div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="tg-section">
        <p class="tg-section-title">AI Explanation</p>
        <p class="tg-explanation">${escapeHtml(explanation)}</p>
      </div>
    `;

    // What really happened
    if (whatHappened) {
      html += `
        <div class="tg-section">
          <p class="tg-section-title">What Really Happened</p>
          <p class="tg-explanation">${escapeHtml(whatHappened)}</p>
        </div>
      `;
    }

    // Flagged sentences
    if (flagged.length > 0) {
      html += `
        <div class="tg-section">
          <p class="tg-section-title">🚩 Flagged Sentences</p>
          ${flagged.map(s => `<div class="tg-flagged-item">${escapeHtml(s)}</div>`).join("")}
        </div>
      `;
    }

    // Real news sources
    if (sources.length > 0) {
      html += `
        <div class="tg-section">
          <p class="tg-section-title">📰 Real News Sources</p>
          ${sources.slice(0, 4).map(s => `
            <a class="tg-source-item" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">
              <span class="tg-source-title">${escapeHtml(s.title || "Source")}</span>
              <span class="tg-source-domain">${escapeHtml(s.source || s.url)}</span>
            </a>
          `).join("")}
        </div>
      `;
    }

    body.innerHTML = html;

    // Animate confidence bar
    requestAnimationFrame(() => {
      const fill = body.querySelector(".tg-confidence-fill");
      if (fill) {
        setTimeout(() => {
          fill.style.width = fill.dataset.target;
        }, 100);
      }
    });
  }

  // ── Escape HTML ──────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Global API (called by service worker via scripting.executeScript) ─────────
  window.__tg_showPanel = function ({ loading, result, error }) {
    openPanel();
    if (loading) {
      renderLoading();
    } else if (error) {
      renderError(error);
    } else if (result) {
      renderResult(result);
    }
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== "TRUTHGUARD_AUTH_STATE") return;

    chrome.storage.local.set({
      truthguardUser: event.data.user || null,
    });
  });
})();
