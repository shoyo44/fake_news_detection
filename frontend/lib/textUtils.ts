export function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ") // strip HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
}

export function truncateText(text: string, limit = 4000): string {
  if (text.length <= limit) return text;

  // Try to cut at sentence boundary
  const truncated = text.slice(0, limit);
  const lastPeriod = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf(".\n"),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? ")
  );

  if (lastPeriod > limit * 0.8) {
    return truncated.slice(0, lastPeriod + 1).trim();
  }
  return truncated.trim() + "...";
}

export async function fetchURLContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TruthGuardBot/1.0; +https://truthguard.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Extract meaningful text (remove scripts, styles, nav etc.)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return truncateText(text, 5000);
  } catch (err) {
    throw new Error(
      `Failed to fetch URL: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
