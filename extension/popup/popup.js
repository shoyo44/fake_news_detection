// TruthGuard Popup Script

const $ = (id) => document.getElementById(id);
const DEFAULT_API_URL = "http://localhost:3000";

function normalizeApiUrl(value) {
  const raw = (value || DEFAULT_API_URL).trim();
  try {
    return new URL(raw).origin;
  } catch {
    const trimmed = raw.replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
  }
}

// ── State ────────────────────────────────────────────────────────────────────
let activeTab = "text";
let currentUser = null;

// ── Auto-Detect Current Tab URL on Popup Open ─────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await hydrateUserState();
  try {
    // Query the currently active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const url = tab?.url || "";
    const title = tab?.title || "";

    // Skip browser internal pages (chrome://, edge://, about:, etc.)
    const isInternal =
      url.startsWith("chrome://") ||
      url.startsWith("edge://") ||
      url.startsWith("about:") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("moz-extension://") ||
      !url.startsWith("http");

    if (isInternal || !url) {
      // Fallback: show normal empty state
      $("empty-state").querySelector("p").textContent =
        "Paste a claim or URL above\nto check for misinformation";
      $("auto-detect-bar").classList.add("hidden");
      return;
    }

    // Switch to URL tab
    switchTab("url");

    // Pre-fill the URL
    $("input-url").value = url;

    // Update the auto-detect bar
    $("auto-detect-spinner").classList.add("hidden");
    $("auto-detect-label").textContent =
      `🟢 Detected: ${title || url}`;

    // Update empty state while analyzing
    $("empty-state").querySelector("p").textContent = "Analyzing current page…";

    // Auto-trigger analysis
    await analyze();
  } catch {
    // If anything fails, degrade gracefully
    $("auto-detect-bar").classList.add("hidden");
    $("empty-state").querySelector("p").textContent =
      "Paste a claim or URL above to check for misinformation";
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.truthguardUser) {
    void hydrateUserState();
  }
});

// ── Tab Switching ────────────────────────────────────────────────────────────
function switchTab(tabName) {
  activeTab = tabName;

  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.tab === tabName);
  });
  document.querySelectorAll(".input-wrap").forEach((w) => w.classList.remove("active"));
  document.querySelector(`#input-${tabName}-wrap`).classList.add("active");

  resetResults();
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

// ── Character Counter ────────────────────────────────────────────────────────
$("input-text").addEventListener("input", () => {
  const len = $("input-text").value.length;
  $("char-used").textContent = len;
});

// ── Settings Button ──────────────────────────────────────────────────────────
$("settings-btn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

$("signin-btn").addEventListener("click", async () => {
  const { apiUrl } = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });
  chrome.tabs.create({
    url: `${normalizeApiUrl(apiUrl)}${currentUser ? "/dashboard" : "/login"}`,
  });
});

$("open-dashboard-btn").addEventListener("click", async () => {
  const { apiUrl } = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });
  chrome.tabs.create({ url: `${normalizeApiUrl(apiUrl)}/dashboard` });
});

$("tab-btn").addEventListener("click", analyzeCurrentTabContent);

// ── Analyze Button ───────────────────────────────────────────────────────────
$("analyze-btn").addEventListener("click", analyze);

// Allow Enter to submit from URL input
$("input-url").addEventListener("keydown", (e) => {
  if (e.key === "Enter") analyze();
});

async function analyze() {
  const text = $("input-text").value.trim();
  const url = $("input-url").value.trim();

  if (activeTab === "text" && !text) return shake($("input-text"));
  if (activeTab === "url" && !url) return shake($("input-url"));

  setLoading(true);
  resetResults();

  const payload = activeTab === "text" ? { text } : { url };

  try {
    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE",
      payload,
    });

    if (response?.error) {
      showError(response.error);
    } else {
      showResults(response);
    }
  } catch (err) {
    showError(err.message || "Unknown error");
  } finally {
    setLoading(false);
  }
}

// ── Loading State ────────────────────────────────────────────────────────────
function setLoading(loading) {
  const btn = $("analyze-btn");
  const btnText = $("btn-text");
  const btnSpinner = $("btn-spinner");

  btn.disabled = loading;
  btnText.classList.toggle("hidden", loading);
  btnSpinner.classList.toggle("hidden", !loading);
}

// ── Shake Animation ──────────────────────────────────────────────────────────
function shake(el) {
  el.style.animation = "none";
  el.style.borderColor = "rgba(239, 68, 68, 0.5)";
  setTimeout(() => {
    el.style.borderColor = "";
  }, 600);
}

// ── Reset ────────────────────────────────────────────────────────────────────
function resetResults() {
  $("results").classList.add("hidden");
  $("error-area").classList.add("hidden");
  $("empty-state").classList.remove("hidden");
}

// ── Error ────────────────────────────────────────────────────────────────────
function showError(msg) {
  $("empty-state").classList.add("hidden");
  $("error-area").classList.remove("hidden");

  const isNetwork = msg.includes("fetch") || msg.includes("network") || msg.includes("Failed");
  $("error-msg").textContent = isNetwork
    ? "Could not reach TruthGuard website API. Make sure it's running at localhost:3000 (or update the URL in Settings)."
    : msg;
}

// ── Results ──────────────────────────────────────────────────────────────────
function showResults(data) {
  $("empty-state").classList.add("hidden");
  $("results").classList.remove("hidden");
  resetOptionalSections();

  const verdict = data.verdict || "Unknown";
  const vClass = getVerdictClass(verdict);
  const confidence = data.confidence ?? data.confidence_score ?? 0;

  // Verdict card
  const card = $("verdict-card");
  card.className = `${vClass}`;
  $("verdict-icon").textContent = getVerdictIcon(verdict);
  $("verdict-label").textContent = getVerdictLabel(verdict);
  $("verdict-sub").textContent = getVerdictSub(verdict);

  // Confidence
  $("confidence-pct").textContent = `${confidence}%`;
  const fill = $("conf-fill");
  fill.parentElement.className = `conf-bar ${vClass}`;
  fill.style.width = "0%";
  setTimeout(() => { fill.style.width = `${confidence}%`; }, 80);

  // Explanation
  const explanation = Array.isArray(data.explanation)
    ? data.explanation.join(" ")
    : data.explanation || "No explanation provided.";
  $("explanation-text").textContent = explanation;

  // What Really Happened
  if (data.whatReallyHappened || data.what_really_happened) {
    $("whathappened-text").textContent = data.whatReallyHappened || data.what_really_happened;
    $("section-whathappened").classList.remove("hidden");
  }

  // Flagged Sentences
  const flagged = data.flaggedSentences || data.flagged_sentences || [];
  if (flagged.length > 0) {
    $("flagged-list").innerHTML = flagged
      .map(s => `<div class="flagged-item">${escapeHtml(s)}</div>`)
      .join("");
    $("section-flagged").classList.remove("hidden");
  }

  // Real News Sources
  const sources = data.realNewsSources || data.real_news_sources || [];
  if (sources.length > 0) {
    $("sources-list").innerHTML = sources.slice(0, 4)
      .map(s => `
        <a class="source-item" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">
          <span class="source-title">${escapeHtml(s.title || "Source")}</span>
          <span class="source-domain">${escapeHtml(s.source || s.url)}</span>
        </a>
      `).join("");
    $("section-sources").classList.remove("hidden");
  }
}

function resetOptionalSections() {
  $("section-whathappened").classList.add("hidden");
  $("section-flagged").classList.add("hidden");
  $("section-sources").classList.add("hidden");
  $("flagged-list").innerHTML = "";
  $("sources-list").innerHTML = "";
}

async function analyzeCurrentTabContent() {
  setLoading(true);
  resetResults();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error("No active tab found");
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const paragraphs = Array.from(document.querySelectorAll("p"))
          .map((node) => node.textContent?.trim() || "")
          .filter(Boolean)
          .join("\n");
        const raw = paragraphs || document.body?.innerText || "";
        return {
          title: document.title || "",
          url: window.location.href,
          text: raw.replace(/\s+/g, " ").trim().slice(0, 6000),
        };
      },
    });

    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE",
      payload:
        result?.text && result.text.length > 200
          ? { text: `${result.title}\n\n${result.text}` }
          : { url: result?.url || tab.url || "" },
    });

    if (response?.error) {
      showError(response.error);
    } else {
      showResults(response);
    }
  } catch (err) {
    showError(err.message || "Unknown error");
  } finally {
    setLoading(false);
  }
}

async function hydrateUserState() {
  const { truthguardUser } = await chrome.storage.local.get({ truthguardUser: null });
  currentUser = truthguardUser;
  $("user-bar").classList.toggle("hidden", !currentUser);
  $("signin-btn").title = currentUser ? "Account dashboard" : "Sign in";

  if (currentUser) {
    $("user-name").textContent = currentUser.displayName || "Signed-in user";
    $("user-email").textContent = currentUser.email || currentUser.uid || "";
    await loadHistory(currentUser.uid);
  } else {
    $("history-section").classList.add("hidden");
  }
}

async function loadHistory(userId) {
  const { apiUrl } = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });
  try {
    const response = await fetch(`${normalizeApiUrl(apiUrl)}/api/history?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error(`History request failed: ${response.status}`);
    }

    const data = await response.json();
    const history = data.history || [];
    const list = $("history-list");
    list.innerHTML = "";

    if (history.length === 0) {
      $("history-section").classList.add("hidden");
      return;
    }

    history.slice(0, 5).forEach((item) => {
      const button = document.createElement("button");
      button.className = "history-item";
      button.innerHTML = `
        <div class="history-preview">${escapeHtml(item.preview || "Saved analysis")}</div>
        <div class="history-meta">${escapeHtml(item.verdict || "UNVERIFIED")} · ${item.confidence || 0}%</div>
      `;
      button.addEventListener("click", () => {
        if (item.result) {
          showResults(item.result);
        }
      });
      list.appendChild(button);
    });

    $("history-section").classList.remove("hidden");
  } catch {
    $("history-section").classList.add("hidden");
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getVerdictClass(v) {
  const l = v.toLowerCase();
  if (l === "real") return "verdict-real";
  if (l === "fake") return "verdict-fake";
  return "verdict-misleading";
}

function getVerdictIcon(v) {
  const l = v.toLowerCase();
  if (l === "real") return "✅";
  if (l === "fake") return "❌";
  return "⚠️";
}

function getVerdictLabel(v) {
  const l = v.toLowerCase();
  if (l === "real") return "Verified Real";
  if (l === "fake") return "Likely Fake";
  return "Misleading";
}

function getVerdictSub(v) {
  const l = v.toLowerCase();
  if (l === "real") return "Content appears credible and fact-checked";
  if (l === "fake") return "Content contradicts verified facts";
  return "Content may be partially inaccurate";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
