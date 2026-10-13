import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { keluarAkun } from "../api.js";

const ikon = (path) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const MENU = [
  { name: "Dashboard", path: "/dashboard", icon: ikon(<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>) },
  { name: "Rekomendasi", path: "/rekomendasi", icon: ikon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>) },
  { name: "Roadmap", path: "/roadmap", icon: ikon(<><path d="M9 20l-5.4-2.7A1 1 0 013 16.4V5.6a1 1 0 011.6-.8L9 7m0 13l6-3m-6 3V7m6 10l4.6 2.3A1 1 0 0021 18.4V7.6a1 1 0 00-.6-.9L15 4m0 13V4m0 0L9 7" /></>) },
  { name: "Riwayat", path: "/riwayat", icon: ikon(<><path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>) },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, keluar } = useAuth();
  const [buka, setBuka] = useState(false);

  const handleLogout = async () => {
    await keluarAkun();
    keluar();
    navigate("/", { replace: true });
  };

  const isi = (
    <div className="flex flex-col h-full">
      <Link to="/dashboard" className="flex items-center gap-3 px-6 h-20">
        <div className="w-10 h-10 rounded-xl bg-pine-800 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="font-extrabold text-ink leading-tight">KarierKu<br />Informatika</p>
      </Link>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {MENU.map((item) => {
          const aktif = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setBuka(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                aktif
                  ? "bg-pine-800 text-white"
                  : "text-stone-500 hover:bg-cream hover:text-ink"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="bg-cream rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pine-700 text-white font-bold flex items-center justify-center shrink-0">
            {(user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.name || "Pengguna"}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden p-4 fixed top-0 left-0 z-50">
        <button
          onClick={() => setBuka(true)}
          type="button"
          aria-label="Buka menu"
          className="p-2.5 bg-white border border-stone-200 text-ink rounded-xl shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {buka && (
        <div className="fixed inset-0 bg-ink/40 z-40 lg:hidden" onClick={() => setBuka(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200/70 transform transition-transform duration-300 lg:translate-x-0 ${
          buka ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {isi}
        <button
          onClick={() => setBuka(false)}
          aria-label="Tutup menu"
          className="lg:hidden absolute top-5 right-4 text-stone-400 hover:text-ink"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </aside>
    </>
  );
};
