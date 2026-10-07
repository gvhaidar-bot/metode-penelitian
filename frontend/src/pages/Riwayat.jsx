import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/sidebar";

const Riwayat = () => {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    try {
      setRiwayat(JSON.parse(localStorage.getItem("riwayat-rekomendasi") || "[]"));
    } catch { /* abaikan */ }
  }, []);

  const hapus = () => {
    localStorage.removeItem("riwayat-rekomendasi");
    setRiwayat([]);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />
      <div className="lg:ml-72 p-6 lg:p-10 w-full max-w-7xl mx-auto">
        <div className="mb-8 mt-12 lg:mt-0 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Riwayat Rekomendasi</h1>
            <p className="text-slate-500 mt-1">Hasil rekomendasi yang pernah kamu hitung di perangkat ini.</p>
          </div>
          {riwayat.length > 0 && (
            <button onClick={hapus} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              Hapus Riwayat
            </button>
          )}
        </div>

        {riwayat.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-slate-500 mb-4">Belum ada riwayat. Mulai rekomendasi pertamamu!</p>
            <Link to="/rekomendasi" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all">
              Mulai Rekomendasi
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {riwayat.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <p className="text-xs text-slate-400 mb-2">{r.tanggal}</p>
                <p className="text-sm text-slate-500 mb-3">
                  Skill: <span className="text-slate-700 font-medium">{r.skills.join(", ")}</span>
                </p>
                <div className="space-y-2">
                  {r.teratas.map((t, j) => (
                    <div key={j} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                      <span className="font-medium text-slate-800">
                        <span className="text-indigo-600 font-bold mr-2">{j + 1}.</span>{t.nama}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{(t.skor * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Riwayat;
