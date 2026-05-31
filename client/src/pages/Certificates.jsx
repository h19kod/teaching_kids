import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { Download, Award } from "lucide-react";

export default function Certificates() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/progress/me").then(setData).catch(() => {});
  }, []);

  const earned = data?.achievements?.filter((a) => a.earned) || [];

  function printCert(badge) {
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <meta charset="UTF-8" />
        <title>Certificate – ${badge.label}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Baloo 2', sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .cert { background: white; width: 800px; padding: 60px; border: 8px solid #6366f1; border-radius: 24px; text-align: center; position: relative; }
          .cert::before { content: ''; position: absolute; inset: 12px; border: 2px dashed #c7d2fe; border-radius: 16px; pointer-events: none; }
          .icon { font-size: 80px; margin-bottom: 16px; }
          .title { font-size: 14px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: #6366f1; margin-bottom: 8px; }
          .cert-of { font-size: 40px; font-weight: 800; color: #1e293b; margin-bottom: 24px; }
          .name { font-size: 32px; font-weight: 800; color: #4f46e5; margin-bottom: 16px; }
          .desc { font-size: 18px; color: #475569; margin-bottom: 8px; }
          .badge { display: inline-block; background: #eef2ff; color: #4f46e5; font-weight: 700; font-size: 20px; padding: 10px 28px; border-radius: 50px; margin-bottom: 32px; }
          .date { font-size: 14px; color: #94a3b8; }
          .footer { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          .sig { text-align: center; }
          .sig-line { width: 160px; border-bottom: 2px solid #94a3b8; margin-bottom: 6px; }
          .sig-label { font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="icon">${badge.icon}</div>
          <div class="title">Kids Learning Adventure</div>
          <div class="cert-of">Certificate of Achievement</div>
          <div class="desc">This certifies that</div>
          <div class="name">${user.name}</div>
          <div class="desc">has successfully earned the badge</div>
          <div class="badge">${badge.label}</div>
          <div class="date">Awarded on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div class="footer">
            <div class="sig"><div class="sig-line"></div><div class="sig-label">Kids Learning Platform</div></div>
            <div class="sig"><div class="sig-line"></div><div class="sig-label">Student Signature</div></div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">🏅 My Certificates</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Print or download certificates for your achievements.</p>
      </div>

      {!data ? (
        <p className="text-slate-400">Loading…</p>
      ) : earned.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">No certificates yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Play games and earn badges to unlock certificates!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {earned.map((badge) => (
            <div key={badge.key} className="card text-center hover:shadow-lg transition group">
              <div className="text-5xl mb-3">{badge.icon}</div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{badge.label}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Achievement Unlocked ✓</p>
              <button
                onClick={() => printCert(badge)}
                className="btn-primary w-full gap-2 text-sm py-2"
              >
                <Download className="w-4 h-4" /> Print Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
