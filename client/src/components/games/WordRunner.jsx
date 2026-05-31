import { useState, useEffect, useCallback } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "wordrunner" games: endless runner collecting words.
export default function WordRunner({ content, onFinish }) {
  const words = content.words || ["CAT", "DOG", "SUN", "RUN", "FUN", "WIN"];
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [collectedWords, setCollectedWords] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wordItems, setWordItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const targetWords = words.slice(0, 5);
  const allCollected = collectedWords.length === targetWords.length;

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Spawn word items
    const spawnInterval = setInterval(() => {
      if (wordItems.length < 3) {
        const randomWord = targetWords[Math.floor(Math.random() * targetWords.length)];
        setWordItems((prev) => [
          ...prev,
          {
            word: randomWord,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            id: Date.now(),
          },
        ]);
      }
    }, 2000);

    // Spawn obstacles
    const obstacleInterval = setInterval(() => {
      if (obstacles.length < 2) {
        setObstacles((prev) => [
          ...prev,
          {
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            id: Date.now(),
          },
        ]);
      }
    }, 3000);

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
      clearInterval(obstacleInterval);
      clearInterval(timerInterval);
    };
  }, [gameStarted, gameOver, wordItems.length, obstacles.length, targetWords]);

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

  // Check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Check word collection
    wordItems.forEach((item) => {
      const distance = Math.sqrt(
        Math.pow(playerX - item.x, 2) + Math.pow(playerY - item.y, 2)
      );
      if (distance < 10) {
        sounds.correct();
        setCollectedWords((prev) => [...prev, item.word]);
        setScore((prev) => prev + 10);
        setWordItems((prev) => prev.filter((w) => w.id !== item.id));
      }
    });

    // Check obstacle collision
    obstacles.forEach((obs) => {
      const distance = Math.sqrt(
        Math.pow(playerX - obs.x, 2) + Math.pow(playerY - obs.y, 2)
      );
      if (distance < 8) {
        sounds.wrong();
        setGameOver(true);
      }
    });
  }, [playerX, playerY, wordItems, obstacles, gameStarted, gameOver]);

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCollectedWords([]);
    setWordItems([]);
    setObstacles([]);
    setTimeLeft(30);
    setPlayerX(50);
    setPlayerY(50);
  }

  function endGame() {
    const fractionCorrect = collectedWords.length / targetWords.length;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🏃 Word Runner</h2>
        <p className="text-slate-600">Collect all the words before time runs out!</p>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-500 mb-2">Words to collect:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {targetWords.map((word, i) => (
              <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
                {word}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">Controls:</p>
          <p className="text-amber-600">Arrow Keys or WASD to move</p>
          <p className="text-amber-600">⚠️ Avoid the red obstacles!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Game
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-rose-600">Game Over!</h2>
        <p className="text-slate-600">
          You collected {collectedWords.length} out of {targetWords.length} words
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

  if (allCollected) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-emerald-600">🎉 You Win!</h2>
        <p className="text-slate-600">You collected all the words!</p>
        <p className="text-2xl font-bold text-indigo-600">Score: {score}</p>
        <button onClick={endGame} className="btn-primary">
          Finish
        </button>
      </div>
    );
  }

  return (
    <div className="card animate-pop space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Score: {score}</p>
        <p className={`text-xl font-bold ${timeLeft <= 5 ? "text-rose-500" : "text-slate-700"}`}>
          ⏱️ {timeLeft}s
        </p>
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-sky-100 to-sky-200 rounded-2xl h-96 overflow-hidden border-4 border-sky-300">
        {/* Player */}
        <div
          className="absolute w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all"
          style={{ left: `${playerX}%`, top: `${playerY}%`, transform: "translate(-50%, -50%)" }}
        >
          🏃
        </div>

        {/* Word Items */}
        {wordItems.map((item) => (
          <div
            key={item.id}
            className="absolute bg-white rounded-xl px-3 py-2 shadow-md border-2 border-indigo-300 font-bold text-indigo-700 animate-bounce"
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}
          >
            {item.word}
          </div>
        ))}

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute w-10 h-10 bg-rose-500 rounded-full shadow-lg animate-pulse"
            style={{ left: `${obs.x}%`, top: `${obs.y}%`, transform: "translate(-50%, -50%)" }}
          >
            💥
          </div>
        ))}
      </div>

      {/* Collected Words */}
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="text-sm font-semibold text-slate-500 mb-2">Collected:</p>
        <div className="flex flex-wrap gap-2">
          {targetWords.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-full font-bold ${
                collectedWords.includes(word)
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {word}
            </span>
          ))}
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
