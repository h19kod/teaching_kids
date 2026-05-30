import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Plus, Trash2, Play } from "lucide-react";

export default function Family() {
  const { childLogin } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
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
  useEffect(() => {
    load();
  }, []);

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
    } catch (e) {
      setError(e.message);
    }
  }

  // Switch the active session to the selected child profile.
  async function playAs(id) {
    try {
      await childLogin(id);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">👨‍👩‍👧 Family</h1>
        <p className="text-slate-500">Create profiles for your kids and let them play. Their progress is tracked separately.</p>
      </div>

      {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <form onSubmit={addChild} className="card flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="label">Child's name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lily" />
        </div>
        <button className="btn-primary" disabled={busy}>
          <Plus className="w-5 h-5" /> Add child
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        {children.length === 0 && <p className="text-slate-400">No child profiles yet.</p>}
        {children.map((c) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 text-white grid place-items-center text-xl font-bold">
                {c.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-800">{c.name}</div>
                <div className="text-xs text-slate-400">Child profile</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => playAs(c.id)} className="btn-primary px-3 py-2 text-sm">
                <Play className="w-4 h-4" /> Play
              </button>
              <button onClick={() => removeChild(c.id)} className="text-slate-300 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
