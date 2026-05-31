import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useCache } from "../context/CacheContext.jsx";
import { Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const [games, setGames] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { subjects, fetchSubjects, fetchGames } = useCache();

  async function loadGames(subjectId) {
    try {
      const data = await fetchGames(subjectId);
      setGames(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadLeaderboard(type, id) {
    setLoading(true);
    try {
      const data = await api.get(`/leaderboard/${type}/${id}`);
      setLeaderboard(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects().catch((e) => setError(e.message));
  }, [fetchSubjects]);

  useEffect(() => {
    if (selectedSubject) {
      loadGames(selectedSubject);
      loadLeaderboard("subject", selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedGame) {
      loadLeaderboard("game", selectedGame);
    }
  }, [selectedGame]);

  function handleSubjectChange(e) {
    const id = e.target.value;
    setSelectedSubject(id || null);
    setSelectedGame(null);
    if (!id) {
      setLeaderboard([]);
      setGames([]);
    }
  }

  function handleGameChange(e) {
    const id = e.target.value;
    setSelectedGame(id || null);
  }

  function getRankIcon(rank) {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-semibold">{rank}</span>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">🏆 Leaderboard</h1>

      {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Select Subject</label>
            <select className="input" value={selectedSubject || ""} onChange={handleSubjectChange}>
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {selectedSubject && (
            <div>
              <label className="label">Select Game (optional)</label>
              <select className="input" value={selectedGame || ""} onChange={handleGameChange}>
                <option value="">All games in this subject</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading leaderboard...</p>
      ) : leaderboard.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="text-slate-400 dark:text-slate-500 text-left">
              <tr>
                <th className="pb-2">Rank</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Subject</th>
                <th className="pb-2">Game</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Played</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={`${entry.userId}-${entry.subjectId}-${entry.gameId}`} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-3">{getRankIcon(index + 1)}</td>
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-200">{entry.userName}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{entry.subjectName}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{entry.gameTitle}</td>
                  <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{entry.totalScore}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{entry.playCount}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-500 text-center py-8">
          {selectedSubject ? "No leaderboard data yet. Play some games to appear here!" : "Select a subject to view the leaderboard."}
        </p>
      )}
    </div>
  );
}
