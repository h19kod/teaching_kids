import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Trophy, Medal, Crown, TrendingUp, Target } from "lucide-react";

export default function CategoryLeaderboards() {
  const [leaderboards, setLeaderboards] = useState([]);
  const [activeCategory, setActiveCategory] = useState("weekly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const data = await api.get("/leaderboard");
        setLeaderboards(data);
      } catch (error) {
        console.error("Error fetching leaderboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const categories = [
    { id: "weekly", label: "Weekly", icon: Trophy },
    { id: "monthly", label: "Monthly", icon: TrendingUp },
    { id: "all_time", label: "All Time", icon: Crown },
    { id: "math", label: "Math", icon: Target },
    { id: "english", label: "English", icon: Trophy },
    { id: "science", label: "Science", icon: Trophy },
    { id: "space", label: "Space", icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Trophy className="w-5 h-5 animate-pulse" />
          <span>Loading leaderboards...</span>
        </div>
      </div>
    );
  }

  const activeLeaderboard = leaderboards.find((l) => l.category === activeCategory) || leaderboards[0];

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Leaderboards</h2>
          <p className="text-sm text-slate-500">Compete with learners worldwide!</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {activeLeaderboard ? (
        <LeaderboardTable leaderboard={activeLeaderboard} />
      ) : (
        <div className="text-center py-8 text-slate-400">No leaderboard data available</div>
      )}
    </div>
  );
}

function LeaderboardTable({ leaderboard }) {
  return (
    <div className="space-y-2">
      {leaderboard.entries &&
        leaderboard.entries.slice(0, 10).map((entry, index) => (
          <LeaderboardEntry key={entry.id} entry={entry} rank={index + 1} />
        ))}
    </div>
  );
}

function LeaderboardEntry({ entry, rank }) {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-slate-500">#{rank}</span>;
  };

  const getRankColor = () => {
    if (rank === 1) return "bg-amber-50 border-amber-200";
    if (rank === 2) return "bg-slate-50 border-slate-200";
    if (rank === 3) return "bg-orange-50 border-orange-200";
    return "bg-white border-slate-100";
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${getRankColor()} hover:shadow-lg transition`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10">{getRankIcon()}</div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center font-bold">
          {entry.user.name[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-slate-800">{entry.user.name}</div>
          <div className="text-xs text-slate-500">Level {entry.user.level}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-500">{entry.score}</div>
          <div className="text-xs text-slate-500">points</div>
        </div>
      </div>
    </div>
  );
}
