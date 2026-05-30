import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useCache } from "../../context/CacheContext.jsx";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const EMPTY = {
  name: "",
  description: "",
};

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const { fetchSubjects, invalidateSubjects, invalidateAll } = useCache();

  async function load() {
    try {
      const data = await fetchSubjects(true); // force refresh
      setSubjects(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [fetchSubjects]);

  function openNew() {
    setEditing({ ...EMPTY });
  }

  function openEdit(subject) {
    setEditing({ ...subject });
  }

  async function remove(id) {
    if (!confirm("Delete this subject? This will also hide associated games.")) return;
    try {
      await api.del(`/subjects/${id}`);
      invalidateAll(); // invalidate all cache
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-5 h-5" /> New subject
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Description</th>
              <th className="pb-2">Games</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="py-2 font-semibold text-slate-700">{s.name}</td>
                <td className="py-2 text-slate-500">{s.description || "—"}</td>
                <td className="py-2 text-slate-500">{s._count?.games || 0}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(s)} className="text-slate-400 hover:text-indigo-600 mr-3">
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => remove(s.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <SubjectModal
          subject={editing}
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

function SubjectModal({ subject, onClose, onSaved }) {
  const [form, setForm] = useState(subject);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = !!subject.id;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
    };
    setBusy(true);
    try {
      if (isEdit) await api.put(`/subjects/${subject.id}`, payload);
      else await api.post("/subjects", payload);
      await onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-30" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit subject" : "New subject"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={set("name")} placeholder="e.g., Math" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description || ""} onChange={set("description")} placeholder="Optional" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save subject"}
          </button>
        </div>
      </div>
    </div>
  );
}
