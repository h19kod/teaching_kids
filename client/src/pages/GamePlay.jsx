import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { ArrowLeft } from "lucide-react";
import ChoiceGame from "../components/games/ChoiceGame.jsx";
import SpellingGame from "../components/games/SpellingGame.jsx";
import MatchingGame from "../components/games/MatchingGame.jsx";
import ResultScreen from "../components/games/ResultScreen.jsx";

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { score, total }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/games/${id}`).then(setGame).catch((e) => setError(e.message));
  }, [id]);

  // Called by each game with a fraction correct (0..1).
  async function finish(fractionCorrect) {
    const score = Math.round(game.points * fractionCorrect);
    setResult({ score, fractionCorrect });
    setSaving(true);
    try {
      await api.post("/progress", { gameId: game.id, score, completed: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <p className="text-red-500">{error}</p>;
  if (!game) return <p className="text-slate-400">Loading game…</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link
        to={`/subjects/${game.subjectId}`}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-800">{game.title}</h1>
        <p className="text-slate-500">{game.content?.instructions || game.description}</p>
      </div>

      {result ? (
        <ResultScreen
          result={result}
          maxPoints={game.points}
          saving={saving}
          onReplay={() => setResult(null)}
          onHome={() => navigate("/subjects/" + game.subjectId)}
        />
      ) : (
        <GameByType game={game} onFinish={finish} />
      )}
    </div>
  );
}

function GameByType({ game, onFinish }) {
  switch (game.type) {
    case "spelling":
      return <SpellingGame content={game.content} onFinish={onFinish} />;
    case "matching":
      return <MatchingGame content={game.content} onFinish={onFinish} />;
    case "math":
    case "quiz":
    default:
      return <ChoiceGame content={game.content} onFinish={onFinish} />;
  }
}
