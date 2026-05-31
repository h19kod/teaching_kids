import { useState } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "wordworldodyssey" games: open world travel between cities with word puzzles.
export default function WordWorldOdyssey({ content, onFinish }) {
  const cities = content.cities || [
    { id: 1, name: "Wordville", icon: "🏘️", color: "bg-blue-400", puzzle: { word: "BOOK", hint: "Something you read" } },
    { id: 2, name: "Grammar City", icon: "🏛️", color: "bg-amber-400", puzzle: { word: "RULE", hint: "Something you follow" } },
    { id: 3, name: "Spelltown", icon: "🏰", color: "bg-purple-400", puzzle: { word: "MAGIC", hint: "Something wizards do" } },
    { id: 4, name: "Vocabulary Village", icon: "🌳", color: "bg-green-400", puzzle: { word: "LEARN", hint: "What you do at school" } },
  ];
  
  const [currentCity, setCurrentCity] = useState(0);
  const [unlockedCities, setUnlockedCities] = useState([0]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [visitedCities, setVisitedCities] = useState([]);

  function selectCity(index) {
    if (unlockedCities.includes(index)) {
      setCurrentCity(index);
      if (!visitedCities.includes(index)) {
        setVisitedCities((prev) => [...prev, index]);
        setCurrentPuzzle(cities[index].puzzle);
      }
    }
  }

  function solvePuzzle() {
    if (userAnswer.toUpperCase() === currentPuzzle.word) {
      sounds.correct();
      setScore((prev) => prev + 100);
      setUnlockedCities((prev) => {
        const nextCity = currentCity + 1;
        if (nextCity < cities.length && !prev.includes(nextCity)) {
          return [...prev, nextCity];
        }
        return prev;
      });
      setCurrentPuzzle(null);
      setUserAnswer("");
      
      if (unlockedCities.length + 1 >= cities.length) {
        sounds.success();
        setGameOver(true);
      }
    } else {
      sounds.wrong();
      setUserAnswer("");
    }
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setCurrentCity(0);
    setUnlockedCities([0]);
    setCurrentPuzzle(null);
    setScore(0);
    setUserAnswer("");
    setVisitedCities([]);
  }

  function endGame() {
    const fractionCorrect = unlockedCities.length / cities.length;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🌍 Word World Odyssey</h2>
        <p className="text-slate-600">Travel between cities by solving word puzzles!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">How to Play:</p>
          <p className="text-amber-600">🗺️ Visit cities in order</p>
          <p className="text-amber-600">📝 Solve word puzzles to unlock next city</p>
          <p className="text-amber-600">🏆 Visit all cities to win!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Journey
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-emerald-600">🎉 Journey Complete!</h2>
        <p className="text-slate-600">You visited all cities!</p>
        <p className="text-2xl font-bold text-indigo-600">Score: {score}</p>
        <button onClick={endGame} className="btn-primary">
          Finish
        </button>
      </div>
    );
  }

  if (currentPuzzle) {
    return (
      <div className="card animate-pop space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {cities[currentCity].name}
          </p>
          <p className="text-slate-600 mt-2">Solve the puzzle to continue!</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-indigo-200">
          <p className="text-sm font-semibold text-slate-500 mb-2">Hint:</p>
          <p className="text-xl font-bold text-slate-800 text-center">{currentPuzzle.hint}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-2">Your Answer:</label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-400 text-xl font-bold text-center uppercase"
            placeholder="Type the word..."
            maxLength={10}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={() => setCurrentPuzzle(null)} className="btn-ghost flex-1">
            Back
          </button>
          <button onClick={solvePuzzle} disabled={!userAnswer} className="btn-primary flex-1">
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-pop space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Score: {score}</p>
        <p className="text-slate-500">Visited: {visitedCities.length}/{cities.length}</p>
      </div>

      {/* Map */}
      <div className="relative bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100 rounded-2xl h-80 overflow-hidden border-4 border-blue-300">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {cities.map((city, index) => {
            if (index === cities.length - 1) return null;
            const x1 = 20 + index * 20;
            const y1 = 50;
            const x2 = 20 + (index + 1) * 20;
            const y2 = 50;
            const isUnlocked = unlockedCities.includes(index + 1);
            return (
              <line
                key={index}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke={isUnlocked ? "#10b981" : "#d1d5db"}
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Cities */}
        {cities.map((city, index) => {
          const isUnlocked = unlockedCities.includes(index);
          const isCurrent = currentCity === index;
          const isVisited = visitedCities.includes(index);
          
          return (
            <button
              key={city.id}
              onClick={() => selectCity(index)}
              disabled={!isUnlocked}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                !isUnlocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110"
              }`}
              style={{ left: `${20 + index * 20}%`, top: "50%" }}
            >
              <div
                className={`w-16 h-16 rounded-full ${city.color} flex items-center justify-center text-3xl shadow-lg ${
                  isCurrent ? "ring-4 ring-indigo-500 scale-125" : isVisited ? "ring-2 ring-emerald-500" : ""
                }`}
              >
                {city.icon}
              </div>
              <p className={`text-xs mt-2 font-semibold ${isCurrent ? "text-indigo-600" : isVisited ? "text-emerald-600" : "text-slate-400"}`}>
                {city.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Current City Info */}
      {cities[currentCity] && (
        <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
          <p className="text-sm font-semibold text-slate-500">Current Location:</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-4xl">{cities[currentCity].icon}</span>
            <div>
              <p className="text-xl font-bold text-slate-800">{cities[currentCity].name}</p>
              <p className="text-slate-500">
                {visitedCities.includes(currentCity) ? "✅ Visited" : "📍 Current"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <p className="text-center text-slate-500 text-sm">
        Click on unlocked cities to visit them
      </p>
    </div>
  );
}
