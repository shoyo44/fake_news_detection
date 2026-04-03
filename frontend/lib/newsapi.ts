export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

// NewsAPI (works on localhost with free tier)
async function fetchFromNewsAPI(query: string): Promise<NewsArticle[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=5&sortBy=relevancy&language=en`,
      {
        headers: { "X-Api-Key": key },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.articles || []).map(
      (a: {
        title?: string;
        description?: string;
        url?: string;
        source?: { name?: string };
        publishedAt?: string;
      }) => ({
        title: a.title || "",
        description: a.description || "",
        url: a.url || "",
        source: a.source?.name || "Unknown",
        publishedAt: a.publishedAt || "",
      })
    );
  } catch {
    return [];
  }
}

// GNews API (free tier: 100 req/day, works in production)
async function fetchFromGNews(query: string): Promise<NewsArticle[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&max=5&lang=en&token=${key}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.articles || []).map(
      (a: {
        title?: string;
        description?: string;
        url?: string;
        source?: { name?: string };
        publishedAt?: string;
      }) => ({
        title: a.title || "",
        description: a.description || "",
        url: a.url || "",
        source: a.source?.name || "Unknown",
        publishedAt: a.publishedAt || "",
      })
    );
  } catch {
    return [];
  }
}

export async function fetchArticles(query: string): Promise<NewsArticle[]> {
  // Try NewsAPI first (better quality), fall back to GNews
  const newsApiResults = await fetchFromNewsAPI(query);
  if (newsApiResults.length > 0) return newsApiResults;

  const gnewsResults = await fetchFromGNews(query);
  return gnewsResults;
}

export async function fetchArticlesForClaims(
  claims: string[]
): Promise<NewsArticle[]> {
  if (claims.length === 0) return [];

  const queries = buildSearchQueries(claims);
  const merged = new Map<string, NewsArticle>();

  for (const query of queries) {
    const results = await fetchArticles(query);
    for (const article of results) {
      if (!article.url) continue;
      if (!merged.has(article.url)) {
        merged.set(article.url, article);
      }
    }
    if (merged.size >= 8) break;
  }

  return Array.from(merged.values()).slice(0, 8);
}

// Compute how many shared words (rough match score)
export function computeMatchScore(
  claim: string,
  article: NewsArticle
): number {
  const claimWords = new Set(
    claim
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4)
  );
  const articleText =
    `${article.title} ${article.description}`.toLowerCase();
  const articleWords = articleText.split(/\W+/).filter((w) => w.length > 4);

  if (claimWords.size === 0) return 0;
  const matches = articleWords.filter((w) => claimWords.has(w)).length;
  return Math.min(1, matches / (claimWords.size * 1.5));
}

const STOP_WORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "have",
  "has",
  "been",
  "were",
  "will",
  "would",
  "could",
  "should",
  "about",
  "after",
  "before",
  "there",
  "their",
  "claim",
  "claims",
  "stated",
  "states",
  "says",
  "said",
  "according",
  "reportedly",
  "report",
  "reports",
  "breaking",
  "news",
  "statement",
  "authenticity",
  "determine",
  "insufficient",
  "evidence",
]);

const RUMOR_TERMS = [
  "dead",
  "died",
  "death",
  "killed",
  "passed away",
  "health",
  "hospitalized",
  "resigned",
  "resignation",
  "arrested",
  "arrest",
];

function buildSearchQueries(claims: string[]): string[] {
  const queries = new Set<string>();

  for (const claim of claims.slice(0, 3)) {
    const normalized = normalizeClaim(claim);
    const entity = extractEntityQuery(normalized);

    if (normalized) queries.add(normalized.slice(0, 120));
    if (entity) queries.add(entity);

    const rumorQueries = buildRumorQueries(normalized, entity);
    for (const query of rumorQueries) {
      queries.add(query);
    }
  }

  if (queries.size === 0) {
    const fallback = claims.join(" ").slice(0, 120).trim();
    if (fallback) queries.add(fallback);
  }

  return Array.from(queries);
}

function normalizeClaim(claim: string): string {
  return claim
    .replace(/^the claim (states|is|says) that\s+/i, "")
    .replace(/^it (is|was) (reported|claimed) that\s+/i, "")
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEntityQuery(claim: string): string {
  const cleaned = claim
    .replace(/\b(is|was|were|are|be|being|been|dead|died|death|killed|passed away|hospitalized|resigned|arrested)\b/gi, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()));

  const entity = cleaned.slice(0, 6).join(" ").trim();
  return entity;
}

function buildRumorQueries(claim: string, entity: string): string[] {
  const queries: string[] = [];
  const lower = claim.toLowerCase();

  if (!entity) return queries;

  if (/\b(dead|died|death|passed away|killed)\b/i.test(lower)) {
    queries.push(`${entity} dead`);
    queries.push(`${entity} health`);
  }

  if (/\b(resigned|resignation)\b/i.test(lower)) {
    queries.push(`${entity} resignation`);
  }

  if (/\b(arrested|arrest)\b/i.test(lower)) {
    queries.push(`${entity} arrested`);
  }

  if (!RUMOR_TERMS.some((term) => lower.includes(term))) {
    queries.push(`${entity} latest`);
  }

  return queries;
}
