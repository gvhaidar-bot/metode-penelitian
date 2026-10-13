import { useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import { keluarAkun } from "./api.js";
import {
  IkonDashboard,
  IkonKeluar,
  IkonRekomendasi,
  IkonRiwayat,
  IkonRoadmap,
  IkonSkill,
} from "./components/ikon.jsx";
import { LogoMark } from "./components/ui.jsx";
import Landing from "./pages/Landing.jsx";
import Metode from "./pages/Metode.jsx";
import DataKarier from "./pages/DataKarier.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Skill from "./pages/Skill.jsx";
import Rekomendasi from "./pages/Rekomendasi.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Riwayat from "./pages/Riwayat.jsx";

const NAV = [
  { nama: "Dashboard", path: "/dashboard", Ikon: IkonDashboard },
  { nama: "Skill Saya", path: "/skill", Ikon: IkonSkill },
  { nama: "Rekomendasi", path: "/rekomendasi", Ikon: IkonRekomendasi },
  { nama: "Roadmap", path: "/roadmap", Ikon: IkonRoadmap },
  { nama: "Riwayat", path: "/riwayat", Ikon: IkonRiwayat },
];

const JUDUL = {
  "/dashboard": "Dashboard",
  "/skill": "Skill Saya",
  "/rekomendasi": "Rekomendasi Karier",
  "/roadmap": "Roadmap Belajar",
  "/riwayat": "Riwayat Rekomendasi",
};

function ButuhLogin({ children }) {
  const { user, siap } = useAuth();
  if (!siap) return null;
  if (!user) return <Navigate to="/masuk" replace />;
  return children;
}

function TataLetak({ children }) {
  const { user, keluar } = useAuth();
  const lokasi = useLocation();
  const navigasi = useNavigate();
  const [buka, setBuka] = useState(false);

  const keluarKlik = async () => {
    await keluarAkun();
    keluar();
    navigasi("/", { replace: true });
  };

  const isiSidebar = (
    <div className="flex flex-col h-full">
      <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2" onClick={() => setBuka(false)}>
        <LogoMark />
        <span className="font-extrabold text-ink leading-tight">
          KarierKu
          <br />
          Informatika
        </span>
      </Link>
      <nav className="mt-8 space-y-1 flex-1">
        {NAV.map(({ nama, path, Ikon }) => {
          const aktif = lokasi.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setBuka(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                aktif
                  ? "bg-wash text-primary"
                  : "text-muted hover:bg-wash hover:text-ink"
              }`}
            >
              <Ikon className="w-5 h-5" />
              {nama}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 border-t border-line">
        <p className="px-4 text-sm font-bold text-ink truncate">{user?.name}</p>
        <p className="px-4 text-xs text-muted truncate">{user?.email}</p>
        <button
          onClick={keluarKlik}
          className="mt-2 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-wash hover:text-ink transition"
        >
          <IkonKeluar className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-card p-5 border-r border-line">
        {isiSidebar}
      </aside>
      {/* Sidebar mobile */}
      {buka && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setBuka(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card p-5 shadow-xl">
            {isiSidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur px-4 sm:px-8 py-4 flex items-center gap-4">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-card"
            onClick={() => setBuka(true)}
            aria-label="Buka menu"
          >
            <svg className="w-6 h-6 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-extrabold text-ink">
            {JUDUL[lokasi.pathname] || "KarierKu Informatika"}
          </h1>
        </header>
        <main className="px-4 sm:px-8 pb-12 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}

function Masuk() {
  const { user, siap } = useAuth();
  if (!siap) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/metode" element={<Metode />} />
        <Route path="/data" element={<DataKarier />} />
        <Route path="/masuk" element={<Masuk />} />
        <Route
          path="/dashboard"
          element={<ButuhLogin><TataLetak><Dashboard /></TataLetak></ButuhLogin>}
        />
        <Route
          path="/skill"
          element={<ButuhLogin><TataLetak><Skill /></TataLetak></ButuhLogin>}
        />
        <Route
          path="/rekomendasi"
          element={<ButuhLogin><TataLetak><Rekomendasi /></TataLetak></ButuhLogin>}
        />
        <Route
          path="/roadmap"
          element={<ButuhLogin><TataLetak><Roadmap /></TataLetak></ButuhLogin>}
        />
        <Route
          path="/riwayat"
          element={<ButuhLogin><TataLetak><Riwayat /></TataLetak></ButuhLogin>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
