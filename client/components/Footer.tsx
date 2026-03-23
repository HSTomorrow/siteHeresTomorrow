import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Mail, Phone, MapPin, Leaf } from "lucide-react";

export default function Footer() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Leaf size={18} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{t("company")}</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{t("footer.about")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-bold mb-6 text-white">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/services" className="text-white/70 hover:text-primary transition-colors duration-300 font-medium">
                  {t("footer.services")}
                </Link>
              </li>
              <li>
                <Link to="/regions" className="text-white/70 hover:text-primary transition-colors duration-300 font-medium">
                  {t("footer.locations")}
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-white/70 hover:text-primary transition-colors duration-300 font-medium">
                  {t("nav.news")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-md font-bold mb-6 text-white">{t("nav.contact")}</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Phone size={16} className="text-primary" />
                </div>
                <a
                  href="tel:+5511982723837"
                  className="text-white/70 hover:text-primary transition-colors duration-300 font-medium"
                >
                  {t("phone")}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Mail size={16} className="text-primary" />
                </div>
                <a
                  href="mailto:contato@herestomorrow.com"
                  className="text-white/70 hover:text-primary transition-colors duration-300 font-medium"
                >
                  {t("email")}
                </a>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-md font-bold mb-6 text-white">📍 {t("regions.physicalPresence.title").split("-")[1].trim()}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="font-medium hover:text-primary transition-colors duration-300">
                {t("regions.physicalPresence.vale")}
              </li>
              <li className="font-medium hover:text-primary transition-colors duration-300">
                {t("regions.physicalPresence.montenegro")}
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60 gap-6">
            <p>{t("footer.rights")}</p>
            <div className="flex space-x-8">
              <Link to="/" className="hover:text-primary transition-colors duration-300">
                {t("footer.privacy")}
              </Link>
              <Link to="/" className="hover:text-primary transition-colors duration-300">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
