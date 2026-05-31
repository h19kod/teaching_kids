import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "countobjects" games: count the displayed objects and select the correct number.
export default function CountObjects({ content, onFinish }) {
  const questions = content.questions || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);

  if (questions.length === 0) return <p className="text-slate-400">This game has no questions yet.</p>;

  const q = questions[index];
  const isLast = index === questions.length - 1;

  function handleAnswer(answer) {
    if (selected !== null) return;
    setSelected(answer);
    
    if (answer === q.count) {
      setCorrect((prev) => prev + 1);
      sounds.correct();
    } else {
      sounds.wrong();
    }

    setTimeout(() => {
      if (isLast) {
        sounds.success();
        onFinish(correct / questions.length);
      } else {
        setIndex((prev) => prev + 1);
        setSelected(null);
      }
    }, 1000);
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Question {index + 1} of {questions.length}
        </p>
        <p className="text-slate-600 mt-2">Count the {q.objectType || "objects"}</p>
      </div>

      {/* Display Objects */}
      <div className="flex flex-wrap justify-center gap-4 py-8">
        {Array.from({ length: q.count }).map((_, i) => (
          <div
            key={i}
            className="text-6xl animate-pop"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {q.icon}
          </div>
        ))}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {q.options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === q.count;
          
          let style = "btn-ghost text-2xl py-4";
          if (selected !== null) {
            if (isCorrect) style = "btn text-2xl py-4 bg-emerald-500 text-white";
            else if (isSelected) style = "btn text-2xl py-4 bg-rose-500 text-white";
            else style = "btn-ghost text-2xl py-4 opacity-50";
          }
          
          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selected !== null}
              className={style}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {selected !== null && selected === q.count && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">Correct! 🎉</p>
      )}
      {selected !== null && selected !== q.count && (
        <p className="text-center text-rose-600 font-bold text-lg">
          The correct answer is {q.count}
        </p>
      )}

      {/* Score */}
      <div className="text-center">
        <p className="text-slate-500">Score: {correct}/{questions.length}</p>
      </div>
    </div>
  );
}
