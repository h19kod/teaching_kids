import { useMemo, useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "shapematch" games: match shapes with their names.
export default function ShapeMatch({ content, onFinish }) {
  const pairs = content.pairs || [];
  const shapes = useMemo(() => shuffle(pairs.map((p, i) => ({ ...p, id: i }))), [pairs]);
  const names = useMemo(() => shuffle(pairs.map((p, i) => ({ ...p, id: i }))), [pairs]);

  const [selectedShape, setSelectedShape] = useState(null);
  const [solved, setSolved] = useState([]);
  const [wrong, setWrong] = useState(null);

  if (pairs.length === 0) return <p className="text-slate-400">This game has no shapes yet.</p>;

  function pickShape(id) {
    if (solved.includes(id)) return;
    setSelectedShape(id);
    sounds.click();
  }

  function pickName(matchId) {
    if (selectedShape === null || solved.includes(matchId)) return;
    if (selectedShape === matchId) {
      const next = [...solved, matchId];
      setSolved(next);
      setSelectedShape(null);
      sounds.correct();
      if (next.length === pairs.length) {
        setTimeout(() => {
          sounds.success();
          onFinish(1);
        }, 600);
      }
    } else {
      sounds.wrong();
      setWrong(matchId);
      setTimeout(() => setWrong(null), 500);
      setSelectedShape(null);
    }
  }

  return (
    <div className="card animate-pop">
      <p className="text-center text-slate-500 mb-4">
        Matched {solved.length} of {pairs.length}
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {shapes.map((s) => (
            <button
              key={s.id}
              onClick={() => pickShape(s.id)}
              disabled={solved.includes(s.id)}
              className={`btn w-full py-6 flex flex-col items-center gap-2 ${
                solved.includes(s.id)
                  ? "bg-emerald-100 text-emerald-700"
                  : selectedShape === s.id
                  ? "bg-indigo-600 text-white"
                  : "btn-ghost"
              }`}
            >
              <span className="text-5xl">{s.shape}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {names.map((n) => (
            <button
              key={n.id}
              onClick={() => pickName(n.id)}
              disabled={solved.includes(n.id)}
              className={`btn w-full py-6 text-lg font-semibold ${
                solved.includes(n.id)
                  ? "bg-emerald-100 text-emerald-700"
                  : wrong === n.id
                  ? "bg-rose-200 text-rose-700"
                  : "btn-ghost"
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
