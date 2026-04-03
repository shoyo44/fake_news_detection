// TruthGuard Options Page Script

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

const apiInput = document.getElementById("api-url");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const testBtn = document.getElementById("test-btn");
const statusEl = document.getElementById("status");
const testResultEl = document.getElementById("test-result");

// ── Load Saved Settings ──────────────────────────────────────────────────────
chrome.storage.sync.get({ apiUrl: DEFAULT_API_URL }, ({ apiUrl }) => {
  apiInput.value = normalizeApiUrl(apiUrl);
});

// ── Save ─────────────────────────────────────────────────────────────────────
saveBtn.addEventListener("click", () => {
  const url = normalizeApiUrl(apiInput.value);
  apiInput.value = url;
  chrome.storage.sync.set({ apiUrl: url }, () => {
    showStatus(statusEl, "✅ Settings saved!", true);
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  apiInput.value = DEFAULT_API_URL;
  chrome.storage.sync.set({ apiUrl: DEFAULT_API_URL }, () => {
    showStatus(statusEl, "✅ Reset to default URL", true);
  });
});

// ── Test Connection ───────────────────────────────────────────────────────────
testBtn.addEventListener("click", async () => {
  const url = normalizeApiUrl(apiInput.value);
  testBtn.textContent = "Testing…";
  testBtn.disabled = true;
  testResultEl.classList.add("hidden");

  try {
    const res = await fetch(`${url}/api/history?userId=extension-health-check`, {
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok || res.status === 400) {
      showStatus(
        testResultEl,
        `✅ Connection successful! TruthGuard website API is reachable.<br/><small style="opacity:0.7">${url}/api/history</small>`,
        true
      );
    } else {
      showStatus(
        testResultEl,
        `⚠️ Server responded with HTTP ${res.status}. Check if the backend is configured correctly.`,
        false
      );
    }
  } catch (err) {
    const isTimeout = err.name === "TimeoutError";
    showStatus(
      testResultEl,
      isTimeout
        ? `❌ Connection timed out. Make sure the website is running at <strong>${url}</strong>.`
        : `❌ Could not connect: ${err.message}`,
      false
    );
  } finally {
    testBtn.textContent = "Test Connection";
    testBtn.disabled = false;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(el, msg, success) {
  el.innerHTML = msg;
  el.className = success ? "status-success" : "status-error";
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 5000);
}
