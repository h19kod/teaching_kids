import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const NotificationContext = createContext(null);

const ICONS = {
  success: { icon: CheckCircle, cls: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700" },
  error:   { icon: XCircle,     cls: "text-red-500",     bg: "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700" },
  warning: { icon: AlertTriangle, cls: "text-amber-500", bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700" },
  info:    { icon: Info,        cls: "text-sky-500",     bg: "bg-sky-50 border-sky-200 dark:bg-sky-900/30 dark:border-sky-700" },
};

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const { icon: Icon, cls, bg } = ICONS[t.type] || ICONS.info;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-pop ${bg}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cls}`} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotificationContext);
}
