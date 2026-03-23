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
    { href: "/services", label: t("nav.services") },
    { href: "/regions", label: t("nav.regions") },
    { href: "/news", label: t("nav.news") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              <span className="font-mono text-[10px] leading-none text-center">&lt;/&gt;</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-primary tracking-widest">HERES</div>
              <div className="text-lg font-bold text-primary leading-none">&lt;/Today&gt;</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-6 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side - Language switcher and Mobile menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex space-x-1">
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
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
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
              className="sm:hidden text-xs px-3 py-2 border border-primary rounded-full text-foreground bg-white cursor-pointer font-semibold"
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
              className="md:hidden p-2 text-foreground hover:bg-neutral-100 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
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
