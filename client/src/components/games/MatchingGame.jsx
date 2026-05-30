import { useMemo, useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "matching" games: tap a word, then tap its matching picture.
export default function MatchingGame({ content, onFinish }) {
  const pairs = content.pairs || [];
  const words = useMemo(() => shuffle(pairs.map((p, i) => ({ ...p, id: i }))), [pairs]);
  const matches = useMemo(() => shuffle(pairs.map((p, i) => ({ ...p, id: i }))), [pairs]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [solved, setSolved] = useState([]); // ids solved
  const [wrong, setWrong] = useState(null); // id flashed wrong

  if (pairs.length === 0) return <p className="text-slate-400">This game has no pairs yet.</p>;

  function pickWord(id) {
    if (solved.includes(id)) return;
    setSelectedWord(id);
    sounds.click();
  }

  function pickMatch(matchId) {
    if (selectedWord === null || solved.includes(matchId)) return;
    if (selectedWord === matchId) {
      const next = [...solved, matchId];
      setSolved(next);
      setSelectedWord(null);
      sounds.correct();
      if (next.length === pairs.length) {
        setTimeout(() => {
          sounds.success();
          onFinish(1);
        }, 600); // all matched correctly
      }
    } else {
      sounds.wrong();
      setWrong(matchId);
      setTimeout(() => setWrong(null), 500);
      setSelectedWord(null);
    }
  }

  return (
    <div className="card animate-pop">
      <p className="text-center text-slate-500 mb-4">
        Matched {solved.length} of {pairs.length}
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {words.map((w) => (
            <button
              key={w.id}
              onClick={() => pickWord(w.id)}
              disabled={solved.includes(w.id)}
              className={`btn w-full py-4 text-lg ${
                solved.includes(w.id)
                  ? "bg-emerald-100 text-emerald-700"
                  : selectedWord === w.id
                  ? "bg-indigo-600 text-white"
                  : "btn-ghost"
              }`}
            >
              {w.word}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => pickMatch(m.id)}
              disabled={solved.includes(m.id)}
              className={`btn w-full py-4 text-3xl ${
                solved.includes(m.id)
                  ? "bg-emerald-100"
                  : wrong === m.id
                  ? "bg-rose-200"
                  : "btn-ghost"
              }`}
            >
              {m.match}
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
