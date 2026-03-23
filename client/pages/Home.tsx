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
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-32 sm:py-40 lg:py-52 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-poppins">
              {t("hero.title")}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-bold rounded-full hover:bg-neutral-100 transition-all transform hover:scale-105 shadow-lg duration-300"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-all border border-white/40 backdrop-blur-sm"
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
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
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
                className="group p-8 rounded-2xl bg-white border border-neutral-200 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
              >
                <div className="text-primary mb-6 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`services.${service.key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-3 text-primary font-bold hover:text-primary-dark transition-colors duration-300"
            >
              {t("news.viewMore")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {t("regions.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("regions.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Latin America */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <Globe className="w-6 h-6 text-primary" />
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
                  Innovation Areas
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.latinAmerica.innovation")}
                </p>
              </div>
            </div>

            {/* Europe */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <Globe className="w-6 h-6 text-primary" />
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
                  Innovation Areas
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("regions.europe.innovation")}
                </p>
              </div>
            </div>

            {/* North America */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  <Globe className="w-6 h-6 text-primary" />
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
                  Innovation Areas
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

      {/* News Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
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
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-neutral-200">
                  <Lightbulb className="w-16 h-16 text-primary/40" />
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                    Featured Article
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    Industry News & Insights
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Stay updated with the latest technology trends and industry
                    developments.
                  </p>
                  <Link to="/news" className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors duration-300">
                    {t("news.viewMore")}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/news"
              className="inline-flex items-center px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/30"
            >
              {t("nav.news")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            {t("contact.title")}
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            {t("contact.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary font-bold rounded-full hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105"
            >
              {t("contact.message")}
            </Link>
            <a
              href="tel:+5511982723837"
              className="inline-flex items-center justify-center px-10 py-4 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-all duration-300 border border-white/40 backdrop-blur-sm"
            >
              {t("phone")}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
