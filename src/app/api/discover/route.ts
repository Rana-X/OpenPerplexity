import { searchSearxng } from '@/lib/searxng';
import { buildDiscoverThumbnailPlaceholder } from '@/lib/discover';

const websitesForTopic = {
  tech: {
    query: ['technology news', 'latest tech', 'AI', 'science and innovation'],
    links: ['techcrunch.com', 'wired.com', 'theverge.com'],
  },
  finance: {
    query: ['finance news', 'economy', 'stock market', 'investing'],
    links: ['bloomberg.com', 'cnbc.com', 'marketwatch.com'],
  },
  art: {
    query: ['art news', 'culture', 'modern art', 'cultural events'],
    links: ['artnews.com', 'hyperallergic.com', 'theartnewspaper.com'],
  },
  sports: {
    query: ['sports news', 'latest sports', 'cricket football tennis'],
    links: ['espn.com', 'bbc.com/sport', 'skysports.com'],
  },
  entertainment: {
    query: ['entertainment news', 'movies', 'TV shows', 'celebrities'],
    links: ['hollywoodreporter.com', 'variety.com', 'deadline.com'],
  },
};

type Topic = keyof typeof websitesForTopic;

type DiscoverArticle = {
  title: string;
  content: string;
  url: string;
  thumbnail: string;
};

const decodeEntities = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

const stripHtml = (text: string) =>
  decodeEntities(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const getTagContent = (input: string, tag: string) =>
  input.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1]?.trim() ||
  '';

const normalizeSearxngResults = (results: any[], topic: Topic) =>
  results
    .filter((item) => item?.title && item?.url)
    .map(
      (item): DiscoverArticle => ({
        title: item.title,
        content: item.content || item.author || 'OpenPerplexity discover feed',
        url: item.url,
        thumbnail:
          item.thumbnail ||
          item.img_src ||
          item.thumbnail_src ||
          buildDiscoverThumbnailPlaceholder(topic),
      }),
    );

const fetchGoogleNewsFallback = async (
  topic: Topic,
  mode: 'normal' | 'preview',
) => {
  const selectedTopic = websitesForTopic[topic];
  const query = selectedTopic.query.join(' OR ');
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'OpenPerplexity/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`Fallback feed request failed with ${res.status}`);
  }

  const xml = await res.text();
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const limit = mode === 'preview' ? 8 : 18;

  return itemMatches.slice(0, limit).map(
    ([, item]): DiscoverArticle => {
      const title = stripHtml(getTagContent(item, 'title'));
      const url = decodeEntities(getTagContent(item, 'link'));
      const source = stripHtml(getTagContent(item, 'source'));
      const pubDate = stripHtml(getTagContent(item, 'pubDate'));
      const description = stripHtml(getTagContent(item, 'description'))
        .replace(title, '')
        .trim();
      const content =
        [source, pubDate].filter(Boolean).join(' • ') ||
        description ||
        'OpenPerplexity discover feed';

      return {
        title,
        content,
        url,
        thumbnail: buildDiscoverThumbnailPlaceholder(source || topic),
      };
    },
  );
};

export const GET = async (req: Request) => {
  try {
    const params = new URL(req.url).searchParams;

    const mode: 'normal' | 'preview' =
      (params.get('mode') as 'normal' | 'preview') || 'normal';
    const topic: Topic = (params.get('topic') as Topic) || 'tech';

    const selectedTopic = websitesForTopic[topic];

    let data: DiscoverArticle[] = [];

    try {
      if (mode === 'normal') {
        const seenUrls = new Set();

        data = normalizeSearxngResults(
          (
            await Promise.all(
              selectedTopic.links.flatMap((link) =>
                selectedTopic.query.map(async (query) => {
                  return (
                    await searchSearxng(`site:${link} ${query}`, {
                      engines: ['bing news'],
                      pageno: 1,
                      language: 'en',
                    })
                  ).results;
                }),
              ),
            )
          )
            .flat()
            .filter((item) => {
              const url = item.url?.toLowerCase().trim();
              if (seenUrls.has(url)) return false;
              seenUrls.add(url);
              return true;
            })
            .sort(() => Math.random() - 0.5),
          topic,
        );
      } else {
        data = normalizeSearxngResults(
          (
            await searchSearxng(
              `site:${selectedTopic.links[Math.floor(Math.random() * selectedTopic.links.length)]} ${selectedTopic.query[Math.floor(Math.random() * selectedTopic.query.length)]}`,
              {
                engines: ['bing news'],
                pageno: 1,
                language: 'en',
              },
            )
          ).results,
          topic,
        );
      }
    } catch (primaryError) {
      console.error(
        `Discover primary source failed for ${topic}, falling back to RSS: ${primaryError}`,
      );
      data = await fetchGoogleNewsFallback(topic, mode);
    }

    return Response.json(
      {
        blogs: data,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(`An error occurred in discover route: ${err}`);
    return Response.json(
      {
        blogs: [],
        message: 'An error has occurred',
      },
      {
        status: 200,
      },
    );
  }
};
