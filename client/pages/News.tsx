import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { useEffect, useState } from "react";
import { ExternalLink, Loader } from "lucide-react";

interface NewsItem {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  image?: string;
}

export default function News() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/news");
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        setNews(data.news || []);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news. Please try again later.");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === "en" ? "en-US" : language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : language === "it" ? "it-IT" : "fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t("nav.news")}
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            {t("news.subtitle")}
          </p>
        </div>
      </section>

      {/* News List Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-muted-foreground">
                {t("news.loading")}
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-red-500">
                Please refresh the page to try again.
              </p>
            </div>
          ) : news.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg text-muted-foreground">
                {t("news.noNews")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item, index) => (
                <article
                  key={`${item.link}-${index}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {item.source}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(item.pubDate)}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {item.description ||
                        "Click the link to read the full article on the source website."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-muted-foreground">
                        {t("news.source")} {item.source}
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition-colors"
                      >
                        {t("news.readMore")}
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {news.length > 0 && (
            <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-800">
                💡 {language === "en" && "News is updated daily from major technology sources"}
                {language === "es" && "Las noticias se actualizan diariamente desde fuentes de tecnología importantes"}
                {language === "pt" && "As notícias são atualizadas diariamente de fontes importantes de tecnologia"}
                {language === "it" && "Le notizie vengono aggiornate quotidianamente da importanti fonti tecnologiche"}
                {language === "fr" && "Les actualités sont mises à jour quotidiennement à partir de sources technologiques importantes"}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
