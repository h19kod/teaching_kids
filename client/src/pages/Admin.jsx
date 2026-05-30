import { useState } from "react";
import AdminStats from "../components/admin/AdminStats.jsx";
import AdminGames from "../components/admin/AdminGames.jsx";
import AdminUsers from "../components/admin/AdminUsers.jsx";
import AdminSubjects from "../components/admin/AdminSubjects.jsx";
import { BarChart3, Gamepad2, Users, BookOpen } from "lucide-react";

const TABS = [
  { key: "stats", label: "Overview", icon: BarChart3 },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "games", label: "Games", icon: Gamepad2 },
  { key: "users", label: "Users", icon: Users },
];

export default function Admin() {
  const [tab, setTab] = useState("stats");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800">🛠️ Admin Panel</h1>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && <AdminStats />}
      {tab === "subjects" && <AdminSubjects />}
      {tab === "games" && <AdminGames />}
      {tab === "users" && <AdminUsers />}
    </div>
  );
}
