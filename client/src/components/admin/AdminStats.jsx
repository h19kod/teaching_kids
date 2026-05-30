import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { Users, Gamepad2, BookOpen, Activity } from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p className="text-slate-400">Loading statistics…</p>;

  const cards = [
    { label: "Users", value: stats.totals.users, icon: Users, color: "text-sky-500 bg-sky-50" },
    { label: "Games", value: stats.totals.games, icon: Gamepad2, color: "text-indigo-500 bg-indigo-50" },
    { label: "Subjects", value: stats.totals.subjects, icon: BookOpen, color: "text-purple-500 bg-purple-50" },
    { label: "Total Plays", value: stats.totals.plays, icon: Activity, color: "text-emerald-500 bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl grid place-items-center ${c.color}`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{c.value}</div>
              <div className="text-xs text-slate-400 font-semibold">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-slate-700 mb-3">Users by Role</h2>
          <div className="space-y-2">
            {stats.usersByRole.map((r) => (
              <div key={r.role} className="flex items-center justify-between">
                <span className="capitalize font-semibold text-slate-600">{r.role}</span>
                <span className="font-bold text-slate-800">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-slate-700 mb-3">Most Played Games</h2>
          {stats.topGames.length === 0 ? (
            <p className="text-slate-400">No plays recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-left">
                <tr>
                  <th className="pb-2">Game</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2 text-right">Plays</th>
                  <th className="pb-2 text-right">Avg</th>
                </tr>
              </thead>
              <tbody>
                {stats.topGames.map((g) => (
                  <tr key={g.gameId} className="border-t border-slate-100">
                    <td className="py-2 font-semibold text-slate-700">{g.title}</td>
                    <td className="py-2 text-slate-500">{g.subject}</td>
                    <td className="py-2 text-right">{g.plays}</td>
                    <td className="py-2 text-right">{g.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
