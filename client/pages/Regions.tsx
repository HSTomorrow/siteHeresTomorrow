import Placeholder from "./Placeholder";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

export default function Regions() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <Placeholder
      title={t("nav.regions")}
      description={t("regions.subtitle")}
    />
  );
}
