/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * News item from tech websites
 */
export interface NewsItem {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  image?: string;
}

/**
 * Response type for /api/news
 */
export interface NewsResponse {
  news: NewsItem[];
  cached?: boolean;
  lastUpdate?: string;
  error?: string;
}
