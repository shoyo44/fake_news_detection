import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}


async def scrape_url(url: str) -> dict:
    """
    Fetch a URL and extract clean article text.
    Returns: {title, content, domain}
    """
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=HEADERS)
        response.raise_for_status()
        html = response.text

    soup = BeautifulSoup(html, "lxml")

    # Remove noise elements
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "ads"]):
        tag.decompose()

    # Get title
    title = ""
    if soup.title:
        title = soup.title.get_text(strip=True)
    elif soup.find("h1"):
        title = soup.find("h1").get_text(strip=True)

    # Get main content — prefer article/main tags
    content_tag = (
        soup.find("article")
        or soup.find("main")
        or soup.find("div", {"id": "content"})
        or soup.find("div", {"class": "content"})
        or soup.body
    )

    content = content_tag.get_text(separator=" ", strip=True) if content_tag else ""

    # Trim to 4000 chars for LLM context
    content = content[:4000]

    return {"title": title, "content": content, "domain": domain}
