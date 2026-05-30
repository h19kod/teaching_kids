import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCache } from "../context/CacheContext.jsx";
import { ArrowLeft, Star } from "lucide-react";

const DIFFICULTY = {
  1: { label: "Level 1", color: "bg-emerald-100 text-emerald-700" },
  2: { label: "Level 2", color: "bg-lime-100 text-lime-700" },
  3: { label: "Level 3", color: "bg-amber-100 text-amber-700" },
  4: { label: "Level 4", color: "bg-orange-100 text-orange-700" },
  5: { label: "Level 5", color: "bg-rose-100 text-rose-700" },
};

const TYPE_ICON = { math: "🧮", quiz: "❓", spelling: "🔤", matching: "🧩" };

export default function SubjectGames() {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [subject, setSubject] = useState(null);
  const { fetchSubject } = useCache();

  useEffect(() => {
    fetchSubject(id)
      .then(setSubject)
      .catch((e) => setError(e.message));
  }, [id, fetchSubject]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!subject) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link to="/subjects" className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold">
        <ArrowLeft className="w-4 h-4" /> All subjects
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{subject.icon}</span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">{subject.name}</h1>
          <p className="text-slate-500">{subject.description}</p>
        </div>
      </div>

      {subject.games.length === 0 ? (
        <p className="text-slate-400">No games here yet. Check back soon!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subject.games.map((g) => {
            const diff = DIFFICULTY[g.difficultyLevel] || DIFFICULTY[1];
            return (
              <Link key={g.id} to={`/play/${g.id}`} className="card hover:-translate-y-1 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{TYPE_ICON[g.type] || "🎮"}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${diff.color}`}>{diff.label}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mt-3">{g.title}</h2>
                <p className="text-slate-500 text-sm">{g.description}</p>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm mt-3">
                  <Star className="w-4 h-4 fill-amber-400" /> {g.points} pts
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
