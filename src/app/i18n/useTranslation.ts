import { translations, Language, TranslationKey } from "./translations";

export function useTranslation(language: Language = "en") {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t, language };
}
