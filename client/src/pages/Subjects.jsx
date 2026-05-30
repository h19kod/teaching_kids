import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCache } from "../context/CacheContext.jsx";

export default function Subjects() {
  const { subjects, subjectsLoading, fetchSubjects } = useCache();

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  if (subjectsLoading) return <p className="text-slate-400">Loading subjects…</p>;
  if (!subjects) return <p className="text-slate-400">No subjects available.</p>;

  const colorMap = {
    blue: "from-sky-400 to-blue-500",
    purple: "from-fuchsia-400 to-purple-500",
    green: "from-emerald-400 to-green-500",
    amber: "from-amber-400 to-orange-500",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800">Choose a subject 🎯</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => (
          <Link
            key={s.id}
            to={`/subjects/${s.id}`}
            className="card hover:-translate-y-1 hover:shadow-lg transition group"
          >
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                colorMap[s.color] || "from-indigo-400 to-indigo-600"
              } grid place-items-center text-3xl shadow-md group-hover:animate-wiggle`}
            >
              {s.icon || "📘"}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-4">{s.name}</h2>
            <p className="text-slate-500 text-sm">{s.description}</p>
            <p className="text-xs font-semibold text-indigo-500 mt-3">
              {s._count?.games ?? 0} game{(s._count?.games ?? 0) === 1 ? "" : "s"} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
