import { useState, useEffect, useCallback } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "animalrescue" games: rescue animals by moving to them.
export default function AnimalRescue({ content, onFinish }) {
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [animals, setAnimals] = useState([]);
  const [rescued, setRescued] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const targetRescue = 5;

  const animalTypes = [
    { icon: "🐕", name: "Dog" },
    { icon: "🐱", name: "Cat" },
    { icon: "🐰", name: "Rabbit" },
    { icon: "🦊", name: "Fox" },
    { icon: "🐻", name: "Bear" },
    { icon: "🦁", name: "Lion" },
    { icon: "🐼", name: "Panda" },
    { icon: "🐨", name: "Koala" },
  ];

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Spawn animals
    const spawnInterval = setInterval(() => {
      if (animals.length < 4) {
        const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
        setAnimals((prev) => [
          ...prev,
          {
            ...randomAnimal,
            x: Math.random() * 70 + 15,
            y: Math.random() * 60 + 20,
            id: Date.now(),
          },
        ]);
      }
    }, 2000);

    // Timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          sounds.wrong();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
    };
  }, [gameStarted, gameOver, animals.length]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!gameStarted || gameOver) return;

      const step = 8;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          setPlayerY((prev) => Math.max(10, prev - step));
          sounds.click();
          break;
        case "ArrowDown":
        case "s":
          setPlayerY((prev) => Math.min(85, prev + step));
          sounds.click();
          break;
        case "ArrowLeft":
        case "a":
          setPlayerX((prev) => Math.max(5, prev - step));
          sounds.click();
          break;
        case "ArrowRight":
        case "d":
          setPlayerX((prev) => Math.min(90, prev + step));
          sounds.click();
          break;
      }
    },
    [gameStarted, gameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Check animal rescue
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    animals.forEach((animal) => {
      const distance = Math.sqrt(
        Math.pow(playerX - animal.x, 2) + Math.pow(playerY - animal.y, 2)
      );
      if (distance < 10) {
        sounds.correct();
        setScore((prev) => prev + 20);
        setRescued((prev) => prev + 1);
        setAnimals((prev) => prev.filter((a) => a.id !== animal.id));

        if (rescued + 1 >= targetRescue) {
          sounds.success();
          setGameOver(true);
        }
      }
    });
  }, [playerX, playerY, animals, gameStarted, gameOver, rescued]);

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setRescued(0);
    setAnimals([]);
    setTimeLeft(30);
    setPlayerX(50);
    setPlayerY(50);
  }

  function endGame() {
    const fractionCorrect = rescued / targetRescue;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-emerald-600">🐾 Animal Rescue</h2>
        <p className="text-slate-600">Rescue {targetRescue} animals before time runs out!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">Controls:</p>
          <p className="text-amber-600">Arrow Keys or WASD to move</p>
          <p className="text-amber-600">Move near animals to rescue them!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Rescue
        </button>
      </div>
    );
  }

  if (gameOver) {
    const won = rescued >= targetRescue;
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${won ? "text-emerald-600" : "text-rose-600"}`}>
          {won ? "🎉 Rescue Complete!" : "Mission Failed!"}
        </h2>
        <p className="text-slate-600">
          Rescued {rescued} out of {targetRescue} animals
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
    <div className="card animate-pop space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Score: {score}</p>
        <p className="text-slate-500">Rescued: {rescued}/{targetRescue}</p>
        <p className={`text-xl font-bold ${timeLeft <= 5 ? "text-rose-500" : "text-slate-700"}`}>
          ⏱️ {timeLeft}s
        </p>
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-green-100 via-emerald-100 to-green-200 rounded-2xl h-96 overflow-hidden border-4 border-green-300">
        {/* Trees decoration */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${i * 20 + 10}%`,
              bottom: "0",
            }}
          >
            🌲
          </div>
        ))}

        {/* Player (Rescuer) */}
        <div
          className="absolute w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all"
          style={{ left: `${playerX}%`, top: `${playerY}%`, transform: "translate(-50%, -50%)" }}
        >
          🦸
        </div>

        {/* Animals to rescue */}
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="absolute text-4xl animate-bounce"
            style={{ left: `${animal.x}%`, top: `${animal.y}%`, transform: "translate(-50%, -50%)" }}
          >
            {animal.icon}
          </div>
        ))}
      </div>

      {/* Rescued Animals Display */}
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="text-sm font-semibold text-slate-500 mb-2">Rescued Animals:</p>
        <div className="flex flex-wrap gap-2">
          {[...Array(rescued)].map((_, i) => (
            <span key={i} className="text-2xl">🐾</span>
          ))}
          {rescued === 0 && <span className="text-slate-400">None yet...</span>}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div></div>
        <button onClick={() => setPlayerY((prev) => Math.max(10, prev - 8))} className="btn-ghost">
          ⬆️
        </button>
        <div></div>
        <button onClick={() => setPlayerX((prev) => Math.max(5, prev - 8))} className="btn-ghost">
          ⬅️
        </button>
        <button onClick={() => setPlayerY((prev) => Math.min(85, prev + 8))} className="btn-ghost">
          ⬇️
        </button>
        <button onClick={() => setPlayerX((prev) => Math.min(90, prev + 8))} className="btn-ghost">
          ➡️
        </button>
      </div>
    </div>
  );
}
