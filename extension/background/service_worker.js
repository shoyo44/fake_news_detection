// TruthGuard Background Service Worker
// Handles context menu creation and API communication

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

function buildApiUrl(baseUrl, path) {
  return `${normalizeApiUrl(baseUrl)}${path}`;
}

async function saveHistoryItem(baseUrl, payload, result) {
  const { truthguardUser } = await chrome.storage.local.get({ truthguardUser: null });
  if (!truthguardUser?.uid || !result?.verdict) {
    return;
  }

  const previewSource = payload.text || payload.url || "Extension analysis";
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    verdict: result.verdict,
    confidence: result.confidence ?? result.confidence_score ?? 0,
    inputType: payload.inputType,
    preview: String(previewSource).slice(0, 80),
    processedAt: result.processedAt || new Date().toISOString(),
    result,
  };

  await fetch(buildApiUrl(baseUrl, "/api/history"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: truthguardUser.uid,
      item,
    }),
  });
}

// ── Context Menu Setup ─────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL }, ({ apiUrl }) => {
    chrome.storage.sync.set({ apiUrl: normalizeApiUrl(apiUrl) });
  });
  chrome.contextMenus.create({
    id: "truthguard-analyze",
    title: "🛡️ Check with TruthGuard",
    contexts: ["selection"],
  });
});

// ── Context Menu Click ─────────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "truthguard-analyze") return;

  const selectedText = info.selectionText?.trim();
  if (!selectedText) return;

  // Notify content script: loading state
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.__tg_showPanel({ loading: true }),
  });

  // Get API URL from storage
  const { apiUrl } = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });

  try {
    const response = await fetch(buildApiUrl(apiUrl, "/api/analyze"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputType: "text", text: selectedText }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    await saveHistoryItem(apiUrl, { inputType: "text", text: selectedText }, data);

    // Send result to content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (result) => window.__tg_showPanel({ loading: false, result }),
      args: [data],
    });
  } catch (err) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (errMsg) => window.__tg_showPanel({ loading: false, error: errMsg }),
      args: [err.message],
    });
  }
});

// ── Message Listener (from popup) ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE") {
    handleAnalyze(message.payload).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true; // keep channel open for async response
  }
});

async function handleAnalyze({ text, url }) {
  const { apiUrl } = await chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL });
  const body = text
    ? { inputType: "text", text }
    : { inputType: "url", url };

  const response = await fetch(buildApiUrl(apiUrl, "/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const result = await response.json();
  await saveHistoryItem(apiUrl, body, result);
  return result;
}
