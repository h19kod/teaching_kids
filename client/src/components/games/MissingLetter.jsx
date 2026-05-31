import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "missingletter" games: fill in the missing letter to complete the word.
export default function MissingLetter({ content, onFinish }) {
  const words = content.words || [];
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  if (words.length === 0) return <p className="text-slate-400">This game has no words yet.</p>;

  const currentWord = words[index];
  const isLast = index === words.length - 1;
  const score = useState(0)[0];

  function handleLetterClick(letter) {
    if (feedback) return;
    setAnswer((prev) => prev + letter);
    sounds.click();
  }

  function handleBackspace() {
    if (feedback) return;
    setAnswer((prev) => prev.slice(0, -1));
  }

  function checkAnswer() {
    if (answer.toUpperCase() === currentWord.missingLetter.toUpperCase()) {
      sounds.correct();
      setFeedback("correct");
      setTimeout(() => {
        if (isLast) {
          sounds.success();
          onFinish(1);
        } else {
          setIndex((prev) => prev + 1);
          setAnswer("");
          setFeedback(null);
        }
      }, 1000);
    } else {
      sounds.wrong();
      setFeedback("wrong");
      setTimeout(() => {
        setAnswer("");
        setFeedback(null);
      }, 1000);
    }
  }

  function skipWord() {
    if (isLast) {
      onFinish(0.5);
    } else {
      setIndex((prev) => prev + 1);
      setAnswer("");
      setFeedback(null);
    }
  }

  const displayWord = currentWord.word.replace("_", answer);

  return (
    <div className="card animate-pop space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Word {index + 1} of {words.length}
        </p>
        <p className="text-slate-600 mt-2">Fill in the missing letter</p>
      </div>

      {/* Word Display */}
      <div className="text-center">
        <div className="text-5xl font-extrabold text-slate-800 tracking-widest">
          {displayWord.split("").map((char, i) => (
            <span
              key={i}
              className={`inline-block w-14 h-16 mx-1 border-b-4 ${
                char === "_" || (i === currentWord.word.indexOf("_") && answer === "")
                  ? "border-indigo-500 text-indigo-500"
                  : "border-slate-300 text-slate-800"
              }`}
            >
              {char === "_" && answer === "" ? "?" : char}
            </span>
          ))}
        </div>
        {currentWord.hint && (
          <p className="text-slate-500 mt-4">Hint: {currentWord.hint}</p>
        )}
      </div>

      {/* Letter Options */}
      <div className="flex flex-wrap justify-center gap-3">
        {currentWord.options.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleLetterClick(letter)}
            disabled={feedback}
            className={`w-14 h-14 rounded-xl font-bold text-2xl transition ${
              feedback
                ? "opacity-50 cursor-not-allowed"
                : "bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400 hover:scale-110 hover:bg-indigo-50"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="text-center">
          <p className="text-sm text-slate-500">Your answer:</p>
          <p className="text-2xl font-bold text-indigo-600">{answer}</p>
        </div>
      )}

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">Correct! 🎉</p>
      )}
      {feedback === "wrong" && (
        <p className="text-center text-rose-600 font-bold text-lg">
          The correct answer is: {currentWord.missingLetter}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={handleBackspace} disabled={!answer || feedback} className="btn-ghost flex-1">
          ⌫ Backspace
        </button>
        <button onClick={skipWord} className="btn-ghost flex-1">
          Skip
        </button>
        <button onClick={checkAnswer} disabled={!answer || feedback} className="btn-primary flex-1">
          Check
        </button>
      </div>
    </div>
  );
}
