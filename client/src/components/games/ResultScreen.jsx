import { RotateCcw, Home, Star } from "lucide-react";

export default function ResultScreen({ result, maxPoints, saving, onReplay, onHome }) {
  const pct = Math.round(result.fractionCorrect * 100);
  const { emoji, message } =
    pct >= 80
      ? { emoji: "🌟", message: "Amazing job!" }
      : pct >= 50
      ? { emoji: "👍", message: "Well done!" }
      : { emoji: "💪", message: "Keep practicing!" };

  return (
    <div className="card text-center animate-pop">
      <div className="text-7xl mb-2">{emoji}</div>
      <h2 className="text-3xl font-extrabold text-slate-800">{message}</h2>
      <p className="text-slate-500 mt-1">You got {pct}% correct.</p>

      <div className="my-6 inline-flex items-center gap-2 bg-amber-50 text-amber-600 font-extrabold text-2xl px-6 py-3 rounded-2xl">
        <Star className="w-7 h-7 fill-amber-400" />
        +{result.score} / {maxPoints} points
      </div>

      <p className="text-xs text-slate-400 mb-5">
        {saving ? "Saving your progress…" : "Progress saved! ✅"}
      </p>

      <div className="flex gap-3 justify-center">
        <button onClick={onReplay} className="btn-ghost">
          <RotateCcw className="w-5 h-5" /> Play again
        </button>
        <button onClick={onHome} className="btn-primary">
          <Home className="w-5 h-5" /> More games
        </button>
      </div>
    </div>
  );
}
