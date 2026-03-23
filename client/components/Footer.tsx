import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">{t("company")}</h3>
            <p className="text-sm text-gray-300">{t("footer.about")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  {t("footer.services")}
                </Link>
              </li>
              <li>
                <Link to="/regions" className="text-gray-300 hover:text-white transition-colors">
                  {t("footer.locations")}
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-white transition-colors">
                  {t("nav.news")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t("nav.contact")}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-primary" />
                <a
                  href="tel:+5511982723837"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("phone")}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-primary" />
                <a
                  href="mailto:contato@herestomorrow.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("email")}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-gray-300">{t("nav.contact")}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-md font-semibold mb-4">📍 Rio Grande do Sul</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>{t("regions.physicalPresence.vale")}</li>
              <li>{t("regions.physicalPresence.montenegro")}</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>{t("footer.rights")}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/" className="hover:text-white transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link to="/" className="hover:text-white transition-colors">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
