import Placeholder from "./Placeholder";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function Services() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <Placeholder
      title={t("nav.services")}
      description={t("services.subtitle")}
    />
  );
}
