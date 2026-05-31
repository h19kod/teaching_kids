import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, Lock, Play, Star } from "lucide-react";

export default function Worlds() {
  const { user } = useAuth();

  const worlds = [
    {
      id: "english",
      name: "English Kingdom",
      description: "Master vocabulary, spelling, grammar, and reading!",
      icon: "📚",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      games: ["Word Runner", "Spelling Quest RPG", "Grammar Guardian", "Word World Odyssey", "Sentence Builder Adventure"],
      locked: false,
    },
    {
      id: "math",
      name: "Math Kingdom",
      description: "Conquer numbers, arithmetic, logic, and puzzles!",
      icon: "🔢",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      games: ["Math Runner", "Math Battle RPG", "Number World Odyssey"],
      locked: false,
    },
    {
      id: "science",
      name: "Science Lab",
      description: "Explore animals, plants, the human body, and experiments!",
      icon: "🔬",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      games: ["Animal Rescue", "Science Battle RPG", "Nature World Odyssey"],
      locked: false,
    },
    {
      id: "space",
      name: "Space Galaxy",
      description: "Journey through planets, stars, and the universe!",
      icon: "🚀",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      games: ["Rocket Mission", "Planet Hopper", "Galaxy Battle RPG", "Galaxy World Odyssey"],
      locked: false,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Choose Your Adventure World! 🌍
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Select a world to start your learning journey.</p>
        </div>
        <Link to="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {worlds.map((world) => (
          <WorldCard key={world.id} world={world} />
        ))}
      </section>
    </div>
  );
}

function WorldCard({ world }) {
  return (
    <div className={`card ${world.bgColor} dark:bg-slate-800 ${world.borderColor} dark:border-slate-600 border-2 overflow-hidden hover:shadow-xl transition-all duration-300`}>
      <div className={`h-2 bg-gradient-to-r ${world.color}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{world.icon}</div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{world.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{world.description}</p>
            </div>
          </div>
          {world.locked && (
            <div className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Available Games:</h3>
          <div className="flex flex-wrap gap-2">
            {world.games.map((game) => (
              <span key={game} className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                {game}
              </span>
            ))}
          </div>
        </div>

        <Link
          to={`/world/${world.id}`}
          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white transition-all ${
            world.locked
              ? "bg-slate-300 cursor-not-allowed"
              : `bg-gradient-to-r ${world.color} hover:shadow-lg hover:scale-[1.02]`
          }`}
        >
          {world.locked ? (
            <>
              <Lock className="w-5 h-5" /> Locked
            </>
          ) : (
            <>
              <Play className="w-5 h-5" /> Enter World
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
