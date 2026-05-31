import { useEffect, useState } from "react";
import { api } from "../api.js";
import { BookOpen, Lock, Play, CheckCircle, Star } from "lucide-react";

export default function StoryMode() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const data = await api.get("/story/chapters");
        setChapters(data);
      } catch (error) {
        console.error("Error fetching story chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <BookOpen className="w-5 h-5 animate-pulse" />
          <span>Loading story chapters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 grid place-items-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Story Mode</h2>
          <p className="text-sm text-slate-500">Embark on an epic learning adventure!</p>
        </div>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <ChapterCard key={chapter.id} chapter={chapter} index={index} />
        ))}
      </div>
    </div>
  );
}

function ChapterCard({ chapter, index }) {
  const isLocked = !chapter.completed && index > 0;
  const isCompleted = chapter.completed;

  const getWorldColor = (world) => {
    const colors = {
      english: "from-purple-500 to-indigo-600",
      math: "from-blue-500 to-cyan-600",
      science: "from-green-500 to-emerald-600",
      space: "from-amber-500 to-orange-600",
    };
    return colors[world] || "from-gray-500 to-slate-600";
  };

  return (
    <div className={`bg-slate-50 rounded-xl p-6 border-2 ${isLocked ? "border-slate-200 opacity-60" : isCompleted ? "border-green-400 bg-green-50" : "border-slate-200"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${getWorldColor(chapter.world)}`}>
            {isLocked ? (
              <Lock className="w-6 h-6" />
            ) : isCompleted ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              index + 1
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Chapter {chapter.chapter}: {chapter.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{chapter.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getWorldColor(chapter.world)} text-white`}>
                {chapter.world}
              </span>
              <span className="text-xs text-slate-400">Level {chapter.requiredLevel}+</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {chapter.xpReward} XP
          </div>
          {chapter.coinReward > 0 && (
            <div className="text-xs text-slate-600 font-semibold">{chapter.coinReward} coins</div>
          )}
        </div>
      </div>

      {isLocked ? (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <span className="text-sm text-slate-500">Complete previous chapter to unlock</span>
          <button className="px-4 py-2 rounded-lg font-bold text-slate-400 bg-slate-200 cursor-not-allowed flex items-center gap-2">
            <Lock className="w-4 h-4" /> Locked
          </button>
        </div>
      ) : isCompleted ? (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <span className="text-sm text-green-600 font-semibold">✓ Completed!</span>
          <button className="px-4 py-2 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition flex items-center gap-2">
            <Play className="w-4 h-4" /> Replay
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <span className="text-sm text-slate-500">Ready to play</span>
          <button className={`px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r ${getWorldColor(chapter.world)} hover:shadow-lg transition flex items-center gap-2`}>
            <Play className="w-4 h-4" /> Start Chapter
          </button>
        </div>
      )}
    </div>
  );
}
