import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useCache } from "../context/CacheContext.jsx";
import { usePWA } from "../hooks/usePWA.js";
import {
  LayoutDashboard, BookOpen, Users, Shield, LogOut, GraduationCap,
  Trophy, Moon, Sun, Globe, Search, X, Settings, User, Award, WifiOff,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { subjects, games, fetchSubjects, fetchGames } = useCache();
  const { isOnline } = usePWA();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
    fetchGames();
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || !games?.length) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const subjectMap = {};
    (subjects || []).forEach((s) => { subjectMap[s.id] = s.name; });
    const results = games
      .filter((g) => g.title?.toLowerCase().includes(q) || subjectMap[g.subjectId]?.toLowerCase().includes(q))
      .slice(0, 6)
      .map((g) => ({ gameId: g.id, gameTitle: g.title, subjectName: subjectMap[g.subjectId] || "" }));
    setSearchResults(results);
  }, [searchQuery, games, subjects]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["child", "parent", "admin"] },
    { to: "/worlds", label: "Worlds", icon: Globe, roles: ["child", "parent", "admin"] },
    { to: "/subjects", label: "Games", icon: BookOpen, roles: ["child", "parent", "admin"] },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy, roles: ["child", "parent", "admin"] },
    { to: "/family", label: "Family", icon: Users, roles: ["parent", "admin"] },
    { to: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  ];

  const navCls = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
      isActive
        ? dark ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-700"
        : dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
    }`;

  return (
    <header className={`sticky top-0 z-20 backdrop-blur border-b ${dark ? "bg-slate-900/90 border-slate-700" : "bg-white/80 border-slate-100"}`}>
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center text-xs font-semibold py-1.5 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          You are offline — progress may not be saved until you reconnect.
        </div>
      )}
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className={`flex items-center gap-2 font-extrabold text-xl shrink-0 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
          <GraduationCap className="w-7 h-7" />
          <span className="hidden sm:inline">Kids Learning</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.filter((l) => l.roles.includes(user.role)).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={navCls}>
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Search */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={`p-2 rounded-xl transition ${dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
              title="Search games"
            >
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && (
              <div className={`absolute right-0 top-12 w-72 rounded-2xl shadow-xl border overflow-hidden ${dark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    className={`flex-1 text-sm outline-none bg-transparent ${dark ? "text-slate-200 placeholder:text-slate-500" : "text-slate-700"}`}
                    placeholder="Search games…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery("")}><X className="w-4 h-4 text-slate-400" /></button>}
                </div>
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((r) => (
                      <li key={r.gameId}>
                        <button
                          onClick={() => { navigate(`/play/${r.gameId}`); setSearchOpen(false); setSearchQuery(""); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 transition`}
                        >
                          <div className={`font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}>🎮 {r.gameTitle}</div>
                          <div className="text-xs text-slate-400">{r.subjectName}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery ? (
                  <p className="px-4 py-3 text-sm text-slate-400">No games found for "{searchQuery}"</p>
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400">Type to search games…</p>
                )}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            className={`p-2 rounded-xl transition ${dark ? "text-yellow-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
            title="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-lg hover:bg-indigo-600 transition"
              title="Profile"
            >
              {user.avatar || user.name?.[0]?.toUpperCase()}
            </button>
            {profileOpen && (
              <div className={`absolute right-0 top-12 w-52 rounded-2xl shadow-xl border overflow-hidden ${dark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"}`}>
                <div className={`px-4 py-3 border-b ${dark ? "border-slate-700" : "border-slate-100"}`}>
                  <div className={`font-bold text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}>{user.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{user.role} • Lv.{user.level ?? 1}</div>
                </div>
                {[
                  { to: "/profile", icon: User, label: "My Profile" },
                  { to: "/certificates", icon: Award, label: "Certificates" },
                  { to: "/settings", icon: Settings, label: "Settings" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition ${dark ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
                <div className={`border-t ${dark ? "border-slate-700" : "border-slate-100"}`}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
