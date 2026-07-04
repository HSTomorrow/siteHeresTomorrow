import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Building2, Lightbulb, BarChart3, Zap as ZapIcon } from "lucide-react";

export default function Regions() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            {t("regions.title")}
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            {t("regions.subtitle")}
          </p>
        </div>
      </section>

      {/* Expertise Areas Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Enterprise Transformation */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("regions.latinAmerica.title")}
                </h3>
              </div>
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  <strong>{t("regions.latinAmerica.countries")}</strong>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                  Focus Areas
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.latinAmerica.innovation")}
                </p>
              </div>
            </div>

            {/* Innovation & Technology */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("regions.europe.title")}
                </h3>
              </div>
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  <strong>{t("regions.europe.countries")}</strong>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                  Focus Areas
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.europe.innovation")}
                </p>
              </div>
            </div>

            {/* Business Growth */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("regions.northAmerica.title")}
                </h3>
              </div>
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  <strong>{t("regions.northAmerica.countries")}</strong>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                  Focus Areas
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.northAmerica.innovation")}
                </p>
              </div>
            </div>
          </div>

          {/* Physical Presence */}
          <div className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-3xl text-white p-12">
            <h3 className="text-3xl font-bold mb-8 flex items-center">
              <span className="mr-3">📍</span> {t("regions.physicalPresence.title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white/20 rounded-full mt-1">
                  <ZapIcon className="w-5 h-5 flex-shrink-0 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg leading-relaxed">
                    {t("regions.physicalPresence.vale")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white/20 rounded-full mt-1">
                  <ZapIcon className="w-5 h-5 flex-shrink-0 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg leading-relaxed">
                    {t("regions.physicalPresence.montenegro")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
