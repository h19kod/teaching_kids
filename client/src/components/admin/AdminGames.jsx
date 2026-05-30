import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useCache } from "../../context/CacheContext.jsx";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const EMPTY = {
  title: "",
  description: "",
  subjectId: "",
  difficultyLevel: 1,
  points: 100,
  type: "quiz",
  active: true,
  content: `{
  "instructions": "Answer the questions.",
  "questions": [
    { "prompt": "2 + 2", "answer": "4", "options": ["3", "4", "5", "6"] }
  ]
}`,
};

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null); // game object or null
  const [error, setError] = useState("");
  const { fetchSubjects, fetchGames, invalidateAll } = useCache();

  async function load() {
    try {
      const [g, s] = await Promise.all([
        api.get("/games?includeInactive=1"), // Admin needs inactive games too
        fetchSubjects(true),
      ]);
      setGames(g);
      setSubjects(s);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [fetchSubjects]);

  function openNew() {
    const subjectId = subjects[0]?.id || "";
    setEditing({ ...EMPTY, subjectId });
  }

  function openEdit(game) {
    setEditing({
      ...game,
      content: JSON.stringify(game.content, null, 2),
    });
  }

  async function remove(id) {
    if (!confirm("Delete this game?")) return;
    try {
      await api.del(`/games/${id}`);
      invalidateAll();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary" disabled={subjects.length === 0}>
          <Plus className="w-5 h-5" /> New game
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="pb-2">Title</th>
              <th className="pb-2">Subject</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Level</th>
              <th className="pb-2">Points</th>
              <th className="pb-2">Active</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="py-2 font-semibold text-slate-700">{g.title}</td>
                <td className="py-2 text-slate-500">{g.subject?.name}</td>
                <td className="py-2 text-slate-500 capitalize">{g.type}</td>
                <td className="py-2">{g.difficultyLevel}</td>
                <td className="py-2">{g.points}</td>
                <td className="py-2">{g.active ? "✅" : "—"}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(g)} className="text-slate-400 hover:text-indigo-600 mr-3">
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => remove(g.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <GameModal
          game={editing}
          subjects={subjects}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            invalidateAll();
            await load();
          }}
        />
      )}
    </div>
  );
}

function GameModal({ game, subjects, onClose, onSaved }) {
  const [form, setForm] = useState(game);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = !!game.id;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setError("");
    let content;
    try {
      content = JSON.parse(form.content);
    } catch {
      setError("Content must be valid JSON.");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      subjectId: Number(form.subjectId),
      difficultyLevel: Number(form.difficultyLevel),
      points: Number(form.points),
      type: form.type,
      active: !!form.active,
      content,
    };
    setBusy(true);
    try {
      if (isEdit) await api.put(`/games/${game.id}`, payload);
      else await api.post("/games", payload);
      await onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-30" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit game" : "New game"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={set("title")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <input className="input" value={form.description || ""} onChange={set("description")} />
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subjectId} onChange={set("subjectId")}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={set("type")}>
              <option value="quiz">Quiz (multiple choice)</option>
              <option value="math">Math (multiple choice)</option>
              <option value="spelling">Spelling (typed answer)</option>
              <option value="matching">Matching (pairs)</option>
            </select>
          </div>
          <div>
            <label className="label">Difficulty (1-5)</label>
            <input type="number" min="1" max="5" className="input" value={form.difficultyLevel} onChange={set("difficultyLevel")} />
          </div>
          <div>
            <label className="label">Max points</label>
            <input type="number" min="0" className="input" value={form.points} onChange={set("points")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">
              Content (JSON) — use <code>questions</code> for quiz/math/spelling, <code>pairs</code> for matching
            </label>
            <textarea
              className="input font-mono text-xs h-48"
              value={form.content}
              onChange={set("content")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active (visible to kids)
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save game"}
          </button>
        </div>
      </div>
    </div>
  );
}
