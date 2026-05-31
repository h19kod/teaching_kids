import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "wordbuilder" games: arrange letters to form the correct word.
export default function WordBuilderGame({ content, onFinish }) {
  const words = content.words || [];
  const [index, setIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null

  if (words.length === 0) return <p className="text-slate-400">This game has no words yet.</p>;

  const currentWord = words[index];
  const isLast = index === words.length - 1;

  // Shuffle letters when word changes
  useState(() => {
    if (currentWord) {
      setLetters([...currentWord.word].sort(() => Math.random() - 0.5));
      setPlaced([]);
      setFeedback(null);
    }
  }, [index, currentWord]);

  function placeLetter(letter, letterIndex) {
    if (feedback) return;
    const newPlaced = [...placed, { letter, letterIndex }];
    setPlaced(newPlaced);
    setLetters((prev) => prev.filter((_, i) => i !== letterIndex));
    sounds.click();

    const builtWord = newPlaced.map((p) => p.letter).join("");
    if (builtWord === currentWord.word) {
      sounds.correct();
      setFeedback("correct");
      setTimeout(() => {
        if (isLast) {
          sounds.success();
          onFinish(1);
        } else {
          setIndex((prev) => prev + 1);
        }
      }, 1000);
    }
  }

  function removePlacedLetter(placedIndex) {
    if (feedback) return;
    const removed = placed[placedIndex];
    setPlaced((prev) => prev.filter((_, i) => i !== placedIndex));
    setLetters((prev) => [...prev, removed.letter]);
  }

  function checkAnswer() {
    const builtWord = placed.map((p) => p.letter).join("");
    if (builtWord === currentWord.word) {
      sounds.correct();
      setFeedback("correct");
      setTimeout(() => {
        if (isLast) {
          sounds.success();
          onFinish(1);
        } else {
          setIndex((prev) => prev + 1);
        }
      }, 1000);
    } else {
      sounds.wrong();
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1000);
    }
  }

  function skipWord() {
    if (isLast) {
      onFinish(0);
    } else {
      setIndex((prev) => prev + 1);
    }
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          Word {index + 1} of {words.length}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-2">{currentWord.hint}</p>
      </div>

      {/* Placed Letters */}
      <div className="bg-slate-50 rounded-2xl p-6 min-h-[80px] flex items-center justify-center gap-2 border-2 border-dashed border-slate-300">
        {placed.length === 0 ? (
          <p className="text-slate-400">Drag or tap letters to build the word</p>
        ) : (
          placed.map((p, i) => (
            <button
              key={i}
              onClick={() => removePlacedLetter(i)}
              className={`w-12 h-12 rounded-xl font-bold text-xl transition ${
                feedback === "correct"
                  ? "bg-emerald-500 text-white"
                  : feedback === "wrong"
                  ? "bg-rose-500 text-white"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
            >
              {p.letter}
            </button>
          ))
        )}
      </div>

      {/* Available Letters */}
      <div className="flex flex-wrap justify-center gap-3">
        {letters.map((letter, i) => (
          <button
            key={i}
            onClick={() => placeLetter(letter, i)}
            disabled={feedback}
            className={`w-12 h-12 rounded-xl font-bold text-xl transition ${
              feedback
                ? "opacity-50 cursor-not-allowed"
                : "bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400 hover:scale-110"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-center text-emerald-600 font-bold text-lg">Correct! 🎉</p>
      )}
      {feedback === "wrong" && (
        <p className="text-center text-rose-600 font-bold text-lg">Try again!</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={skipWord} className="btn-ghost flex-1">
          Skip
        </button>
        <button onClick={checkAnswer} disabled={placed.length === 0} className="btn-primary flex-1">
          Check
        </button>
      </div>
    </div>
  );
}
