import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Link } from "react-router-dom";
import {
  Server,
  Users,
  FileText,
  Zap,
  Lightbulb,
  Database,
  Shield,
  Code,
  ArrowRight,
  Globe,
  Zap as ZapIcon,
} from "lucide-react";

const serviceIcons = {
  erp: <Server className="w-8 h-8" />,
  crm: <Users className="w-8 h-8" />,
  contracts: <FileText className="w-8 h-8" />,
  projects: <Zap className="w-8 h-8" />,
  innovation: <Lightbulb className="w-8 h-8" />,
  database: <Database className="w-8 h-8" />,
  lgpd: <Shield className="w-8 h-8" />,
  development: <Code className="w-8 h-8" />,
};

export default function Home() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const services = [
    { key: "erp", icon: serviceIcons.erp },
    { key: "crm", icon: serviceIcons.crm },
    { key: "contracts", icon: serviceIcons.contracts },
    { key: "projects", icon: serviceIcons.projects },
    { key: "innovation", icon: serviceIcons.innovation },
    { key: "database", icon: serviceIcons.database },
    { key: "lgpd", icon: serviceIcons.lgpd },
    { key: "development", icon: serviceIcons.development },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-secondary text-white py-24 sm:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all border border-white/30"
              >
                {t("nav.services")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t("services.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("services.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.key}
                className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary hover:to-secondary transition-all duration-300 hover:shadow-lg hover:text-white cursor-pointer"
              >
                <div className="text-primary group-hover:text-white mb-4 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-white mb-2 transition-colors">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-gray-100 transition-colors">
                  {t(`services.${service.key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 text-primary font-semibold hover:text-secondary transition-colors"
            >
              {t("news.viewMore")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t("regions.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("regions.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Latin America */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-foreground">
                  {t("regions.latinAmerica.title")}
                </h3>
              </div>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>{t("regions.latinAmerica.countries")}</strong>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary mb-2">
                  Innovation Areas:
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.latinAmerica.innovation")}
                </p>
              </div>
            </div>

            {/* Europe */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-secondary mr-3" />
                <h3 className="text-2xl font-bold text-foreground">
                  {t("regions.europe.title")}
                </h3>
              </div>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>{t("regions.europe.countries")}</strong>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary mb-2">
                  Innovation Areas:
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.europe.innovation")}
                </p>
              </div>
            </div>

            {/* North America */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-accent mr-3" />
                <h3 className="text-2xl font-bold text-foreground">
                  {t("regions.northAmerica.title")}
                </h3>
              </div>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>{t("regions.northAmerica.countries")}</strong>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-accent mb-2">
                  Innovation Areas:
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.northAmerica.innovation")}
                </p>
              </div>
            </div>
          </div>

          {/* Physical Presence */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl text-white p-8 md:p-12">
            <h3 className="text-3xl font-bold mb-6">
              📍 {t("regions.physicalPresence.title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <ZapIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-lg">
                    {t("regions.physicalPresence.vale")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <ZapIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-lg">
                    {t("regions.physicalPresence.montenegro")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t("news.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("news.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-40 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lightbulb className="w-12 h-12 mx-auto opacity-50" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    Featured Article
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Industry News & Insights
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stay updated with the latest technology trends and industry
                    developments.
                  </p>
                  <button className="inline-flex items-center text-primary font-semibold hover:text-secondary transition-colors">
                    {t("news.viewMore")}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/news"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition-all shadow-lg"
            >
              {t("nav.news")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t("contact.title")}
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            {t("contact.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all"
            >
              {t("contact.message")}
            </Link>
            <a
              href="tel:+5511982723837"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all border border-white/30"
            >
              {t("phone")}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
