import { useState, useEffect, useCallback } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "mathrunner" games: endless runner with math challenges.
export default function MathRunner({ content, onFinish }) {
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [mathProblems, setMathProblems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [solvedCount, setSolvedCount] = useState(0);
  const targetSolve = 5;

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Spawn math problems
    const spawnInterval = setInterval(() => {
      if (mathProblems.length < 3 && !currentProblem) {
        const ops = ["+", "-", "×"];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a, b, answer;
        
        if (op === "+") {
          a = Math.floor(Math.random() * 10) + 1;
          b = Math.floor(Math.random() * 10) + 1;
          answer = a + b;
        } else if (op === "-") {
          a = Math.floor(Math.random() * 10) + 5;
          b = Math.floor(Math.random() * 5) + 1;
          answer = a - b;
        } else {
          a = Math.floor(Math.random() * 5) + 1;
          b = Math.floor(Math.random() * 5) + 1;
          answer = a * b;
        }

        setMathProblems((prev) => [
          ...prev,
          {
            problem: `${a} ${op} ${b} = ?`,
            answer,
            x: Math.random() * 70 + 15,
            y: Math.random() * 60 + 20,
            id: Date.now(),
          },
        ]);
      }
    }, 2500);

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
  }, [gameStarted, gameOver, mathProblems.length, currentProblem]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!gameStarted || gameOver || currentProblem) return;

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
    [gameStarted, gameOver, currentProblem]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Check collision with math problems
  useEffect(() => {
    if (!gameStarted || gameOver || currentProblem) return;

    mathProblems.forEach((problem) => {
      const distance = Math.sqrt(
        Math.pow(playerX - problem.x, 2) + Math.pow(playerY - problem.y, 2)
      );
      if (distance < 10) {
        sounds.click();
        setCurrentProblem(problem);
        setMathProblems((prev) => prev.filter((p) => p.id !== problem.id));
      }
    });
  }, [playerX, playerY, mathProblems, gameStarted, gameOver, currentProblem]);

  function solveProblem(userAnswer) {
    if (parseInt(userAnswer) === currentProblem.answer) {
      sounds.correct();
      setScore((prev) => prev + 20);
      setSolvedCount((prev) => prev + 1);
      setCurrentProblem(null);
      
      if (solvedCount + 1 >= targetSolve) {
        sounds.success();
        setGameOver(true);
      }
    } else {
      sounds.wrong();
      setScore((prev) => Math.max(0, prev - 5));
      setCurrentProblem(null);
    }
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSolvedCount(0);
    setMathProblems([]);
    setCurrentProblem(null);
    setTimeLeft(30);
    setPlayerX(50);
    setPlayerY(50);
  }

  function endGame() {
    const fractionCorrect = solvedCount / targetSolve;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">🏃 Math Runner</h2>
        <p className="text-slate-600">Solve {targetSolve} math problems before time runs out!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">Controls:</p>
          <p className="text-amber-600">Arrow Keys or WASD to move</p>
          <p className="text-amber-600">Collect math problems to solve them!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Game
        </button>
      </div>
    );
  }

  if (gameOver) {
    const won = solvedCount >= targetSolve;
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${won ? "text-emerald-600" : "text-rose-600"}`}>
          {won ? "🎉 You Win!" : "Game Over!"}
        </h2>
        <p className="text-slate-600">
          Solved {solvedCount} out of {targetSolve} problems
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

  if (currentProblem) {
    const answers = [
      currentProblem.answer,
      currentProblem.answer + Math.floor(Math.random() * 3) + 1,
      currentProblem.answer - Math.floor(Math.random() * 3) - 1,
      currentProblem.answer + Math.floor(Math.random() * 5) - 2,
    ].sort(() => Math.random() - 0.5);

    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">Solve This!</h2>
        <p className="text-5xl font-bold text-slate-800">{currentProblem.problem}</p>
        <div className="grid grid-cols-2 gap-3">
          {answers.map((ans, i) => (
            <button
              key={i}
              onClick={() => solveProblem(ans)}
              className="btn text-2xl py-4 bg-indigo-500 text-white hover:bg-indigo-600"
            >
              {ans}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-pop space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Score: {score}</p>
        <p className="text-slate-500">Solved: {solvedCount}/{targetSolve}</p>
        <p className={`text-xl font-bold ${timeLeft <= 5 ? "text-rose-500" : "text-slate-700"}`}>
          ⏱️ {timeLeft}s
        </p>
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-purple-100 to-purple-200 rounded-2xl h-96 overflow-hidden border-4 border-purple-300">
        {/* Player */}
        <div
          className="absolute w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all"
          style={{ left: `${playerX}%`, top: `${playerY}%`, transform: "translate(-50%, -50%)" }}
        >
          🏃
        </div>

        {/* Math Problems */}
        {mathProblems.map((problem) => (
          <div
            key={problem.id}
            className="absolute bg-white rounded-xl px-4 py-2 shadow-md border-2 border-purple-300 font-bold text-purple-700 animate-bounce"
            style={{ left: `${problem.x}%`, top: `${problem.y}%`, transform: "translate(-50%, -50%)" }}
          >
            {problem.problem}
          </div>
        ))}
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
