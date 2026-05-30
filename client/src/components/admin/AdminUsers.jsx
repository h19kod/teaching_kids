import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Trash2 } from "lucide-react";

const ROLES = ["child", "parent", "admin"];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setUsers(await api.get("/users"));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function changeRole(id, role) {
    try {
      await api.put(`/users/${id}`, { role });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await api.del(`/users/${id}`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2 text-right">Plays</th>
              <th className="pb-2 text-right">Kids</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="py-2 font-semibold text-slate-700">{u.name}</td>
                <td className="py-2 text-slate-500">{u.email || "—"}</td>
                <td className="py-2">
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1"
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={u.id === me.id}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 text-right">{u._count?.progress ?? 0}</td>
                <td className="py-2 text-right">{u._count?.children ?? 0}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => remove(u.id)}
                    className="text-slate-400 hover:text-red-500 disabled:opacity-30"
                    disabled={u.id === me.id}
                    title={u.id === me.id ? "You can't delete yourself" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
