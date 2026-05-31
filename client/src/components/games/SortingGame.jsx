import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "sorting" games: sort items into correct order.
export default function SortingGame({ content, onFinish }) {
  const items = content.items || [];
  const [sorted, setSorted] = useState([]);
  const [remaining, setRemaining] = useState([...items]);
  const [feedback, setFeedback] = useState(null);

  if (items.length === 0) return <p className="text-slate-400">This game has no items yet.</p>;

  const isCorrect = sorted.every((item, index) => item.order === index + 1);
  const allSorted = sorted.length === items.length;

  function handleSort(item) {
    if (feedback) return;
    setSorted((prev) => [...prev, item]);
    setRemaining((prev) => prev.filter((i) => i.id !== item.id));
    sounds.click();

    if (sorted.length + 1 === items.length) {
      const newSorted = [...sorted, item];
      const correct = newSorted.every((i, idx) => i.order === idx + 1);
      if (correct) {
        sounds.correct();
        setFeedback("correct");
        setTimeout(() => {
          sounds.success();
          onFinish(1);
        }, 1000);
      } else {
        sounds.wrong();
        setFeedback("wrong");
        setTimeout(() => resetGame(), 1500);
      }
    }
  }

  function handleRemove(index) {
    if (feedback) return;
    const removed = sorted[index];
    setSorted((prev) => prev.filter((_, i) => i !== index));
    setRemaining((prev) => [...prev, removed]);
  }

  function resetGame() {
    setSorted([]);
    setRemaining([...items]);
    setFeedback(null);
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Sort in {content.sortBy || "correct order"}
        </p>
        <p className="text-slate-600 mt-2">{content.instructions || "Drag or tap items to sort them"}</p>
      </div>

      {/* Sorted Items */}
      <div className="bg-slate-50 rounded-2xl p-4 min-h-[120px] border-2 border-dashed border-slate-300">
        <p className="text-sm font-semibold text-slate-500 mb-3">Sorted ({sorted.length}/{items.length}):</p>
        <div className="flex flex-wrap gap-2">
          {sorted.length === 0 ? (
            <p className="text-slate-400 text-sm">No items sorted yet</p>
          ) : (
            sorted.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleRemove(index)}
                className={`bg-white rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:shadow-md transition border-2 flex items-center gap-2 ${
                  feedback === "correct" ? "border-emerald-500" : feedback === "wrong" ? "border-rose-500" : "border-indigo-200"
                }`}
              >
                <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-xl">{item.icon}</span>
                <span className="font-semibold text-slate-700">{item.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Remaining Items */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <p className="text-sm font-semibold text-slate-500 mb-3">Items to sort:</p>
        <div className="flex flex-wrap gap-2">
          {remaining.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSort(item)}
              disabled={feedback}
              className={`bg-slate-100 rounded-xl px-4 py-2 hover:bg-indigo-100 transition border-2 border-transparent hover:border-indigo-300 flex items-center gap-2 ${
                feedback ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-slate-700">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">Perfect! 🎉</p>
      )}
      {feedback === "wrong" && (
        <div className="text-center">
          <p className="text-rose-600 font-bold text-lg">Not quite right! Try again.</p>
          <button onClick={resetGame} className="btn-primary mt-3">
            Reset
          </button>
        </div>
      )}

      {/* Reset Button */}
      {sorted.length > 0 && !feedback && (
        <button onClick={resetGame} className="btn-ghost w-full">
          Reset
        </button>
      )}
    </div>
  );
}
