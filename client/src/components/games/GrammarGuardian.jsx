import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds.js";

// Handles "grammarguardian" games: battle monsters using correct grammar.
export default function GrammarGuardian({ content, onFinish }) {
  const battles = content.battles || [
    { monster: "👾", name: "Grammar Goblin", question: "The cat ___ on the mat.", correct: "is sitting", options: ["is sitting", "are sitting", "am sitting", "be sitting"], hp: 100 },
    { monster: "🐉", name: "Syntax Dragon", question: "She ___ to school yesterday.", correct: "went", options: ["went", "go", "goes", "going"], hp: 120 },
    { monster: "👻", name: "Phantom Phrases", question: "They ___ playing football.", correct: "are", options: ["are", "is", "am", "be"], hp: 90 },
  ];
  
  const [currentBattle, setCurrentBattle] = useState(0);
  const [playerHP, setPlayerHP] = useState(100);
  const [monsterHP, setMonsterHP] = useState(battles[0]?.hp || 100);
  const [playerAttack, setPlayerAttack] = useState(0);
  const [monsterAttack, setMonsterAttack] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const battle = battles[currentBattle];
  const isLastBattle = currentBattle === battles.length - 1;

  function attackMonster(damage) {
    sounds.correct();
    setMonsterHP((prev) => Math.max(0, prev - damage));
    setPlayerAttack(damage);
    setShowResult(true);

    setTimeout(() => {
      if (monsterHP - damage <= 0) {
        sounds.success();
        setScore((prev) => prev + 100);
        
        if (isLastBattle) {
          setVictory(true);
          setGameOver(true);
        } else {
          setCurrentBattle((prev) => prev + 1);
          setMonsterHP(battles[currentBattle + 1]?.hp || 100);
          setPlayerHP((prev) => Math.min(100, prev + 30));
        }
      } else {
        // Monster counter-attack
        const monsterDmg = Math.floor(Math.random() * 20) + 10;
        sounds.wrong();
        setMonsterAttack(monsterDmg);
        setPlayerHP((prev) => {
          const newHP = Math.max(0, prev - monsterDmg);
          if (newHP <= 0) {
            setGameOver(true);
          }
          return newHP;
        });
      }
      
      setTimeout(() => {
        setPlayerAttack(0);
        setMonsterAttack(0);
        setShowResult(false);
        setSelectedAnswer(null);
      }, 1500);
    }, 1000);
  }

  function handleAnswer(answer) {
    if (showResult || gameOver) return;
    setSelectedAnswer(answer);
    
    if (answer === battle.correct) {
      attackMonster(40);
    } else {
      sounds.wrong();
      setPlayerAttack(0);
      setMonsterAttack(25);
      setShowResult(true);
      setPlayerHP((prev) => {
        const newHP = Math.max(0, prev - 25);
        if (newHP <= 0) {
          setGameOver(true);
        }
        return newHP;
      });
      
      setTimeout(() => {
        setPlayerAttack(0);
        setMonsterAttack(0);
        setShowResult(false);
        setSelectedAnswer(null);
      }, 1500);
    }
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setCurrentBattle(0);
    setPlayerHP(100);
    setMonsterHP(battles[0]?.hp || 100);
    setScore(0);
    setPlayerAttack(0);
    setMonsterAttack(0);
    setSelectedAnswer(null);
    setShowResult(false);
  }

  function endGame() {
    const fractionCorrect = currentBattle / battles.length;
    onFinish(fractionCorrect);
  }

  if (!gameStarted) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600">⚔️ Grammar Guardian</h2>
        <p className="text-slate-600">Battle monsters using correct grammar!</p>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">How to Play:</p>
          <p className="text-amber-600">✅ Correct answer = Attack monster (40 damage)</p>
          <p className="text-amber-600">❌ Wrong answer = Take damage (25 HP)</p>
          <p className="text-amber-600">🛡️ Defeat all monsters to win!</p>
        </div>
        <button onClick={startGame} className="btn-primary text-xl py-4 px-8">
          Start Battle
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="card animate-pop space-y-6 text-center">
        <h2 className={`text-3xl font-extrabold ${victory ? "text-emerald-600" : "text-rose-600"}`}>
          {victory ? "🏆 Victory!" : "💀 Defeated!"}
        </h2>
        <p className="text-slate-600">
          {victory ? "You defeated all the monsters!" : "The monsters were too strong!"}
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
      {/* Battle Header */}
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Battle {currentBattle + 1}/{battles.length}</p>
        <p className="text-slate-500">Score: {score}</p>
      </div>

      {/* Battle Arena */}
      <div className="relative bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 rounded-2xl h-64 overflow-hidden border-4 border-indigo-400">
        {/* Monster */}
        <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-6xl mb-2 animate-bounce">{battle.monster}</div>
          <p className="text-white font-bold">{battle.name}</p>
          {/* Monster HP Bar */}
          <div className="w-32 h-4 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all ${monsterHP <= 30 ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${(monsterHP / battle.hp) * 100}%` }}
            />
          </div>
          <p className="text-white text-sm mt-1">{monsterHP}/{battle.hp} HP</p>
          {monsterAttack > 0 && (
            <p className="text-rose-400 text-sm font-bold animate-pop">-{monsterAttack}</p>
          )}
        </div>

        {/* Player */}
        <div className="absolute right-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-6xl mb-2">🦸</div>
          <p className="text-white font-bold">Grammar Guardian</p>
          {/* Player HP Bar */}
          <div className="w-32 h-4 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all ${playerHP <= 30 ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${playerHP}%` }}
            />
          </div>
          <p className="text-white text-sm mt-1">{playerHP}/100 HP</p>
          {playerAttack > 0 && (
            <p className="text-emerald-400 text-sm font-bold animate-pop">+{playerAttack}</p>
          )}
        </div>

        {/* Battle Effects */}
        {showResult && selectedAnswer === battle.correct && (
          <div className="absolute inset-0 bg-emerald-500/20 animate-pulse flex items-center justify-center">
            <span className="text-4xl font-bold text-white">⚔️ CRITICAL HIT!</span>
          </div>
        )}
        {showResult && selectedAnswer !== battle.correct && (
          <div className="absolute inset-0 bg-rose-500/20 animate-pulse flex items-center justify-center">
            <span className="text-4xl font-bold text-white">💥 MISSED!</span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
        <p className="text-sm font-semibold text-slate-500 mb-2">Complete the sentence:</p>
        <p className="text-xl font-bold text-slate-800 text-center">{battle.question}</p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3">
        {battle.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === battle.correct;
          
          let style = "btn-ghost text-lg py-3";
          if (showResult) {
            if (isCorrect) style = "btn text-lg py-3 bg-emerald-500 text-white";
            else if (isSelected) style = "btn text-lg py-3 bg-rose-500 text-white";
            else style = "btn-ghost text-lg py-3 opacity-50";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={style}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && selectedAnswer === battle.correct && (
        <p className="text-center text-emerald-600 font-bold text-lg animate-pop">
          Correct! Monster takes 40 damage!
        </p>
      )}
      {showResult && selectedAnswer !== battle.correct && (
        <p className="text-center text-rose-600 font-bold text-lg">
          Wrong! You take 25 damage! The answer was: {battle.correct}
        </p>
      )}
    </div>
  );
}
