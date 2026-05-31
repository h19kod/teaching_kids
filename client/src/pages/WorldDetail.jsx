import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { ArrowLeft, Star, Trophy, Lock, Play, Sparkles } from "lucide-react";

export default function WorldDetail() {
  const { worldId } = useParams();
  const [games, setGames] = useState([]);
  const [worldInfo, setWorldInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const worldConfig = {
    english: {
      name: "English Kingdom",
      icon: "📚",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Master vocabulary, spelling, grammar, and reading!",
    },
    math: {
      name: "Math Kingdom",
      icon: "🔢",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Conquer numbers, arithmetic, logic, and puzzles!",
    },
    science: {
      name: "Science Lab",
      icon: "🔬",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Explore animals, plants, the human body, and experiments!",
    },
    space: {
      name: "Space Galaxy",
      icon: "🚀",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      description: "Journey through planets, stars, and the universe!",
    },
  };

  const currentWorld = worldConfig[worldId];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const subjects = await api.get("/subjects");
        const worldSubject = subjects.find((s) => s.name.toLowerCase() === worldId);
        
        if (worldSubject) {
          const allGames = await api.get("/games");
          const worldGames = allGames.filter((g) => g.subjectId === worldSubject.id);
          setGames(worldGames);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [worldId]);

  if (loading) {
    return <p className="text-slate-400">Loading world...</p>;
  }

  if (!currentWorld) {
    return <p className="text-red-500">World not found</p>;
  }

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/worlds" className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Worlds
        </Link>
      </section>

      <section className={`${currentWorld.bgColor} ${currentWorld.borderColor} border-2 rounded-3xl p-8`}>
        <div className="flex items-center gap-6 mb-4">
          <div className="text-8xl">{currentWorld.icon}</div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800">{currentWorld.name}</h1>
            <p className="text-lg text-slate-600 mt-2">{currentWorld.description}</p>
          </div>
        </div>
        <div className={`h-1 bg-gradient-to-r ${currentWorld.color} rounded-full mt-4`} />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" /> Available Games
        </h2>
        {games.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-400">No games available in this world yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} worldColor={currentWorld.color} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GameCard({ game, worldColor }) {
  const difficultyColors = {
    1: "bg-green-100 text-green-700",
    2: "bg-yellow-100 text-yellow-700",
    3: "bg-orange-100 text-orange-700",
    4: "bg-red-100 text-red-700",
    5: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className={`h-2 bg-gradient-to-r ${worldColor}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-800">{game.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[game.difficultyLevel]}`}>
            Level {game.difficultyLevel}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-4">{game.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {game.points} pts
          </div>
          <Link
            to={`/play/${game.id}`}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r ${worldColor} hover:shadow-lg transition-all`}
          >
            <Play className="w-4 h-4" /> Play
          </Link>
        </div>
      </div>
    </div>
  );
}
