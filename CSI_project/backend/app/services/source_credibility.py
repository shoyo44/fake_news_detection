"""
Domain-level credibility scoring based on known lists and heuristics.
"""

KNOWN_CREDIBLE = {
    "bbc.com", "reuters.com", "apnews.com", "npr.org", "theguardian.com",
    "nytimes.com", "washingtonpost.com", "bloomberg.com", "bbc.co.uk",
    "economist.com", "nature.com", "science.org", "who.int", "cdc.gov",
    "nih.gov", "nasa.gov", "britannica.com", "snopes.com", "factcheck.org",
    "politifact.com", "fullfact.org",
    "thehindu.com", "timesofindia.indiatimes.com", "hindustantimes.com",
    "indianexpress.com", "ndtv.com", "indiatoday.in", "theprint.in",
    "dailythanthi.com", "dinamalar.com", "dinakaran.com", "puthiyathalaimurai.com", "news18.com",
}

KNOWN_SATIRE = {
    "theonion.com", "babylonbee.com", "clickhole.com", "waterfordwhispersnews.com",
}

KNOWN_UNRELIABLE = {
    "naturalnews.com", "infowars.com", "breitbart.com", "beforeitsnews.com",
    "yournewswire.com", "worldnewsdailyreport.com", "empirenews.net",
    "abcnews-us.com", "newslo.com",
}

SUSPICIOUS_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".xyz"}


def score_domain(domain: str) -> dict:
    """
    Returns:
      credibility_score (0–100)
      is_known_satire (bool)
      is_known_unreliable (bool)
      flags (list[str])
    """
    domain = domain.lower().replace("www.", "")
    flags = []
    score = 50  # neutral baseline

    if domain in KNOWN_CREDIBLE:
        score = 90
        flags.append("trusted_source")
    elif domain in KNOWN_SATIRE:
        score = 20
        flags.append("known_satire_site")
    elif domain in KNOWN_UNRELIABLE:
        score = 10
        flags.append("known_unreliable_source")
    else:
        # Heuristics for unknown domains
        tld = "." + domain.split(".")[-1] if "." in domain else ""
        if tld in SUSPICIOUS_TLDS:
            score -= 20
            flags.append("suspicious_tld")
        if any(kw in domain for kw in ["truth", "real", "secret", "expose", "alert", "breaking"]):
            score -= 15
            flags.append("sensational_domain_name")
        if domain.count(".") > 2:
            score -= 10
            flags.append("multiple_subdomains")

    score = max(0, min(100, score))

    return {
        "credibility_score": score,
        "is_known_satire": domain in KNOWN_SATIRE,
        "is_known_unreliable": domain in KNOWN_UNRELIABLE,
        "flags": flags,
    }
