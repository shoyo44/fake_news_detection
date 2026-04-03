"""
TruthGuard - Tavily API Test Script
Run this to verify your Tavily API key is working correctly.
Usage: python test_tavily.py
"""

import os
from dotenv import load_dotenv

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not TAVILY_API_KEY or TAVILY_API_KEY == "your_tavily_api_key_here":
    print("❌ ERROR: Please set your TAVILY_API_KEY in the .env file first.")
    exit(1)

try:
    from tavily import TavilyClient
except ImportError:
    print("❌ tavily-python not installed. Run: pip install tavily-python python-dotenv")
    exit(1)

client = TavilyClient(api_key=TAVILY_API_KEY)

print("=" * 60)
print("🛡️  TruthGuard — Tavily API Test")
print("=" * 60)

# ── Test 1: Basic Search ─────────────────────────────────────
print("\n📡 Test 1: Basic Search")
print("   Query: 'Did 5G towers cause COVID-19?'")

try:
    result = client.search(
        query="Did 5G towers cause COVID-19?",
        search_depth="basic",
        max_results=3
    )

    print(f"   ✅ Search successful! Got {len(result['results'])} results\n")
    for i, r in enumerate(result["results"], 1):
        print(f"   [{i}] {r['title']}")
        print(f"       URL    : {r['url']}")
        print(f"       Score  : {r.get('score', 'N/A')}")
        print(f"       Snippet: {r['content'][:120]}...")
        print()

except Exception as e:
    print(f"   ❌ Search failed: {e}")
    exit(1)

# ── Test 2: Real News Finder (trusted domains only) ──────────
print("\n📰 Test 2: Real News Finder (Trusted Sources Only)")
print("   Searching for real story about: '5G COVID misinformation'")

TRUSTED_DOMAINS = ["bbc.com", "reuters.com", "apnews.com", "npr.org", "theguardian.com"]

try:
    real_news = client.search(
        query="5G towers COVID-19 misinformation fact check",
        search_depth="advanced",
        max_results=3,
        include_domains=TRUSTED_DOMAINS
    )

    print(f"   ✅ Found {len(real_news['results'])} credible sources!\n")
    for i, r in enumerate(real_news["results"], 1):
        domain = r["url"].split("/")[2]
        print(f"   [{i}] {r['title']}")
        print(f"       Source : {domain}")
        print(f"       URL    : {r['url']}")
        print(f"       Snippet: {r['content'][:120]}...")
        print()

except Exception as e:
    print(f"   ❌ Real news search failed: {e}")

# ── Test 3: Get Answer (Answer-style RAG query) ───────────────
print("\n🤖 Test 3: Q&A / Context Extraction")
print("   Question: 'What is the truth about 5G and COVID-19?'")

try:
    answer = client.qna_search(
        query="What is the scientific consensus on whether 5G towers caused COVID-19?"
    )
    print(f"   ✅ Answer retrieved!\n")
    print(f"   Answer: {answer}\n")

except Exception as e:
    print(f"   ⚠️  Q&A search failed (non-critical): {e}\n")

print("=" * 60)
print("✅ Tavily API is working correctly! Ready to build TruthGuard.")
print("=" * 60)
