import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "math" and "quiz" games: a prompt with multiple choice options.
export default function ChoiceGame({ content, onFinish }) {
  const questions = content.questions || [];
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);

  if (questions.length === 0) return <p className="text-slate-400">This game has no questions yet.</p>;

  const q = questions[index];
  const isLast = index === questions.length - 1;

  function pick(option) {
    if (picked !== null) return;
    setPicked(option);
    const isRight = String(option) === String(q.answer);
    if (isRight) {
      setCorrect((c) => c + 1);
      sounds.correct();
    } else {
      sounds.wrong();
    }

    setTimeout(() => {
      if (isLast) {
        sounds.success();
        onFinish((correct + (isRight ? 1 : 0)) / questions.length);
      } else {
        setIndex((i) => i + 1);
        setPicked(null);
      }
    }, 800);
  }

  return (
    <div className="card animate-pop">
      <Progress index={index} total={questions.length} />
      <div className="text-center my-8">
        <div className="text-5xl font-extrabold text-slate-800">{q.prompt}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isAnswer = String(opt) === String(q.answer);
          const isPicked = String(opt) === String(picked);
          let style = "btn-ghost text-lg py-4";
          if (picked !== null) {
            if (isAnswer) style = "btn text-lg py-4 bg-emerald-500 text-white";
            else if (isPicked) style = "btn text-lg py-4 bg-rose-500 text-white";
            else style = "btn-ghost text-lg py-4 opacity-50";
          }
          return (
            <button key={String(opt)} className={style} onClick={() => pick(opt)} disabled={picked !== null}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Progress({ index, total }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold text-slate-500 mb-1">
        <span>Question {index + 1} of {total}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(index / total) * 100}%` }} />
      </div>
    </div>
  );
}
