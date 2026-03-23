import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = (key: string) => getTranslation(language, key);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/services", label: t("nav.services") },
    { href: "/regions", label: t("nav.regions") },
    { href: "/news", label: t("nav.news") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-2xl text-primary"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-sm font-bold">
              HT
            </div>
            <span className="hidden sm:inline">{t("company")}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side - Language switcher and Mobile menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex space-x-1 border-l pl-4">
              {[
                { code: "en", label: "EN" },
                { code: "es", label: "ES" },
                { code: "pt", label: "PT" },
                { code: "it", label: "IT" },
                { code: "fr", label: "FR" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                    language === lang.code
                      ? "bg-primary text-white"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Mobile language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="sm:hidden text-sm px-2 py-1 border border-primary rounded text-foreground bg-white cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="pt">PT</option>
              <option value="it">IT</option>
              <option value="fr">FR</option>
            </select>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground hover:text-primary"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
