import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

function bacaRiwayat() {
  try {
    const data = JSON.parse(localStorage.getItem("riwayat-rekomendasi") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const Riwayat = () => {
  const [riwayat, setRiwayat] = useState(bacaRiwayat);

  const hapus = () => {
    localStorage.removeItem("riwayat-rekomendasi");
    setRiwayat([]);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="lg:ml-72 w-full max-w-4xl mx-auto p-6 lg:p-10">
        <div className="mt-12 lg:mt-0 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Riwayat</h1>
            <p className="text-stone-500 mt-1 text-sm">Hasil rekomendasi yang pernah kamu hitung di perangkat ini.</p>
          </div>
          {riwayat.length > 0 && (
            <button
              onClick={hapus}
              className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {riwayat.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/70 p-10 text-center">
            <p className="text-stone-500 mb-5">Belum ada riwayat. Mulai rekomendasi pertamamu!</p>
            <Link
              to="/rekomendasi"
              className="inline-block px-6 py-3 bg-pine-800 hover:bg-pine-700 text-white font-bold rounded-xl transition"
            >
              Mulai Rekomendasi
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {riwayat.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200/70 p-6">
                <p className="text-xs text-stone-400 mb-2">{r.tanggal || ""}</p>
                <p className="text-sm text-stone-500 mb-3">
                  Skill: <span className="text-ink font-semibold">{(r.skills || []).join(", ") || "—"}</span>
                </p>
                <div className="space-y-2">
                  {(r.teratas || []).map((t, j) => (
                    <div key={j} className="flex items-center justify-between bg-paper rounded-xl px-4 py-2.5">
                      <span className="font-semibold text-sm">
                        <span className="text-pine-700 font-extrabold mr-2">{j + 1}.</span>{t.nama}
                      </span>
                      <span className="text-sm font-extrabold">{(t.skor * 100).toFixed(1)}%</span>
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
