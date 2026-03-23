import Placeholder from "./Placeholder";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function Contact() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <Placeholder
      title={t("nav.contact")}
      description={t("contact.subtitle")}
    />
  );
}
