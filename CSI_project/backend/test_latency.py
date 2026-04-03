import asyncio
import time
from app.agents import orchestrator

async def main():
    start = time.time()
    print("Starting analysis...")
    text = "The earth is flat and the sun goes around it. This is a known fact verified by many people online." * 5 # slightly longer
    try:
        res = await orchestrator.run(text=text)
        print(f"\nTotal Done in {time.time() - start:.2f} seconds.")
        print(f"Processing time ms: {res.processing_time_ms}")
        print(f"Verdict: {res.verdict}")
        print(f"Confidence: {res.confidence_score}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
