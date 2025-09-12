import i18n from "i18next";
import { initReactI18next } from "@/node_modules/react-i18next";
import LanguageDetector from "i18next-react-native-language-detector";
import HttpBackend from "i18next-http-backend";
import enTranslations from "../locales/en/translation.json";
//import esTranslations from '../locales/es/translation.json';
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: enTranslations,
      },
    },
    supportedLngs: ["en"],
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath:
        "https://api.localazy.com/api/project/_a6927942261454869655/i18next/{{lng}}/{{ns}}.json",
      requestOptions: {
        headers: {
          Authorization: `Bearer ${process.env.LOCALAZY_PUBLIC_TOKEN}`,
        },
      },
    },
  })
  .then(() => {
    console.log("i18n initialized", i18n.t("wallets.description"));
  })
  .catch((err) => {
    console.error("i18n initialization failed", err);
  });

export default i18n;
