import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { ExternalLink, ShoppingBag, QrCode, ShieldCheck } from "lucide-react";

export default function Clients() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 font-poppins">
            {t("clients.title")}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t("clients.subtitle")}
          </p>
        </div>
      </section>

      {/* Case Study: Vitrii */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 overflow-hidden shadow-lg shadow-primary/5">
            <div className="bg-gradient-to-br from-primary via-primary-dark to-secondary p-10 sm:p-14 text-white">
              <span className="inline-block px-4 py-1.5 bg-white/15 border border-white/30 rounded-full text-xs font-bold uppercase tracking-wide mb-6 backdrop-blur-sm">
                Marketplace
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-poppins">
                Vitrii
              </h2>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                {t("clients.vitrii.description")}
              </p>
            </div>

            <div className="p-10 sm:p-14">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-full text-primary flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground pt-2">
                    Marketplace de Produtos e Serviços
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-full text-primary flex-shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground pt-2">
                    QR Code
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-full text-primary flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-muted-foreground pt-2">
                    E-commerce
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-8 mb-8">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                  Here’s Tomorrow
                </p>
                <p className="text-base text-foreground leading-relaxed">
                  {t("clients.vitrii.role")}
                </p>
              </div>

              <a
                href="https://www.vitrii.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300"
              >
                {t("clients.visitSite")}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
