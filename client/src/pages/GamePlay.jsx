import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { ArrowLeft } from "lucide-react";
import { useNotify } from "../context/NotificationContext.jsx";

const ChoiceGame               = lazy(() => import("../components/games/ChoiceGame.jsx"));
const SpellingGame             = lazy(() => import("../components/games/SpellingGame.jsx"));
const MatchingGame             = lazy(() => import("../components/games/MatchingGame.jsx"));
const DragDropGame             = lazy(() => import("../components/games/DragDropGame.jsx"));
const MemoryGame               = lazy(() => import("../components/games/MemoryGame.jsx"));
const WordBuilderGame          = lazy(() => import("../components/games/WordBuilderGame.jsx"));
const SortingGame              = lazy(() => import("../components/games/SortingGame.jsx"));
const PuzzleGame               = lazy(() => import("../components/games/PuzzleGame.jsx"));
const AlphabetAdventure        = lazy(() => import("../components/games/AlphabetAdventure.jsx"));
const MissingLetter            = lazy(() => import("../components/games/MissingLetter.jsx"));
const CountObjects             = lazy(() => import("../components/games/CountObjects.jsx"));
const MathRace                 = lazy(() => import("../components/games/MathRace.jsx"));
const ShapeMatch               = lazy(() => import("../components/games/ShapeMatch.jsx"));
const WordRunner                = lazy(() => import("../components/games/WordRunner.jsx"));
const MathRunner               = lazy(() => import("../components/games/MathRunner.jsx"));
const RocketMission            = lazy(() => import("../components/games/RocketMission.jsx"));
const PlanetHopper             = lazy(() => import("../components/games/PlanetHopper.jsx"));
const AnimalRescue             = lazy(() => import("../components/games/AnimalRescue.jsx"));
const GrammarGuardian          = lazy(() => import("../components/games/GrammarGuardian.jsx"));
const SpellingQuestRPG         = lazy(() => import("../components/games/SpellingQuestRPG.jsx"));
const WordWorldOdyssey         = lazy(() => import("../components/games/WordWorldOdyssey.jsx"));
const SentenceBuilderAdventure = lazy(() => import("../components/games/SentenceBuilderAdventure.jsx"));
const LanguageMysteryIsland    = lazy(() => import("../components/games/LanguageMysteryIsland.jsx"));
const ResultScreen             = lazy(() => import("../components/games/ResultScreen.jsx"));

function GameLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-indigo-500">
      <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-sm font-semibold text-slate-500">Loading game…</span>
    </div>
  );
}

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotify();
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
      if (fractionCorrect >= 0.8) {
        notify(`🎉 Amazing! You scored ${score} points!`, "success");
      } else if (fractionCorrect >= 0.5) {
        notify(`⭐ Good job! You scored ${score} points!`, "info");
      } else {
        notify(`Keep practising! You scored ${score} points.`, "warning");
      }
    } catch (e) {
      notify("Could not save your score. Check your connection.", "error");
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
        className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{game.title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{game.content?.instructions || game.description}</p>
      </div>

      <Suspense fallback={<GameLoader />}>
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
      </Suspense>
    </div>
  );
}

function GameByType({ game, onFinish }) {
  switch (game.type) {
    case "spelling":
      return <SpellingGame content={game.content} onFinish={onFinish} />;
    case "matching":
      return <MatchingGame content={game.content} onFinish={onFinish} />;
    case "dragdrop":
      return <DragDropGame content={game.content} onFinish={onFinish} />;
    case "memory":
      return <MemoryGame content={game.content} onFinish={onFinish} />;
    case "wordbuilder":
      return <WordBuilderGame content={game.content} onFinish={onFinish} />;
    case "sorting":
      return <SortingGame content={game.content} onFinish={onFinish} />;
    case "puzzle":
      return <PuzzleGame content={game.content} onFinish={onFinish} />;
    case "alphabet":
      return <AlphabetAdventure content={game.content} onFinish={onFinish} />;
    case "missingletter":
      return <MissingLetter content={game.content} onFinish={onFinish} />;
    case "countobjects":
      return <CountObjects content={game.content} onFinish={onFinish} />;
    case "mathrace":
      return <MathRace content={game.content} onFinish={onFinish} />;
    case "shapematch":
      return <ShapeMatch content={game.content} onFinish={onFinish} />;
    case "wordrunner":
      return <WordRunner content={game.content} onFinish={onFinish} />;
    case "mathrunner":
      return <MathRunner content={game.content} onFinish={onFinish} />;
    case "rocketmission":
      return <RocketMission content={game.content} onFinish={onFinish} />;
    case "planethopper":
      return <PlanetHopper content={game.content} onFinish={onFinish} />;
    case "animalrescue":
      return <AnimalRescue content={game.content} onFinish={onFinish} />;
    case "grammarguardian":
      return <GrammarGuardian content={game.content} onFinish={onFinish} />;
    case "spellingquestrpg":
      return <SpellingQuestRPG content={game.content} onFinish={onFinish} />;
    case "wordworldodyssey":
      return <WordWorldOdyssey content={game.content} onFinish={onFinish} />;
    case "sentencebuilder":
      return <SentenceBuilderAdventure content={game.content} onFinish={onFinish} />;
    case "languagemysteryisland":
      return <LanguageMysteryIsland content={game.content} onFinish={onFinish} />;
    case "math":
    case "quiz":
    default:
      return <ChoiceGame content={game.content} onFinish={onFinish} />;
  }
}
