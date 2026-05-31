import { useLanguage } from "../i18n.jsx";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <Globe className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      <span className="font-semibold text-slate-700 dark:text-slate-300">{language === "en" ? "AR" : "EN"}</span>
    </button>
  );
}
