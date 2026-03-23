import { RequestHandler } from "express";

interface NewsItem {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  image?: string;
}

// RSS feed URLs from major tech news sources
const RSS_FEEDS = [
  {
    name: "TechCrunch",
    url: "https://feeds.techcrunch.com/feed",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
  },
  {
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
  },
  {
    name: "CNET",
    url: "https://www.cnet.com/feed",
  },
  {
    name: "Engadget",
    url: "https://www.engadget.com/rss.xml",
  },
  {
    name: "Gizmodo",
    url: "https://gizmodo.com/rss",
  },
  {
    name: "Digital Trends",
    url: "https://www.digitaltrends.com/feed",
  },
  {
    name: "Mashable",
    url: "https://mashable.com/feeds/rss/all.xml",
  },
];

// Sample news data for development/demo purposes
const SAMPLE_NEWS: NewsItem[] = [
  {
    title: "AI Breakthroughs in Enterprise Software Reshape Digital Landscape",
    description:
      "Major technology companies announce integration of advanced AI models into enterprise software solutions, promising significant productivity improvements and cost reduction.",
    link: "https://techcrunch.com",
    source: "TechCrunch",
    pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Cloud Computing Security: New Standards Emerging for Enterprise Protection",
    description:
      "Industry leaders establish new security frameworks for cloud-based enterprise solutions, addressing growing concerns about data protection and compliance.",
    link: "https://www.theverge.com",
    source: "The Verge",
    pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "DevOps Practices Transform Software Development Cycles",
    description:
      "Companies report significant improvements in development efficiency after adopting modern DevOps practices and automation tools.",
    link: "https://arstechnica.com",
    source: "Ars Technica",
    pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Cybersecurity Threats Evolve: What Enterprises Need to Know",
    description:
      "Security analysts warn of emerging cyber threats targeting enterprise infrastructure, emphasizing the need for proactive defense strategies.",
    link: "https://www.bleepingcomputer.com",
    source: "BleepingComputer",
    pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "ERP Systems Get Smarter with Machine Learning Integration",
    description:
      "Next-generation ERP platforms leverage machine learning to optimize business processes and provide actionable insights.",
    link: "https://www.wired.com",
    source: "Wired",
    pubDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "API-First Architecture Becomes Industry Standard",
    description:
      "Businesses increasingly adopt API-first strategies to improve integration capabilities and enable faster innovation cycles.",
    link: "https://www.cnet.com",
    source: "CNET",
    pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Data Analytics Drives Strategic Business Decisions",
    description:
      "Companies leverage advanced analytics platforms to extract insights from massive datasets and make data-driven decisions.",
    link: "https://www.engadget.com",
    source: "Engadget",
    pubDate: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Legacy System Modernization: A Roadmap for Success",
    description:
      "Organizations develop strategic approaches to modernize legacy systems while maintaining business continuity and reducing risks.",
    link: "https://gizmodo.com",
    source: "Gizmodo",
    pubDate: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Blockchain Technology Finds New Applications in Supply Chain",
    description:
      "Enterprises explore blockchain solutions for supply chain transparency, traceability, and improved operational efficiency.",
    link: "https://www.digitaltrends.com",
    source: "Digital Trends",
    pubDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Low-Code Platforms Accelerate Digital Transformation",
    description:
      "Development teams adopt low-code and no-code platforms to reduce time-to-market and democratize application development.",
    link: "https://mashable.com",
    source: "Mashable",
    pubDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "5G Technology Enables New Enterprise Use Cases",
    description:
      "Deployment of 5G networks opens new possibilities for IoT applications, real-time communication, and edge computing.",
    link: "https://www.pcmag.com",
    source: "PCMag",
    pubDate: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Customer Data Platforms Revolutionize Marketing Strategy",
    description:
      "Businesses implement CDP solutions to unify customer data and deliver more personalized, targeted marketing campaigns.",
    link: "https://www.techradar.com",
    source: "TechRadar",
    pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Cache to store fetched news
let cachedNews: NewsItem[] = [...SAMPLE_NEWS];
let lastFetchTime = Date.now();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to parse RSS XML into NewsItems
function parseRSSFeed(xmlText: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Simple regex-based RSS parser (production would use proper XML parser)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    // Extract title
    const titleMatch = itemContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "Untitled";

    // Extract description
    const descMatch = itemContent.match(
      /<description[^>]*>([^<]*)<\/description>/i
    );
    const description = descMatch ? descMatch[1] : "";

    // Extract link
    const linkMatch = itemContent.match(/<link[^>]*>([^<]+)<\/link>/i);
    const link = linkMatch ? linkMatch[1] : "";

    // Extract pubDate
    const dateMatch = itemContent.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i);
    const pubDate = dateMatch ? dateMatch[1] : new Date().toISOString();

    if (title && link) {
      items.push({
        title: decodeHTMLEntities(title),
        description: decodeHTMLEntities(description),
        link,
        source,
        pubDate,
      });
    }
  }

  return items;
}

// Helper function to decode HTML entities
function decodeHTMLEntities(text: string): string {
  const entities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
  };

  return text.replace(/&[a-zA-Z]+;/g, (match) => entities[match] || match);
}

// Function to fetch news from all sources
async function fetchAllNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (response.ok) {
        const xmlText = await response.text();
        const feedItems = parseRSSFeed(xmlText, feed.name);
        allNews.push(...feedItems.slice(0, 3)); // Get top 3 from each source
      }
    } catch (error) {
      console.error(`Error fetching from ${feed.name}:`, error);
    }
  }

  // Sort by date and remove duplicates
  const uniqueNews = Array.from(
    new Map(allNews.map((item) => [item.title, item])).values()
  );

  return uniqueNews.sort(
    (a, b) =>
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}

export const handleGetNews: RequestHandler = async (req, res) => {
  try {
    const now = Date.now();

    // Use cache if it's still fresh
    if (cachedNews.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return res.json({
        news: cachedNews.slice(0, 20),
        cached: true,
        lastUpdate: new Date(lastFetchTime).toISOString(),
      });
    }

    // Try to fetch fresh news
    console.log("Attempting to fetch fresh news from RSS feeds...");
    try {
      const freshNews = await fetchAllNews();

      if (freshNews.length > 0) {
        // Update cache with real news
        cachedNews = freshNews.slice(0, 20);
        lastFetchTime = now;

        return res.json({
          news: cachedNews,
          cached: false,
          lastUpdate: new Date(lastFetchTime).toISOString(),
        });
      }
    } catch (fetchError) {
      console.log(
        "Could not fetch from external feeds, using sample data:",
        fetchError
      );
    }

    // Fallback to sample data if real news fetch fails
    res.json({
      news: SAMPLE_NEWS.slice(0, 20),
      cached: true,
      lastUpdate: new Date().toISOString(),
      note: "Using sample news data - real feeds will be available when internet access is available",
    });
  } catch (error) {
    console.error("Error in news handler:", error);
    res.status(500).json({
      error: "Failed to fetch news",
      news: SAMPLE_NEWS.slice(0, 10), // Return sample data as fallback
    });
  }
};
