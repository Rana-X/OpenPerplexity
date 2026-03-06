import { getSearxngURL } from './config/serverRegistry';

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (
  query: string,
  opts?: SearxngSearchOptions,
) => {
  const searxngURL = getSearxngURL();

  if (!searxngURL) {
    throw new Error(
      'SearXNG URL is not configured. Update Search settings before running web search.',
    );
  }

  const url = new URL(`${searxngURL}/search?format=json`);
  url.searchParams.append('q', query);

  if (opts) {
    Object.keys(opts).forEach((key) => {
      const value = opts[key as keyof SearxngSearchOptions];
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(','));
        return;
      }
      url.searchParams.append(key, value as string);
    });
  }

  let res: Response;

  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(
      `SearXNG is unreachable at ${searxngURL}. Start it or update Search settings.`,
    );
  }

  if (!res.ok) {
    throw new Error(
      `SearXNG returned ${res.status} ${res.statusText}. Check the Search settings and service health.`,
    );
  }

  let data: any;

  try {
    data = await res.json();
  } catch (err) {
    throw new Error(
      `SearXNG returned invalid JSON from ${searxngURL}. Check that JSON responses are enabled.`,
    );
  }

  const results: SearxngSearchResult[] = data.results;
  const suggestions: string[] = data.suggestions;

  return { results, suggestions };
};
