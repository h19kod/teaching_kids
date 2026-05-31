import { Component, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./i18n.jsx";
import Navbar from "./components/Navbar.jsx";

const Login        = lazy(() => import("./pages/Login.jsx"));
const Dashboard    = lazy(() => import("./pages/Dashboard.jsx"));
const Subjects     = lazy(() => import("./pages/Subjects.jsx"));
const SubjectGames = lazy(() => import("./pages/SubjectGames.jsx"));
const GamePlay     = lazy(() => import("./pages/GamePlay.jsx"));
const Admin        = lazy(() => import("./pages/Admin.jsx"));
const Family       = lazy(() => import("./pages/Family.jsx"));
const Leaderboard  = lazy(() => import("./pages/Leaderboard.jsx"));
const Worlds       = lazy(() => import("./pages/Worlds.jsx"));
const WorldDetail  = lazy(() => import("./pages/WorldDetail.jsx"));
const Profile      = lazy(() => import("./pages/Profile.jsx"));
const Settings     = lazy(() => import("./pages/Settings.jsx"));
const Certificates = lazy(() => import("./pages/Certificates.jsx"));

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", background: "#fee2e2", minHeight: "100vh" }}>
          <h2 style={{ color: "#dc2626" }}>⚠️ Render Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#7f1d1d", fontSize: 13 }}>
            {this.state.error.message}{"\n"}{this.state.error.stack}
          </pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: "8px 16px" }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-indigo-500 dark:bg-slate-950">
      Loading… 🎈
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <LanguageProvider>
      <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        {user && <Navbar />}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route
                path="/login"
                element={loading ? <FullScreenLoader /> : user ? <Navigate to="/" replace /> : <Login />}
              />
              <Route path="/" element={<Protected><Dashboard /></Protected>} />
              <Route path="/worlds" element={<Protected><Worlds /></Protected>} />
              <Route path="/world/:worldId" element={<Protected><WorldDetail /></Protected>} />
              <Route path="/subjects" element={<Protected><Subjects /></Protected>} />
              <Route path="/subjects/:id" element={<Protected><SubjectGames /></Protected>} />
              <Route path="/play/:id" element={<Protected><GamePlay /></Protected>} />
              <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
              <Route path="/family" element={<Protected roles={["parent", "admin"]}><Family /></Protected>} />
              <Route path="/admin" element={<Protected roles={["admin"]}><Admin /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/certificates" element={<Protected><Certificates /></Protected>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
