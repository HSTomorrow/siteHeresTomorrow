import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = (key: string) => getTranslation(language, key);

  const navLinks = [
    { href: "/services", label: t("nav.services") },
    { href: "/clients", label: t("nav.clients") },
    { href: "/regions", label: t("nav.regions") },
    { href: "/portfolio", label: t("nav.portfolio") },
    { href: "/news", label: t("nav.news") },
    { href: "/upload", label: t("nav.materials") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo variant="compact" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 xl:px-6 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-300 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side - Language switcher and Mobile menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex space-x-1">
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
                  className={`px-3 xl:px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                    language === lang.code
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-neutral-100"
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
              className="lg:hidden text-xs px-3 py-2 border border-primary rounded-full text-foreground bg-white cursor-pointer font-semibold"
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
              className="lg:hidden p-2 text-foreground hover:bg-neutral-100 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
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
