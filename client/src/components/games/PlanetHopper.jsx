import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "planethopper" games: jump between planets.
export default function PlanetHopper({ content, onFinish }) {
  const [planets, setPlanets] = useState([]);
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lives, setLives] = useState(3);
  const [isJumping, setIsJumping] = useState(false);
  const targetPlanets = 5;

  useEffect(() => {
    if (!gameStarted) return;

    const planetData = [
      { name: "Mercury", color: "bg-gray-400", icon: "⚪" },
      { name: "Venus", color: "bg-amber-300", icon: "🟡" },
      { name: "Earth", color: "bg-blue-500", icon: "🌍" },
      { name: "Mars", color: "bg-red-500", icon: "🔴" },
      { name: "Jupiter", color: "bg-orange-400", icon: "🟠" },
    ];

    setPlanets(planetData.slice(0, targetPlanets));
  }, [gameStarted]);

  function jumpToNextPlanet() {
    if (!gameStarted || gameOver || isJumping) return;

    setIsJumping(true);
    sounds.click();

    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        sounds.correct();
        setScore((prev) => prev + 25);
        setCurrentPlanet((prev) => prev + 1);

        if (currentPlanet + 1 >= targetPlanets - 1) {
          sounds.success();
          setGameOver(true);
        }
      } else {
        sounds.wrong();
        setLives((prev) => prev - 1);
        if (lives <= 1) {
          setGameOver(true);
        }
      }

      setIsJumping(false);
    }, 800);
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCurrentPlanet(0);
    setLives(3);
    setIsJumping(false);
  }

  function endGame() {
    const fractionCorrect = currentPlanet / targetPlanets;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🪐 Planet Hopper</h2>
        <p className="text-slate-600">Jump between planets to explore the solar system!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">How to Play:</p>
          <p className="text-amber-600">Click or press SPACE to jump to the next planet</p>
          <p className="text-amber-600">You have 3 lives - don't miss!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Journey
        </button>
      </div>
    );
  }

  if (gameOver) {
    const won = currentPlanet >= targetPlanets - 1;
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${won ? "text-emerald-600" : "text-rose-600"}`}>
          {won ? "🎉 Journey Complete!" : "Mission Failed!"}
        </h2>
        <p className="text-slate-600">
          Visited {currentPlanet + 1} out of {targetPlanets} planets
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
        <p className="text-slate-500">Score: {score}</p>
        <p className="text-slate-500">Progress: {currentPlanet + 1}/{targetPlanets}</p>
        <p className="text-slate-500">Lives: {"❤️".repeat(lives)}</p>
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-2xl h-80 overflow-hidden border-4 border-indigo-400">
        {/* Stars background */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Planets */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-4 px-4 pb-4">
          {planets.map((planet, index) => {
            const isCurrent = index === currentPlanet;
            const isVisited = index < currentPlanet;
            const isNext = index === currentPlanet + 1;

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full ${planet.color} flex items-center justify-center text-2xl shadow-lg transition-all ${
                    isCurrent ? "scale-125 ring-4 ring-white" : isVisited ? "opacity-50" : isNext ? "scale-110" : "opacity-30"
                  }`}
                >
                  {planet.icon}
                </div>
                <p className={`text-xs mt-1 ${isCurrent ? "text-white font-bold" : "text-slate-400"}`}>
                  {planet.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Astronaut (player) */}
        <div
          className={`absolute text-4xl transition-all ${isJumping ? "animate-bounce" : ""}`}
          style={{
            left: `${20 + currentPlanet * 15}%`,
            bottom: isJumping ? "60%" : "35%",
            transform: "translateX(-50%)",
          }}
        >
          👨‍🚀
        </div>
      </div>

      {/* Jump Button */}
      <button
        onClick={jumpToNextPlanet}
        disabled={isJumping || gameOver}
        className={`btn-primary text-xl py-4 w-full ${isJumping ? "opacity-50" : ""}`}
      >
        {isJumping ? "Jumping..." : "🚀 Jump to Next Planet"}
      </button>

      {/* Instructions */}
      <p className="text-center text-slate-500 text-sm">
        Press SPACE or click to jump
      </p>
    </div>
  );
}
