import { useTheme } from "../context/ThemeContext.jsx";
import { useLanguage } from "../i18n.jsx";
import { usePWA } from "../hooks/usePWA.js";
import { Moon, Sun, Globe, Bell, Shield, Palette, Download, Wifi, WifiOff, Smartphone } from "lucide-react";

export default function Settings() {
  const { dark, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { installPrompt, isInstalled, isOnline, promptInstall } = usePWA();

  const sections = [
    {
      id: "appearance",
      title: "🎨 Appearance",
      icon: Palette,
      items: [
        {
          label: "Dark Mode",
          description: dark ? "Switch to light mode" : "Switch to dark mode",
          control: (
            <button
              onClick={toggle}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                dark ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <span className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow transition-transform ${dark ? "translate-x-8" : "translate-x-1"}`}>
                {dark ? <Moon className="w-3 h-3 text-indigo-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
              </span>
            </button>
          ),
        },
      ],
    },
    {
      id: "language",
      title: "🌐 Language",
      icon: Globe,
      items: [
        {
          label: "Interface Language",
          description: "Choose your preferred language",
          control: (
            <div className="flex gap-2">
              {[
                { code: "en", label: "English", flag: "🇬🇧" },
                { code: "ar", label: "العربية", flag: "🇸🇦" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition ${
                    language === lang.code
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      id: "security",
      title: "🔐 Security",
      icon: Shield,
      items: [
        { label: "Password Protection", description: "Change your password from the Profile page", control: null },
        { label: "Session", description: "Your session lasts 7 days and refreshes on each login", control: null },
        { label: "Rate Limiting", description: "Login attempts are limited to 20 per minute for security", control: <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">Active ✓</span> },
      ],
    },
    {
      id: "pwa",
      title: "📱 App & Connectivity",
      icon: Smartphone,
      items: [
        {
          label: "Network Status",
          description: isOnline ? "You are online" : "You are offline — some features may be limited",
          control: isOnline
            ? <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full"><Wifi className="w-3.5 h-3.5" /> Online</span>
            : <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full"><WifiOff className="w-3.5 h-3.5" /> Offline</span>,
        },
        {
          label: "Install App",
          description: isInstalled
            ? "App is already installed on this device"
            : installPrompt
            ? "Install Kids Learning on your device for offline access"
            : "Open in a supported browser (Chrome/Edge) to install",
          control: isInstalled
            ? <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">Installed ✓</span>
            : installPrompt
            ? (
              <button
                onClick={promptInstall}
                className="flex items-center gap-1.5 btn-primary text-sm py-2 px-3"
              >
                <Download className="w-4 h-4" /> Install
              </button>
            )
            : null,
        },
        {
          label: "Offline Support",
          description: "Games and progress are cached for offline play via Service Worker",
          control: <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded-full">Active ✓</span>,
        },
      ],
    },
    {
      id: "platform",
      title: "ℹ️ Platform",
      icon: Bell,
      items: [
        { label: "Version", description: "Kids Learning Adventure v1.0.0", control: null },
        { label: "Features", description: "24 games • 13 features • 4 worlds • Daily missions", control: null },
        { label: "Supported roles", description: "Admin, Parent, Child", control: null },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">⚙️ Settings</h1>

      {sections.map((section) => (
        <div key={section.id} className="card space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">{section.title}</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.description}</div>
                  )}
                </div>
                {item.control && <div className="shrink-0">{item.control}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
