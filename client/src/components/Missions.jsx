import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Target, Clock, CheckCircle, Star, Flame, Calendar } from "lucide-react";

export default function Missions() {
  const [missions, setMissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const data = await api.get("/missions");
        setMissions(data);
      } catch (error) {
        console.error("Error fetching missions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Target className="w-5 h-5 animate-pulse" />
          <span>Loading missions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 grid place-items-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daily & Weekly Missions</h2>
          <p className="text-sm text-slate-500">Complete missions to earn rewards!</p>
        </div>
      </div>

      {missions && (
        <div className="space-y-6">
          <MissionSection
            title="Daily Missions"
            icon={Clock}
            color="from-blue-500 to-cyan-500"
            missions={missions.daily}
            type="daily"
          />
          <MissionSection
            title="Weekly Challenges"
            icon={Calendar}
            color="from-purple-500 to-pink-500"
            missions={missions.weekly}
            type="weekly"
          />
        </div>
      )}
    </div>
  );
}

function MissionSection({ title, icon: Icon, color, missions, type }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <div className="space-y-3">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} color={color} type={type} />
        ))}
      </div>
    </div>
  );
}

function MissionCard({ mission, color, type }) {
  const progress = (mission.progress / mission.target) * 100;
  const isCompleted = mission.progress >= mission.target;

  return (
    <div className={`bg-slate-50 rounded-xl p-4 border-2 ${isCompleted ? "border-green-400 bg-green-50" : "border-slate-200"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-green-500 grid place-items-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} grid place-items-center`}>
              {type === "daily" ? <Flame className="w-5 h-5 text-white" /> : <Star className="w-5 h-5 text-white" />}
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-800">{mission.title}</h4>
            <p className="text-sm text-slate-500">{mission.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 font-bold text-amber-500 text-sm">
            <Star className="w-4 h-4 fill-amber-400" /> {mission.xpReward} XP
          </div>
          {mission.coinReward > 0 && (
            <div className="text-xs text-slate-600 font-semibold">{mission.coinReward} coins</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
          <span>Progress</span>
          <span>{mission.progress} / {mission.target}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {isCompleted && !mission.claimed && (
        <button className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg transition">
          Claim Rewards!
        </button>
      )}
      {mission.claimed && (
        <div className="w-full py-2 px-4 rounded-lg font-bold text-slate-400 bg-slate-200 text-center">
          ✓ Rewards Claimed
        </div>
      )}
    </div>
  );
}
