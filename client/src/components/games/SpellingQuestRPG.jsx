import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "spellingquestrpg" games: RPG-style game with spelling levels.
export default function SpellingQuestRPG({ content, onFinish }) {
  const levels = content.levels || [
    { word: "ADVENTURE", hint: "An exciting experience", boss: "🐺", bossName: "Wolf Warrior" },
    { word: "KNOWLEDGE", hint: "Information and understanding", boss: "🦅", bossName: "Eagle Sage" },
    { word: "VICTORY", hint: "Winning a battle or competition", boss: "🦁", bossName: "Lion King" },
  ];
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [playerHP, setPlayerHP] = useState(100);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [bossHP, setBossHP] = useState(levels[0]?.word?.length * 10 || 70);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const level = levels[currentLevel];
  const isLastLevel = currentLevel === levels.length - 1;

  useEffect(() => {
    if (!gameStarted) return;
    const word = level.word;
    const letters = word.split("").sort(() => Math.random() - 0.5);
    setScrambledLetters(letters);
    setCurrentWord("");
    setBossHP(word.length * 10);
  }, [currentLevel, gameStarted, level.word]);

  function addLetter(letter) {
    if (currentWord.length < level.word.length) {
      setCurrentWord((prev) => prev + letter);
      sounds.click();
    }
  }

  function removeLetter() {
    setCurrentWord((prev) => prev.slice(0, -1));
  }

  function submitWord() {
    if (currentWord === level.word) {
      sounds.correct();
      const damage = 25;
      setBossHP((prev) => Math.max(0, prev - damage));
      setScore((prev) => prev + 50);
      setPlayerXP((prev) => prev + 30);

      if (bossHP - damage <= 0) {
        sounds.success();
        if (isLastLevel) {
          setVictory(true);
          setGameOver(true);
        } else {
          setCurrentLevel((prev) => prev + 1);
          setPlayerHP((prev) => Math.min(100, prev + 20));
        }
      } else {
        // Boss attacks back
        const bossDmg = Math.floor(Math.random() * 15) + 10;
        sounds.wrong();
        setPlayerHP((prev) => {
          const newHP = Math.max(0, prev - bossDmg);
          if (newHP <= 0) {
            setGameOver(true);
          }
          return newHP;
        });
      }
    } else {
      sounds.wrong();
      setPlayerHP((prev) => {
        const newHP = Math.max(0, prev - 15);
        if (newHP <= 0) {
          setGameOver(true);
        }
        return newHP;
      });
    }
    setCurrentWord("");
  }

  // Level up check
  useEffect(() => {
    if (playerXP >= xpToNextLevel) {
      setPlayerLevel((prev) => prev + 1);
      setPlayerXP((prev) => prev - xpToNextLevel);
      setXpToNextLevel((prev) => prev + 50);
      setPlayerHP((prev) => Math.min(100, prev + 30));
      sounds.success();
    }
  }, [playerXP, xpToNextLevel]);

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setCurrentLevel(0);
    setPlayerHP(100);
    setPlayerLevel(1);
    setPlayerXP(0);
    setXpToNextLevel(100);
    setScore(0);
    setCurrentWord("");
  }

  function endGame() {
    const fractionCorrect = currentLevel / levels.length;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">⚔️ Spelling Quest RPG</h2>
        <p className="text-slate-600">Level up by improving your spelling skills!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">How to Play:</p>
          <p className="text-amber-600">📝 Unscramble letters to spell words</p>
          <p className="text-amber-600">⚔️ Correct spelling = Damage boss</p>
          <p className="text-amber-600">📈 Gain XP and level up!</p>
          <p className="text-amber-600">❌ Wrong spelling = Take damage</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Quest
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${victory ? "text-emerald-600" : "text-rose-600"}`}>
          {victory ? "🏆 Quest Complete!" : "💀 Game Over!"}
        </h2>
        <p className="text-slate-600">
          {victory ? "You defeated all bosses!" : "The boss was too strong!"}
        </p>
        <p className="text-slate-600">Final Level: {playerLevel}</p>
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
      {/* Player Stats */}
      <div className="flex justify-between items-center bg-indigo-50 rounded-xl p-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Level {playerLevel}</p>
          <div className="w-24 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(playerXP / xpToNextLevel) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400">{playerXP}/{xpToNextLevel} XP</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">HP</p>
          <div className="w-24 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
            <div className={`h-full transition-all ${playerHP <= 30 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${playerHP}%` }} />
          </div>
          <p className="text-xs text-slate-400">{playerHP}/100</p>
        </div>
        <p className="text-slate-500">Score: {score}</p>
      </div>

      {/* Boss Battle */}
      <div className="relative bg-gradient-to-b from-red-900 via-orange-900 to-slate-900 rounded-2xl h-48 overflow-hidden border-4 border-orange-400">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-2 animate-pulse">{level.boss}</div>
            <p className="text-white font-bold text-xl">{level.bossName}</p>
            <p className="text-amber-300 text-sm">Level {currentLevel + 1}</p>
            {/* Boss HP Bar */}
            <div className="w-48 h-4 bg-slate-700 rounded-full mt-2 mx-auto overflow-hidden">
              <div
                className={`h-full transition-all ${bossHP <= 30 ? "bg-rose-500" : "bg-amber-500"}`}
                style={{ width: `${(bossHP / (level.word.length * 10)) * 100}%` }}
              />
            </div>
            <p className="text-white text-sm mt-1">{bossHP}/{level.word.length * 10} HP</p>
          </div>
        </div>
      </div>

      {/* Word Puzzle */}
      <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
        <p className="text-sm font-semibold text-slate-500 mb-2">Hint: {level.hint}</p>
        <p className="text-3xl font-bold text-slate-800 text-center tracking-widest mb-4">
          {currentWord || "_".repeat(level.word.length)}
        </p>
        
        {/* Scrambled Letters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {scrambledLetters.map((letter, index) => (
            <button
              key={index}
              onClick={() => addLetter(letter)}
              className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xl hover:bg-indigo-200 transition"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Current Word Display */}
        {currentWord && (
          <div className="text-center">
            <button onClick={removeLetter} className="btn-ghost text-rose-500">
              ⌫ Remove Letter
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={startGame} className="btn-ghost flex-1">
          Reset
        </button>
        <button onClick={submitWord} disabled={!currentWord} className="btn-primary flex-1">
          Submit Word
        </button>
      </div>
    </div>
  );
}
