import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "languagemysteryisland" games: escape island with hidden clues and puzzles.
export default function LanguageMysteryIsland({ content, onFinish }) {
  const puzzles = content.puzzles || [
    {
      id: 1,
      location: "🏝️ Beach",
      clue: "I have letters but no words. What am I?",
      answer: "ALPHABET",
      hint: "A B C D E...",
      reward: "🗝️ Ancient Key",
    },
    {
      id: 2,
      location: "🌴 Jungle",
      clue: "I have a spine but no bones. What am I?",
      answer: "BOOK",
      hint: "You read me",
      reward: "🗺️ Treasure Map",
    },
    {
      id: 3,
      location: "🏛️ Temple",
      clue: "I can be long or short. I can be grown or cut. What am I?",
      answer: "HAIR",
      hint: "On your head",
      reward: "💎 Escape Crystal",
    },
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [collectedItems, setCollectedItems] = useState([]);
  const [solvedPuzzles, setSolvedPuzzles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const puzzle = puzzles[currentPuzzle];
  const isLastPuzzle = currentPuzzle === puzzles.length - 1;

  function selectLocation(index) {
    if (solvedPuzzles.includes(index)) return;
    setSelectedLocation(index);
    setCurrentPuzzle(index);
  }

  function submitAnswer() {
    if (userAnswer.toUpperCase() === puzzle.answer) {
      sounds.correct();
      setScore((prev) => prev + 150);
      setCollectedItems((prev) => [...prev, puzzle.reward]);
      setSolvedPuzzles((prev) => [...prev, currentPuzzle]);
      setFeedback("correct");
      setSelectedLocation(null);

      setTimeout(() => {
        if (solvedPuzzles.length + 1 >= puzzles.length) {
          sounds.success();
          setVictory(true);
          setGameOver(true);
        } else {
          setUserAnswer("");
          setFeedback(null);
        }
      }, 1500);
    } else {
      sounds.wrong();
      setFeedback("wrong");
      setTimeout(() => {
        setUserAnswer("");
        setFeedback(null);
      }, 1500);
    }
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setCurrentPuzzle(0);
    setUserAnswer("");
    setCollectedItems([]);
    setSolvedPuzzles([]);
    setFeedback(null);
    setSelectedLocation(null);
  }

  function endGame() {
    const fractionCorrect = solvedPuzzles.length / puzzles.length;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🏝️ Language Mystery Island</h2>
        <p className="text-slate-600">Escape the island by solving language puzzles!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">How to Play:</p>
          <p className="text-amber-600">🗺️ Explore different locations on the island</p>
          <p className="text-amber-600">🧩 Solve riddles and word puzzles</p>
          <p className="text-amber-600">🎁 Collect items to escape!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Mystery
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${victory ? "text-emerald-600" : "text-rose-600"}`}>
          {victory ? "🎉 Escaped!" : "💀 Trapped!"}
        </h2>
        <p className="text-slate-600">
          {victory ? "You solved all puzzles and escaped!" : "Keep trying!"}
        </p>
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-500 mb-2">Collected Items:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {collectedItems.map((item, index) => (
              <span key={index} className="text-2xl">{item}</span>
            ))}
          </div>
        </div>
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

  if (selectedLocation !== null && !solvedPuzzles.includes(selectedLocation)) {
    return (
      <div className="card animate-pop space-y-6">
        <div className="text-center">
          <p className="text-4xl mb-2">{puzzle.location}</p>
          <p className="text-slate-600">Solve the puzzle to continue!</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-indigo-200">
          <p className="text-sm font-semibold text-slate-500 mb-2">Riddle:</p>
          <p className="text-xl font-bold text-slate-800 text-center">{puzzle.clue}</p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
          <p className="text-sm font-semibold text-amber-700 mb-1">Hint:</p>
          <p className="text-amber-600">{puzzle.hint}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-2">Your Answer:</label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-400 text-xl font-bold text-center uppercase"
            placeholder="Type your answer..."
            maxLength={15}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={() => setSelectedLocation(null)} className="btn-ghost flex-1">
            Back
          </button>
          <button onClick={submitAnswer} disabled={!userAnswer} className="btn-primary flex-1">
            Submit
          </button>
        </div>

        {feedback === "correct" && (
          <p className="text-center text-emerald-600 font-bold text-lg animate-pop">
            Correct! You found: {puzzle.reward} 🎉
          </p>
        )}
        {feedback === "wrong" && (
          <p className="text-center text-rose-600 font-bold text-lg">
            Wrong answer! Try again.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Score: {score}</p>
        <p className="text-slate-500">Solved: {solvedPuzzles.length}/{puzzles.length}</p>
      </div>

      {/* Island Map */}
      <div className="relative bg-gradient-to-b from-cyan-100 via-teal-100 to-emerald-100 rounded-2xl h-72 overflow-hidden border-4 border-teal-300">
        {/* Island Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-8xl opacity-20">🏝️</div>
        </div>

        {/* Locations */}
        <div className="absolute inset-0">
          {puzzles.map((puzzle, index) => {
            const isSolved = solvedPuzzles.includes(index);
            const positions = [
              { x: 20, y: 30 },
              { x: 50, y: 60 },
              { x: 80, y: 40 },
            ];
            const pos = positions[index] || { x: 50, y: 50 };
            
            return (
              <button
                key={puzzle.id}
                onClick={() => selectLocation(index)}
                disabled={isSolved}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  isSolved ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg ${
                    isSolved ? "bg-emerald-200 ring-4 ring-emerald-500" : "bg-white ring-4 ring-teal-400"
                  }`}
                >
                  {puzzle.location.split(" ")[0]}
                </div>
                <p className={`text-xs mt-2 font-semibold ${isSolved ? "text-emerald-600" : "text-teal-600"}`}>
                  {puzzle.location.split(" ")[1]}
                </p>
                {isSolved && <p className="text-xs text-emerald-500">✅ Solved</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collected Items */}
      <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
        <p className="text-sm font-semibold text-slate-500 mb-2">Collected Items:</p>
        <div className="flex flex-wrap gap-2">
          {collectedItems.length > 0 ? (
            collectedItems.map((item, index) => (
              <span key={index} className="text-2xl animate-pop">{item}</span>
            ))
          ) : (
            <p className="text-slate-400 italic">No items collected yet...</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-slate-500 text-sm">
        Click on locations to solve puzzles and collect items
      </p>
    </div>
  );
}
