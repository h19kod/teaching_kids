import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Trophy, Star, CheckCircle2, Sparkles, Play } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/progress/me").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading your achievements…</p>;

  const stats = [
    { label: "Total Points", value: data.totalPoints, icon: Star, color: "text-amber-500 bg-amber-50" },
    { label: "Games Completed", value: data.gamesCompleted, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { label: "Times Played", value: data.totalPlays, icon: Play, color: "text-sky-500 bg-sky-50" },
    {
      label: "Badges Earned",
      value: data.achievements.filter((a) => a.earned).length,
      icon: Trophy,
      color: "text-purple-500 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Hi {user.name}! <span className="animate-wiggle inline-block">👋</span>
          </h1>
          <p className="text-slate-500">Here's how your learning journey is going.</p>
        </div>
        <Link to="/subjects" className="btn-primary">
          <Sparkles className="w-5 h-5" /> Play a game
        </Link>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl grid place-items-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-400 font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-700 mb-3">🏅 Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.achievements.map((b) => (
            <div
              key={b.key}
              className={`card text-center py-5 ${b.earned ? "animate-pop" : "opacity-40 grayscale"}`}
            >
              <div className="text-4xl">{b.icon}</div>
              <div className="text-sm font-bold text-slate-600 mt-2">{b.label}</div>
              <div className="text-xs text-slate-400">{b.earned ? "Earned!" : "Locked"}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card">
          <h2 className="text-xl font-bold text-slate-700 mb-3">📊 Points by Subject</h2>
          <SubjectBars bySubject={data.bySubject} />
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-slate-700 mb-3">🕒 Recent Activity</h2>
          {data.recent.length === 0 ? (
            <p className="text-slate-400">No games played yet. Let's start! 🚀</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recent.map((r) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-700">{r.game.title}</div>
                    <div className="text-xs text-slate-400">{r.game.subject.name}</div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" /> {r.score}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function SubjectBars({ bySubject }) {
  const entries = Object.entries(bySubject);
  if (entries.length === 0) return <p className="text-slate-400">Play games to fill this chart.</p>;
  const max = Math.max(...entries.map(([, v]) => v));
  const colors = ["bg-indigo-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500"];

  return (
    <div className="space-y-3">
      {entries.map(([name, value], i) => (
        <div key={name}>
          <div className="flex justify-between text-sm font-semibold text-slate-600">
            <span>{name}</span>
            <span>{value} pts</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
