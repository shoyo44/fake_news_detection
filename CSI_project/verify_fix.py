import httpx
import json

def test_hallucination():
    url = "http://localhost:8000/analyze"
    payloads = [
        "big news it is confirmed that tamil actor and politician Joseph Vijay's name is present in the Epstien files.",
        "The sun rises in the east and Joseph Vijay is in the Epstein files."
    ]
    
    for text in payloads:
        print(f"\n======================================")
        print(f"Testing claim: {text}")
        print(f"======================================")
        try:
            response = httpx.post(url, json={"text": text}, timeout=60.0)
            data = response.json()
            
            print("\n=== RESULTS ===")
            print(f"Verdict: {data.get('verdict')}")
            print(f"Confidence: {data.get('confidence_score')}%")
            print(f"Explanation: {data.get('explanation')}")
            
            claims = data.get("claims", [])
            print(f"\nClaims Extracted: {len(claims)}")
            for i, c in enumerate(claims, 1):
                print(f"{i}: {c}")

            evidence = data.get("evidence", [])
            print(f"\nEvidence Found: {len(evidence)}")
            for e in evidence:
                print(f"- {e.get('title')} ({e.get('url')})")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_hallucination()
