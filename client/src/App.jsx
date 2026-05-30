import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectGames from "./pages/SubjectGames.jsx";
import GamePlay from "./pages/GamePlay.jsx";
import Admin from "./pages/Admin.jsx";
import Family from "./pages/Family.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-indigo-500">
      Loading… 🎈
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white">
      {user && <Navbar />}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route
            path="/login"
            element={loading ? <FullScreenLoader /> : user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/subjects" element={<Protected><Subjects /></Protected>} />
          <Route path="/subjects/:id" element={<Protected><SubjectGames /></Protected>} />
          <Route path="/play/:id" element={<Protected><GamePlay /></Protected>} />
          <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
          <Route path="/family" element={<Protected roles={["parent", "admin"]}><Family /></Protected>} />
          <Route path="/admin" element={<Protected roles={["admin"]}><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
