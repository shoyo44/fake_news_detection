import streamlit as st
import httpx
import asyncio

BACKEND_URL = "http://localhost:8000"

# ── Page config ─────────────────────────────────────────────
st.set_page_config(
    page_title="TruthGuard",
    page_icon="🛡️",
    layout="centered",
)

# ── Custom CSS ───────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    .main { background: #0f1117; }

    .verdict-real    { background:#0d3b2e; border-left:5px solid #22c55e;
                       padding:18px 20px; border-radius:10px; color:#4ade80; }
    .verdict-fake    { background:#3b0d1a; border-left:5px solid #ef4444;
                       padding:18px 20px; border-radius:10px; color:#f87171; }
    .verdict-mislead { background:#3b2e0d; border-left:5px solid #f59e0b;
                       padding:18px 20px; border-radius:10px; color:#fcd34d; }

    .source-card { background:#1e2130; border-radius:10px;
                   padding:14px 18px; margin:8px 0; border:1px solid #2d3148; }
    .source-card a { color:#60a5fa; text-decoration:none; font-weight:600; }
    .source-card a:hover { text-decoration:underline; }

    .section-title { color:#94a3b8; font-size:0.8rem;
                     text-transform:uppercase; letter-spacing:1px;
                     margin-bottom:8px; font-weight:600; }

    .stat-box { background:#1e2130; border-radius:8px;
                padding:12px 16px; text-align:center; border:1px solid #2d3148; }
    .stat-box .val { font-size:1.8rem; font-weight:700; }
    .stat-box .lbl { font-size:0.75rem; color:#94a3b8; margin-top:2px; }

    .tag { display:inline-block; background:#2d3148; color:#a5b4fc;
           border-radius:20px; padding:3px 12px; font-size:0.78rem; margin:3px; }

    .flagged { background:#2d1f1f; border-left:3px solid #f87171;
               padding:8px 14px; border-radius:6px; color:#fca5a5;
               font-size:0.88rem; margin:5px 0; }
</style>
""", unsafe_allow_html=True)


# ── Header ───────────────────────────────────────────────────
st.markdown("# 🛡️ TruthGuard")
st.markdown("##### AI-Powered Fake News Detection — paste your text or a URL below")
st.divider()


# ── Input ────────────────────────────────────────────────────
mode = st.radio("Input mode", ["📝 Text", "🔗 URL"], horizontal=True)

if mode == "📝 Text":
    user_input = st.text_area(
        "Paste the news content you want to verify",
        placeholder="e.g. Scientists confirm 5G towers spread COVID-19 through radio waves...",
        height=160,
    )
    payload = {"text": user_input}
else:
    user_input = st.text_input(
        "Enter a news article URL",
        placeholder="https://example.com/some-article",
    )
    payload = {"url": user_input}

analyze_btn = st.button("🔍 Analyze", use_container_width=True, type="primary")


# ── Analysis ─────────────────────────────────────────────────
def run_analysis(payload):
    with httpx.Client(timeout=90.0) as client:
        response = client.post(f"{BACKEND_URL}/analyze", json=payload)
        response.raise_for_status()
        return response.json()


if analyze_btn:
    if not user_input or not user_input.strip():
        st.warning("Please enter some text or a URL first.")
    else:
        with st.spinner("Analyzing with AI agents… this may take 10–30 seconds ⏳"):
            try:
                data = run_analysis(payload)
            except httpx.ConnectError:
                st.error("❌ Cannot connect to backend at `http://localhost:8000`. Make sure the server is running.")
                st.stop()
            except Exception as e:
                st.error(f"❌ Error: {e}")
                st.stop()

        verdict = data.get("verdict", "Unknown")
        score   = data.get("confidence_score", 0)
        explanation = data.get("explanation", "")
        claims      = data.get("claims", [])
        manip       = data.get("manipulation_score", 0)
        bias        = data.get("bias_score", 0)
        bias_type   = data.get("bias_type", "None")
        sentiment   = data.get("sentiment_intensity", 0)
        flagged     = data.get("flagged_sentences", [])
        src_cred    = data.get("source_credibility", 50)
        evidence    = data.get("evidence", [])
        real_sources = data.get("real_news_sources", [])
        what_really  = data.get("what_really_happened")
        proc_time    = data.get("processing_time_ms", 0)

        # ── Verdict banner ────────────────────────────────────
        st.markdown("")
        verdict_class = {
            "Real": "verdict-real",
            "Fake": "verdict-fake",
            "Misleading": "verdict-mislead",
        }.get(verdict, "verdict-mislead")

        verdict_icon = {"Real": "✅", "Fake": "🚨", "Misleading": "⚠️"}.get(verdict, "❓")

        st.markdown(f"""
        <div class="{verdict_class}">
            <div style="font-size:1.7rem; font-weight:700;">{verdict_icon} {verdict}</div>
            <div style="margin-top:6px; font-size:0.97rem; color:#e2e8f0;">{explanation}</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("")

        # ── Stats row 1 ───────────────────────────────────────
        col1, col2, col3, col4 = st.columns(4)

        manip_color   = "#22c55e" if manip < 3 else "#f59e0b" if manip < 7 else "#ef4444"
        score_color   = "#22c55e" if score >= 65 else "#f59e0b" if score >= 40 else "#ef4444"

        with col1:
            st.markdown(f"""<div class="stat-box">
                <div class="val" style="color:{score_color};">{score}</div>
                <div class="lbl">Confidence %</div></div>""", unsafe_allow_html=True)
        with col2:
            st.markdown(f"""<div class="stat-box">
                <div class="val" style="color:{manip_color};">{manip:.1f}</div>
                <div class="lbl">Manipulation</div></div>""", unsafe_allow_html=True)
        with col3:
            st.markdown(f"""<div class="stat-box">
                <div class="val">{src_cred}</div>
                <div class="lbl">Source Credibility</div></div>""", unsafe_allow_html=True)
        with col4:
            st.markdown(f"""<div class="stat-box">
                <div class="val">{proc_time // 1000}s</div>
                <div class="lbl">Processing Time</div></div>""", unsafe_allow_html=True)

        st.markdown("")
        
        # ── Stats row 2 (New Metrics) ─────────────────────────
        col1, col2 = st.columns(2)
        
        bias_color = "#22c55e" if bias < 3 else "#f59e0b" if bias < 7 else "#ef4444"
        sent_color = "#60a5fa" if sentiment < 4 else "#f59e0b" if sentiment < 7 else "#ef4444"
        
        with col1:
            st.markdown(f"""<div class="stat-box">
                <div class="val" style="color:{bias_color};">{bias:.1f} <span style="font-size:1rem; color:#94a3b8;">({bias_type})</span></div>
                <div class="lbl">Ideological Bias</div></div>""", unsafe_allow_html=True)
        with col2:
            st.markdown(f"""<div class="stat-box">
                <div class="val" style="color:{sent_color};">{sentiment:.1f}</div>
                <div class="lbl">Emotional Intensity</div></div>""", unsafe_allow_html=True)

        st.markdown("")

        # ── Extracted claims ──────────────────────────────────
        if claims:
            st.markdown('<div class="section-title">🔎 Extracted Claims</div>', unsafe_allow_html=True)
            for c in claims:
                st.markdown(f'<span class="tag">📌 {c}</span>', unsafe_allow_html=True)
            st.markdown("")

        # ── Flagged sentences ─────────────────────────────────
        if flagged:
            st.markdown('<div class="section-title">⚠️ Flagged Manipulative Sentences</div>', unsafe_allow_html=True)
            for f in flagged:
                st.markdown(f'<div class="flagged">"{f}"</div>', unsafe_allow_html=True)
            st.markdown("")

        # ── What really happened ──────────────────────────────
        if what_really:
            st.markdown('<div class="section-title">📰 What Really Happened</div>', unsafe_allow_html=True)
            st.info(what_really)

        # ── Real news sources ─────────────────────────────────
        if real_sources:
            st.markdown('<div class="section-title">✅ Credible Sources on This Story</div>', unsafe_allow_html=True)
            for s in real_sources:
                st.markdown(f"""
                <div class="source-card">
                    <a href="{s['url']}" target="_blank">{s['title']}</a>
                    <div style="font-size:0.78rem; color:#64748b; margin-top:4px;">
                        🌐 {s['source']}
                    </div>
                    <div style="font-size:0.85rem; color:#94a3b8; margin-top:6px;">{s['summary']}</div>
                </div>
                """, unsafe_allow_html=True)
            st.markdown("")

        # ── Evidence ──────────────────────────────────────────
        if evidence:
            with st.expander(f"🔬 Cross-Reference Evidence ({len(evidence)} results)"):
                for e in evidence:
                    st.markdown(f"**Claim:** {e.get('claim', '')}")
                    st.markdown(f"[{e.get('title', e.get('url', ''))}]({e.get('url', '')}) — {e.get('snippet', '')}")
                    st.divider()

        # ── Footer ────────────────────────────────────────────
        st.markdown(f"<div style='color:#475569; font-size:0.75rem; text-align:right;'>Processed in {proc_time}ms</div>", unsafe_allow_html=True)


# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 🛡️ TruthGuard")
    st.markdown("Multi-agent AI pipeline")
    st.divider()

    # Backend health check
    try:
        health = httpx.get(f"{BACKEND_URL}/health", timeout=3.0).json()
        cf_ok  = health.get("cloudflare_connected", False)
        tv_ok  = health.get("tavily_connected", False)
        st.markdown("**Backend Status**")
        st.markdown(f"{'🟢' if cf_ok else '🔴'} Cloudflare AI")
        st.markdown(f"{'🟢' if tv_ok else '🔴'} Tavily Search")
    except Exception:
        st.error("⚠️ Backend offline")

    st.divider()
    st.markdown("**Verdict Guide**")
    st.markdown("✅ **Real** — credible, verified")
    st.markdown("⚠️ **Misleading** — partial truths / distorted context")
    st.markdown("🚨 **Fake** — fabricated or debunked")
