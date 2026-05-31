import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "sentencebuilder" games: build sentences to unlock doors and paths.
export default function SentenceBuilderAdventure({ content, onFinish }) {
  const levels = content.levels || [
    {
      id: 1,
      door: "🚪",
      doorName: "Forest Door",
      hint: "Make a sentence about a cat",
      words: ["The", "cat", "sleeps", "on", "the", "bed"],
      correctOrder: ["The", "cat", "sleeps", "on", "the", "bed"],
    },
    {
      id: 2,
      door: "🏰",
      doorName: "Castle Gate",
      hint: "Make a sentence about playing",
      words: ["We", "play", "football", "in", "the", "park"],
      correctOrder: ["We", "play", "football", "in", "the", "park"],
    },
    {
      id: 3,
      door: "🏠",
      doorName: "Home Door",
      hint: "Make a sentence about reading",
      words: ["She", "reads", "books", "every", "day"],
      correctOrder: ["She", "reads", "books", "every", "day"],
    },
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [remainingWords, setRemainingWords] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const level = levels[currentLevel];
  const isLastLevel = currentLevel === levels.length - 1;

  function startLevel() {
    setSelectedWords([]);
    setRemainingWords([...level.words]);
    setFeedback(null);
  }

  useEffect(() => {
    if (gameStarted) {
      startLevel();
    }
  }, [currentLevel, gameStarted]);

  function addWord(word) {
    if (feedback) return;
    setSelectedWords((prev) => [...prev, word]);
    setRemainingWords((prev) => prev.filter((w) => w !== word));
    sounds.click();
  }

  function removeWord(index) {
    if (feedback) return;
    const word = selectedWords[index];
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    setRemainingWords((prev) => [...prev, word]);
  }

  function checkSentence() {
    if (selectedWords.length === 0) return;
    
    const isCorrect =
      JSON.stringify(selectedWords) === JSON.stringify(level.correctOrder);
    
    if (isCorrect) {
      sounds.correct();
      setScore((prev) => prev + 100);
      setFeedback("correct");
      
      setTimeout(() => {
        if (isLastLevel) {
          sounds.success();
          setVictory(true);
          setGameOver(true);
        } else {
          setCurrentLevel((prev) => prev + 1);
        }
      }, 1500);
    } else {
      sounds.wrong();
      setFeedback("wrong");
      setTimeout(() => {
        startLevel();
      }, 1500);
    }
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setCurrentLevel(0);
    setScore(0);
    setFeedback(null);
  }

  function endGame() {
    const fractionCorrect = currentLevel / levels.length;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🚪 Sentence Builder Adventure</h2>
        <p className="text-slate-600">Build correct sentences to unlock doors and paths!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">How to Play:</p>
          <p className="text-amber-600">📝 Arrange words in correct order</p>
          <p className="text-amber-600">🚪 Build sentences to unlock doors</p>
          <p className="text-amber-600">🗺️ Progress through all levels to win!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Adventure
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${victory ? "text-emerald-600" : "text-rose-600"}`}>
          {victory ? "🎉 Adventure Complete!" : "💀 Try Again!"}
        </h2>
        <p className="text-slate-600">
          {victory ? "You unlocked all doors!" : "Keep practicing!"}
        </p>
        <p className="text-2xl font-bold text-indigo-600">Score: {score}</p>
        <div className="flex gap-3">
          <button onClick={startGame} className="btn-primary flex-1">
            Try Again
          </button>
          <button onClick={endGame} className="btn-ghost flex-1">
            Finish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Level {currentLevel + 1}/{levels.length}</p>
        <p className="text-slate-500">Score: {score}</p>
      </div>

      {/* Door Display */}
      <div className="relative bg-gradient-to-b from-amber-100 via-orange-100 to-amber-200 rounded-2xl h-48 overflow-hidden border-4 border-amber-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-2">{level.door}</div>
            <p className="text-amber-800 font-bold text-xl">{level.doorName}</p>
            <p className="text-amber-600 text-sm">Build a sentence to unlock!</p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
        <p className="text-sm font-semibold text-slate-500 mb-1">Hint:</p>
        <p className="text-lg font-bold text-slate-800">{level.hint}</p>
      </div>

      {/* Sentence Builder Area */}
      <div className="bg-indigo-50 rounded-2xl p-6 min-h-[120px] border-2 border-indigo-200">
        <p className="text-sm font-semibold text-slate-500 mb-3">Your Sentence:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedWords.length === 0 ? (
            <p className="text-slate-400 italic">Click words below to build your sentence...</p>
          ) : (
            selectedWords.map((word, index) => (
              <button
                key={index}
                onClick={() => removeWord(index)}
                disabled={feedback}
                className={`px-4 py-2 rounded-xl font-bold text-lg transition ${
                  feedback
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
                }`}
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Words */}
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-3">Available Words:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {remainingWords.map((word, index) => (
            <button
              key={index}
              onClick={() => addWord(word)}
              disabled={feedback}
              className={`px-4 py-2 rounded-xl font-bold text-lg transition ${
                feedback
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">
          Correct! Door unlocked! 🎉
        </p>
      )}
      {feedback === "wrong" && (
        <p className="text-center text-rose-600 font-bold text-lg">
          Wrong order! Try again.
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={startLevel} className="btn-ghost flex-1">
          Reset
        </button>
        <button onClick={checkSentence} disabled={selectedWords.length === 0 || feedback} className="btn-primary flex-1">
          Check Sentence
        </button>
      </div>
    </div>
  );
}
