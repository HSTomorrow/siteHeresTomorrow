import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português (BR)", flag: "🇧🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export default function LanguageSelector() {
  const { setLanguage } = useLanguage();

  const handleSelectLanguage = (lang: any) => {
    setLanguage(lang);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary flex items-center justify-center z-[9999]">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-4">
        {/* Logo */}
        <div className="mb-12 flex items-center justify-center space-x-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold font-mono text-primary">&lt;/&gt;</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-bold tracking-widest text-white/80">HERES</div>
            <div className="text-5xl font-bold text-white leading-tight">&lt;/Today&gt;</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Welcome to <br /> HeresTomorrow
        </h1>

        <p className="text-xl text-white/90 mb-12 leading-relaxed">
          Select your preferred language to continue
        </p>

        {/* Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className="group p-6 bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl hover:bg-white hover:text-primary hover:border-white transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
            >
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">
                {lang.flag}
              </div>
              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                {lang.name}
              </p>
              <p className="text-xs text-white/70 group-hover:text-primary/70 mt-1 uppercase tracking-wide font-semibold">
                {lang.code}
              </p>
            </button>
          ))}
        </div>

        {/* Footer text */}
        <p className="text-sm text-white/60 mt-8">
          Your language preference will be saved for your next visit
        </p>
      </div>
    </div>
  );
}
