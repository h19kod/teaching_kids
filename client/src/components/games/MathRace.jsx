import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "mathrace" games: solve math problems before time runs out.
export default function MathRace({ content, onFinish }) {
  const questions = content.questions || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(content.timePerQuestion || 10);
  const [gameOver, setGameOver] = useState(false);

  if (questions.length === 0) return <p className="text-slate-400">This game has no questions yet.</p>;

  const q = questions[index];
  const isLast = index === questions.length - 1;

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && selected === null) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selected === null) {
      // Time ran out
      sounds.wrong();
      setSelected("timeout");
      setTimeout(() => {
        if (isLast) {
          onFinish(correct / questions.length);
        } else {
          setIndex((prev) => prev + 1);
          setSelected(null);
          setTimeLeft(content.timePerQuestion || 10);
        }
      }, 1000);
    }
  }, [timeLeft, gameOver, selected, isLast, questions.length, correct, content.timePerQuestion]);

  function handleAnswer(answer) {
    if (selected !== null) return;
    setSelected(answer);
    
    if (answer === q.answer) {
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
        setTimeLeft(content.timePerQuestion || 10);
      }
    }, 1000);
  }

  const timeColor = timeLeft <= 3 ? "text-rose-500" : timeLeft <= 5 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="card animate-pop space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Question {index + 1} of {questions.length}</p>
        <div className={`text-2xl font-bold ${timeColor}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-all ${timeLeft <= 3 ? "bg-rose-500" : timeLeft <= 5 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${(timeLeft / (content.timePerQuestion || 10)) * 100}%` }}
        />
      </div>

      {/* Math Problem */}
      <div className="text-center">
        <div className="text-6xl font-extrabold text-slate-800">
          {q.prompt}
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === q.answer;
          const isTimeout = selected === "timeout";
          
          let style = "btn-ghost text-2xl py-4";
          if (selected !== null) {
            if (isCorrect) style = "btn text-2xl py-4 bg-emerald-500 text-white";
            else if (isSelected) style = "btn text-2xl py-4 bg-rose-500 text-white";
            else if (isTimeout && isCorrect) style = "btn text-2xl py-4 bg-amber-500 text-white";
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
      {selected !== null && selected !== "timeout" && selected === q.answer && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">Correct! 🎉</p>
      )}
      {selected !== null && selected !== "timeout" && selected !== q.answer && (
        <p className="text-center text-rose-600 font-bold text-lg">
          The correct answer is {q.answer}
        </p>
      )}
      {selected === "timeout" && (
        <p className="text-center text-amber-600 font-bold text-lg">
          Time's up! The answer was {q.answer}
        </p>
      )}

      {/* Score */}
      <div className="text-center">
        <p className="text-slate-500">Score: {correct}/{questions.length}</p>
      </div>
    </div>
  );
}
