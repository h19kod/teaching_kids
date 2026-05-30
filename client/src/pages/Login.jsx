import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { GraduationCap } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "parent" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function quickFill(email, password) {
    setMode("login");
    setForm((f) => ({ ...f, email, password }));
  }

  return (
    <div className="min-h-[80vh] grid md:grid-cols-2 gap-8 items-center">
      <div className="hidden md:block">
        <div className="text-7xl mb-4">🎓🧮📚</div>
        <h1 className="text-4xl font-extrabold text-slate-800 leading-tight">
          Learning made <span className="text-indigo-600">fun!</span>
        </h1>
        <p className="mt-3 text-slate-500 text-lg">
          Play games, earn points, and collect badges across Math, English and more.
        </p>
        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p className="font-semibold">Try a demo account:</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => quickFill("admin@kids.com", "admin123")} className="btn-ghost px-3 py-1.5 text-xs">
              👑 Admin
            </button>
            <button onClick={() => quickFill("parent@kids.com", "parent123")} className="btn-ghost px-3 py-1.5 text-xs">
              👨‍👩‍👧 Parent
            </button>
          </div>
        </div>
      </div>

      <div className="card max-w-md w-full mx-auto">
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-2xl mb-1">
          <GraduationCap className="w-7 h-7" />
          Kids Learning
        </div>
        <p className="text-slate-400 mb-6">
          {mode === "login" ? "Welcome back! Please log in." : "Create your parent account."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={update("name")} required placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={update("email")}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={update("password")}
              required
              placeholder="••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            className="text-indigo-600 font-semibold"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
        <p className="text-center text-xs text-slate-400 mt-3">
          Kids sign in from the parent's <b>Family</b> page — no password needed.
        </p>
      </div>
    </div>
  );
}
