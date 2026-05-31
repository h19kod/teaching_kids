import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotify } from "../context/NotificationContext.jsx";
import { api } from "../api.js";
import { User, Lock } from "lucide-react";

const AVATARS = [
  "🎓","🦁","🐯","🦊","🐻","🐼","🐨","🦄","🐸","🐙",
  "🦋","🐬","🦅","🦉","🐲","🚀","⭐","🌈","🎮","🏆",
  "🧙","🧚","🤖","👑","🎯","🎨","🎵","⚡","🔥","💎",
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const { notify } = useNotify();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🎓");
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await api.put("/auth/profile", { name, bio, avatar });
      setUser(updated);
      notify("Profile updated successfully! ✨", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) return notify("Passwords do not match!", "error");
    setChangingPw(true);
    try {
      await api.post("/auth/change-password", { currentPassword: currentPw, newPassword: newPw });
      notify("Password changed successfully! 🔐", "success");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setChangingPw(false);
    }
  }

  const xpToNextLevel = (user?.level || 1) * 100;
  const xpProgress = Math.min(((user?.xp || 0) % xpToNextLevel) / xpToNextLevel * 100, 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">👤 My Profile</h1>

      {/* Stats Bar */}
      <div className="card grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: "Level", value: user?.level ?? 1, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "XP", value: user?.xp ?? 0, color: "text-purple-600 dark:text-purple-400" },
          { label: "Coins", value: user?.coins ?? 0, color: "text-amber-600 dark:text-amber-400" },
          { label: "Gems", value: user?.gems ?? 0, color: "text-sky-600 dark:text-sky-400" },
        ].map((s) => (
          <div key={s.label}>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="card">
        <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
          <span>⚡ Level {user?.level ?? 1} Progress</span>
          <span>{(user?.xp || 0) % xpToNextLevel} / {xpToNextLevel} XP</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card space-y-5">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <User className="w-5 h-5" /> Edit Profile
        </h2>

        <div>
          <label className="label">Choose Avatar</label>
          <div className="grid grid-cols-10 gap-2 mt-2">
            {AVATARS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setAvatar(em)}
                className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition border-2 ${
                  avatar === em
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 scale-110"
                    : "border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={2}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
            />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      {user?.role !== "child" && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Change Password
          </h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={4} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
            </div>
            <button type="submit" className="btn-ghost" disabled={changingPw}>
              {changingPw ? "Changing…" : "Change Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
