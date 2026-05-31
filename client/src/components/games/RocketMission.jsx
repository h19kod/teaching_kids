import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "rocketmission" games: launch rocket and collect stars.
export default function RocketMission({ content, onFinish }) {
  const [rocketY, setRocketY] = useState(80);
  const [stars, setStars] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [fuel, setFuel] = useState(100);
  const [altitude, setAltitude] = useState(0);
  const targetAltitude = 1000;

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Spawn stars
    const starInterval = setInterval(() => {
      if (stars.length < 5) {
        setStars((prev) => [
          ...prev,
          {
            x: Math.random() * 80 + 10,
            y: Math.random() * 70 + 10,
            id: Date.now(),
          },
        ]);
      }
    }, 1500);

    // Spawn obstacles (asteroids)
    const obstacleInterval = setInterval(() => {
      if (obstacles.length < 3) {
        setObstacles((prev) => [
          ...prev,
          {
            x: Math.random() * 80 + 10,
            y: Math.random() * 70 + 10,
            id: Date.now(),
          },
        ]);
      }
    }, 2000);

    // Fuel consumption
    const fuelInterval = setInterval(() => {
      setFuel((prev) => {
        if (prev <= 0) {
          setGameOver(true);
          sounds.wrong();
          return 0;
        }
        return prev - 1;
      });
    }, 200);

    // Altitude increase
    const altitudeInterval = setInterval(() => {
      setAltitude((prev) => {
        if (prev >= targetAltitude) {
          sounds.success();
          setGameOver(true);
          return targetAltitude;
        }
        return prev + 10;
      });
    }, 300);

    return () => {
      clearInterval(starInterval);
      clearInterval(obstacleInterval);
      clearInterval(fuelInterval);
      clearInterval(altitudeInterval);
    };
  }, [gameStarted, gameOver, stars.length, obstacles.length]);

  function moveRocket(direction) {
    if (!gameStarted || gameOver) return;
    
    const step = 5;
    if (direction === "up" && rocketY > 5 && fuel > 0) {
      setRocketY((prev) => prev - step);
      setFuel((prev) => prev - 2);
      sounds.click();
    } else if (direction === "down" && rocketY < 85) {
      setRocketY((prev) => prev + step);
      sounds.click();
    } else if (direction === "left") {
      setRocketY((prev) => prev);
      sounds.click();
    } else if (direction === "right") {
      setRocketY((prev) => prev);
      sounds.click();
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          moveRocket("up");
          break;
        case "ArrowDown":
        case "s":
          moveRocket("down");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver, rocketY]);

  // Check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Check star collection
    stars.forEach((star) => {
      const distance = Math.abs(rocketY - star.y);
      if (distance < 10) {
        sounds.correct();
        setScore((prev) => prev + 15);
        setFuel((prev) => Math.min(100, prev + 10));
        setStars((prev) => prev.filter((s) => s.id !== star.id));
      }
    });

    // Check obstacle collision
    obstacles.forEach((obs) => {
      const distance = Math.abs(rocketY - obs.y);
      if (distance < 8) {
        sounds.wrong();
        setFuel((prev) => Math.max(0, prev - 20));
        setObstacles((prev) => prev.filter((o) => o.id !== obs.id));
      }
    });
  }, [rocketY, stars, obstacles, gameStarted, gameOver]);

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setRocketY(80);
    setStars([]);
    setObstacles([]);
    setFuel(100);
    setAltitude(0);
  }

  function endGame() {
    const fractionCorrect = altitude / targetAltitude;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🚀 Rocket Mission</h2>
        <p className="text-slate-600">Launch your rocket to space! Collect stars and avoid asteroids!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">Controls:</p>
          <p className="text-amber-600">Arrow Up or W to go up (uses fuel)</p>
          <p className="text-amber-600">Arrow Down or S to go down</p>
          <p className="text-amber-600">⭐ Collect stars for fuel and points!</p>
          <p className="text-amber-600">☄️ Avoid asteroids!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Launch Rocket
        </button>
      </div>
    );
  }

  if (gameOver) {
    const won = altitude >= targetAltitude;
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${won ? "text-emerald-600" : "text-rose-600"}`}>
          {won ? "🎉 Mission Complete!" : "Mission Failed!"}
        </h2>
        <p className="text-slate-600">Altitude: {altitude}m / {targetAltitude}m</p>
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
        <p className="text-slate-500">Altitude: {altitude}m</p>
        <p className={`font-bold ${fuel <= 20 ? "text-rose-500" : "text-slate-700"}`}>
          ⛽ {fuel}%
        </p>
      </div>

      {/* Fuel Bar */}
      <div className="h-4 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-all ${fuel <= 20 ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{ width: `${fuel}%` }}
        />
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 rounded-2xl h-96 overflow-hidden border-4 border-indigo-400">
        {/* Stars background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
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

        {/* Rocket */}
        <div
          className="absolute w-10 h-14 flex flex-col items-center transition-all"
          style={{ left: "50%", top: `${rocketY}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="text-4xl">🚀</div>
          <div className="w-2 h-4 bg-orange-500 rounded-full animate-pulse" />
        </div>

        {/* Stars to collect */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute text-3xl animate-pulse"
            style={{ left: `${star.x}%`, top: `${star.y}%`, transform: "translate(-50%, -50%)" }}
          >
            ⭐
          </div>
        ))}

        {/* Asteroids */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute text-3xl animate-spin"
            style={{ left: `${obs.x}%`, top: `${obs.y}%`, transform: "translate(-50%, -50%)" }}
          >
            ☄️
          </div>
        ))}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div></div>
        <button onClick={() => moveRocket("up")} className="btn-ghost">
          ⬆️
        </button>
        <div></div>
        <div></div>
        <button onClick={() => moveRocket("down")} className="btn-ghost">
          ⬇️
        </button>
        <div></div>
      </div>
    </div>
  );
}
