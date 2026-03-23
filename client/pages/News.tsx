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
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            {t("nav.news")}
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            {t("news.subtitle")}
          </p>
        </div>
      </section>

      {/* News List Section */}
      <section className="py-16 sm:py-24 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="w-16 h-16 text-primary animate-spin mb-6" />
              <p className="text-lg text-muted-foreground font-medium">
                {t("news.loading")}
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <p className="text-red-600 mb-4 font-semibold text-lg">{error}</p>
              <p className="text-sm text-red-500">
                Please refresh the page to try again.
              </p>
            </div>
          ) : news.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
              <p className="text-lg text-muted-foreground font-medium">
                {t("news.noNews")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item, index) => (
                <article
                  key={`${item.link}-${index}`}
                  className="bg-white rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            {item.source}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">
                            {formatDate(item.pubDate)}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-8 line-clamp-3 leading-relaxed">
                      {item.description ||
                        "Click the link to read the full article on the source website."}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        {t("news.source")} {item.source}
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
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
            <div className="mt-12 p-8 bg-primary/10 border-2 border-primary/30 rounded-2xl text-center">
              <p className="text-sm text-primary font-semibold">
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
