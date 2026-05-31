import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Plus, Trash2, Play, TrendingUp, Clock, Star, BookOpen, Award, BarChart3 } from "lucide-react";

export default function Family() {
  const { childLogin } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childStats, setChildStats] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setChildren(await api.get("/users/children"));
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadChildStats(childId) {
    try {
      const stats = await api.get(`/users/${childId}/stats`);
      setChildStats(stats);
    } catch (e) {
      console.error("Error loading child stats:", e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildStats(selectedChild.id);
    }
  }, [selectedChild]);

  async function addChild(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/users/children", { name: name.trim() });
      setName("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeChild(id) {
    if (!confirm("Remove this child profile and all its progress?")) return;
    try {
      await api.del(`/users/children/${id}`);
      await load();
      if (selectedChild?.id === id) {
        setSelectedChild(null);
        setChildStats(null);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function playAs(id) {
    try {
      await childLogin(id);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">👨‍👩‍👧 Parent Dashboard</h1>
        <p className="text-slate-500">Monitor your children's learning progress and performance.</p>
      </div>

      {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Child Profiles Section */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={addChild} className="card flex flex-col gap-3">
            <label className="label">Add new child</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Child's name" />
            <button className="btn-primary" disabled={busy}>
              <Plus className="w-5 h-5" /> Add child
            </button>
          </form>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-700">Children Profiles</h2>
            {children.length === 0 && <p className="text-slate-400 text-sm">No child profiles yet.</p>}
            {children.map((c) => (
              <div
                key={c.id}
                className={`card flex items-center justify-between cursor-pointer hover:shadow-lg transition ${
                  selectedChild?.id === c.id ? "ring-2 ring-indigo-500" : ""
                }`}
                onClick={() => setSelectedChild(c)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white grid place-items-center text-lg font-bold">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-400">Level {c.level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAs(c.id);
                    }}
                    className="btn-primary px-3 py-2 text-sm"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChild(c.id);
                    }}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Child Analytics Section */}
        <div className="lg:col-span-2">
          {selectedChild ? (
            <ChildAnalytics child={selectedChild} stats={childStats} />
          ) : (
            <div className="card text-center py-12">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400">Select a child to view their learning analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChildAnalytics({ child, stats }) {
  if (!stats) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{child.name}'s Progress</h2>
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{child.name}'s Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Star} label="Total Points" value={stats.totalPoints} color="text-amber-500 bg-amber-50" />
          <StatCard icon={BookOpen} label="Games Played" value={stats.gamesPlayed} color="text-blue-500 bg-blue-50" />
          <StatCard icon={Clock} label="Learning Time" value={`${stats.learningTime}m`} color="text-green-500 bg-green-50" />
          <StatCard icon={Award} label="Achievements" value={stats.achievementsEarned} color="text-purple-500 bg-purple-50" />
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Performance by Subject</h3>
        <div className="space-y-3">
          {stats.bySubject &&
            Object.entries(stats.bySubject).map(([subject, value]) => (
              <div key={subject}>
                <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                  <span>{subject}</span>
                  <span>{value} pts</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.min((value / (stats.totalPoints || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Strong Subjects
          </h3>
          {stats.strongSubjects ? (
            <div className="flex flex-wrap gap-2">
              {JSON.parse(stats.strongSubjects).map((subject) => (
                <span key={subject} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Not enough data yet</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500 rotate-180" /> Areas for Improvement
          </h3>
          {stats.weakSubjects ? (
            <div className="flex flex-wrap gap-2">
              {JSON.parse(stats.weakSubjects).map((subject) => (
                <span key={subject} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Not enough data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
