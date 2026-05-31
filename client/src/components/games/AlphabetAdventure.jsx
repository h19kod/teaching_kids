import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "alphabet" games: arrange letters in alphabetical order.
export default function AlphabetAdventure({ content, onFinish }) {
  const letters = content.letters || "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [sorted, setSorted] = useState([]);
  const [remaining, setRemaining] = useState([...letters]);
  const [feedback, setFeedback] = useState(null);

  if (letters.length === 0) return <p className="text-slate-400">This game has no letters yet.</p>;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const isCorrect = sorted.every((letter, index) => letter === alphabet[index]);
  const allSorted = sorted.length === letters.length;

  function placeLetter(letter) {
    if (feedback) return;
    const expectedLetter = alphabet[sorted.length];
    
    if (letter === expectedLetter) {
      setSorted((prev) => [...prev, letter]);
      setRemaining((prev) => prev.filter((l) => l !== letter));
      sounds.correct();

      if (sorted.length + 1 === letters.length) {
        sounds.success();
        setFeedback("correct");
        setTimeout(() => onFinish(1), 1000);
      }
    } else {
      sounds.wrong();
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
  }

  function resetGame() {
    setSorted([]);
    setRemaining([...letters]);
    setFeedback(null);
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Alphabet Adventure
        </p>
        <p className="text-slate-600 mt-2">Click letters in alphabetical order (A-Z)</p>
      </div>

      {/* Sorted Letters */}
      <div className="bg-indigo-50 rounded-2xl p-4 min-h-[80px] flex items-center justify-center gap-2 border-2 border-indigo-200">
        {sorted.length === 0 ? (
          <p className="text-slate-400">Start with letter A</p>
        ) : (
          sorted.map((letter, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-xl bg-indigo-500 text-white font-bold text-xl flex items-center justify-center shadow-md"
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Remaining Letters */}
      <div className="flex flex-wrap justify-center gap-3">
        {remaining.map((letter, index) => (
          <button
            key={index}
            onClick={() => placeLetter(letter)}
            disabled={feedback}
            className={`w-12 h-12 rounded-xl font-bold text-xl transition ${
              feedback
                ? "opacity-50 cursor-not-allowed"
                : "bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400 hover:scale-110 hover:bg-indigo-50"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">Perfect! 🎉</p>
      )}
      {feedback === "wrong" && (
        <p className="text-center text-rose-600 font-bold text-lg">Wrong letter! Try again.</p>
      )}

      {/* Progress */}
      <div className="text-center">
        <p className="text-slate-500">Progress: {sorted.length}/{letters.length}</p>
      </div>

      {/* Reset Button */}
      {sorted.length > 0 && !feedback && (
        <button onClick={resetGame} className="btn-ghost w-full">
          Reset
        </button>
      )}
    </div>
  );
}
