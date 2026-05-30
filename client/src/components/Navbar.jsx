import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { LayoutDashboard, BookOpen, Users, Shield, LogOut, GraduationCap, Trophy, Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["child", "parent", "admin"] },
    { to: "/subjects", label: "Games", icon: BookOpen, roles: ["child", "parent", "admin"] },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy, roles: ["child", "parent", "admin"] },
    { to: "/family", label: "Family", icon: Users, roles: ["parent", "admin"] },
    { to: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  ];

  return (
    <header className={`sticky top-0 z-20 backdrop-blur border-b ${dark ? "bg-slate-900/90 border-slate-700" : "bg-white/80 border-slate-100"}`}>
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className={`flex items-center gap-2 font-extrabold text-xl ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
          <GraduationCap className="w-7 h-7" />
          <span className="hidden sm:inline">Kids Learning</span>
        </Link>

        <div className="flex items-center gap-1">
          {links
            .filter((l) => l.roles.includes(user.role))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? dark
                        ? "bg-indigo-900 text-indigo-300"
                        : "bg-indigo-100 text-indigo-700"
                      : dark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-500 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className={`p-2 rounded-xl transition ${dark ? "text-yellow-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
            title="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="text-right hidden sm:block">
            <div className={`text-sm font-bold leading-tight ${dark ? "text-slate-200" : "text-slate-700"}`}>{user.name}</div>
            <div className="text-xs text-slate-400 capitalize">{user.role}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white grid place-items-center font-bold">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <button onClick={handleLogout} className={`transition ${dark ? "text-slate-400 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`} title="Log out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
