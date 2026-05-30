import { useState } from "react";
import { Progress } from "./ChoiceGame.jsx";
import { sounds } from "../../utils/sounds.js";

// Handles "spelling" games: a hint prompt with a free-text answer.
export default function SpellingGame({ content, onFinish }) {
  const questions = content.questions || [];
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null); // "right" | "wrong"

  if (questions.length === 0) return <p className="text-slate-400">This game has no questions yet.</p>;

  const q = questions[index];
  const isLast = index === questions.length - 1;

  function submit(e) {
    e.preventDefault();
    if (feedback) return;
    const isRight = value.trim().toLowerCase() === String(q.answer).toLowerCase();
    setFeedback(isRight ? "right" : "wrong");
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
        setValue("");
        setFeedback(null);
      }
    }, 1100);
  }

  return (
    <form onSubmit={submit} className="card animate-pop">
      <Progress index={index} total={questions.length} />
      <div className="text-center my-8">
        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Hint</div>
        <div className="text-2xl font-bold text-slate-800 mt-1">{q.prompt}</div>
      </div>
      <input
        autoFocus
        className="input text-center text-2xl font-bold tracking-widest"
        placeholder="type here…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!!feedback}
      />
      {feedback === "right" && <p className="text-emerald-600 font-bold text-center mt-3">Correct! 🎉</p>}
      {feedback === "wrong" && (
        <p className="text-rose-600 font-bold text-center mt-3">
          The answer was "{q.answer}"
        </p>
      )}
      <button type="submit" className="btn-primary w-full mt-4" disabled={!value.trim() || !!feedback}>
        Check
      </button>
    </form>
  );
}
