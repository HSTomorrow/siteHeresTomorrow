import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "es" | "pt" | "it" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageSelected: boolean;
  setLanguageSelected: (selected: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize from localStorage
  const savedLanguage = localStorage.getItem("selectedLanguage") as Language | null;
  const [language, setLanguage] = useState<Language>(savedLanguage || "en");
  const [languageSelected, setLanguageSelected] = useState(!!savedLanguage);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setLanguageSelected(true);
    // Store in localStorage for persistence
    localStorage.setItem("selectedLanguage", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        languageSelected,
        setLanguageSelected,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
