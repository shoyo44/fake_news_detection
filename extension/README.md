# 🛡️ TruthGuard Browser Extension

A **Chrome & Edge browser extension** (Manifest V3) that lets you analyze any text or URL for misinformation — directly from your browser, powered by the TruthGuard AI backend.

---

## 🚀 Quick Setup

### 1. Make sure the backend is running

```powershell
# In your project root
conda activate news
cd backend
uvicorn app.main:app --reload --port 8000
```

### 2. Load the Extension

**Chrome:**
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder in this project

**Edge:**
1. Go to `edge://extensions`
2. Enable **Developer mode** (bottom left toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🧩 How to Use

### Right-Click Analysis
1. Select any text on a webpage
2. Right-click → **"🛡️ Check with TruthGuard"**
3. A **slide-in side panel** appears with the verdict

### Popup
1. Click the **TruthGuard icon** in your browser toolbar
2. Switch between **Text** or **URL** tab
3. Paste content → click **Analyze**

### Settings
- Click ⚙️ in the popup (or right-click → Manage Extension → Options)
- Configure the backend URL if it's not on `localhost:8000`
- Use **Test Connection** to verify the backend is reachable

---

## 📁 Extension Structure

```
extension/
├── manifest.json               # MV3 manifest
├── background/
│   └── service_worker.js       # Context menu + API relay
├── content/
│   ├── content.js              # Side panel injected into pages
│   └── content.css             # Side panel styles
├── popup/
│   ├── popup.html              # Toolbar popup UI
│   ├── popup.js                # Popup logic
│   └── popup.css               # Popup styles
├── options/
│   ├── options.html            # Settings page
│   ├── options.js              # Settings logic
│   └── options.css             # Settings styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🎨 Verdict Colors

| Verdict | Color | Meaning |
|---|---|---|
| ✅ Real | Green | Credible, fact-checked content |
| ⚠️ Misleading | Amber | Partial or out-of-context information |
| ❌ Fake | Red | Contradicts verified facts |

---

## ⚠️ Notes

- The backend must be **running** for the extension to work
- CORS is already allowed for all origins in the FastAPI backend (`allow_origins=["*"]`)
- The extension **does not modify** any existing backend files
