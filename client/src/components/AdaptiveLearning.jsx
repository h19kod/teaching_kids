import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Brain, TrendingUp, Target, Lightbulb, ArrowRight } from "lucide-react";

export default function AdaptiveLearning() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.get("/adaptive/recommendations");
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Brain className="w-5 h-5 animate-pulse" />
          <span>Analyzing your learning patterns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Adaptive Learning</h2>
          <p className="text-sm text-slate-500">Personalized recommendations for you</p>
        </div>
      </div>

      {recommendations && (
        <div className="space-y-4">
          <RecommendationCard
            icon={TrendingUp}
            title="Performance Insight"
            description={recommendations.insight}
            color="from-blue-500 to-cyan-500"
          />

          {recommendations.recommendedGames.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Recommended Games
              </h3>
              <div className="space-y-2">
                {recommendations.recommendedGames.map((game) => (
                  <GameRecommendation key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {recommendations.suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Learning Tips
              </h3>
              <div className="space-y-2">
                {recommendations.suggestions.map((tip, index) => (
                  <div key={index} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm text-amber-800">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ icon: Icon, title, description, color }) {
  return (
    <div className={`bg-gradient-to-r ${color} rounded-xl p-4 text-white`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5" />
        <div>
          <h3 className="font-bold mb-1">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}

function GameRecommendation({ game }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{game.icon || "🎮"}</div>
        <div>
          <div className="font-semibold text-slate-700">{game.title}</div>
          <div className="text-xs text-slate-500">{game.reason}</div>
        </div>
      </div>
      <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
        Play <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
