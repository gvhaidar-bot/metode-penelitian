import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { getPekerjaan } from "../api.js";

const Roadmap = () => {
  const [params] = useSearchParams();
  const [daftar, setDaftar] = useState([]);
  const [aktif, setAktif] = useState(params.get("karier") || "");
  const [error, setError] = useState(null);

  useEffect(() => {
    getPekerjaan()
      .then((d) => {
        setDaftar(d);
        if (!params.get("karier") && d.length > 0) setAktif(d[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Sinkronkan pilihan dengan query param bila URL berubah setelah mount
  // (mis. navigasi dari kartu hasil rekomendasi saat sudah di /roadmap).
  useEffect(() => {
    const dariUrl = params.get("karier");
    if (dariUrl) setAktif(dariUrl);
  }, [params]);

  const job = daftar.find((p) => p.id === aktif);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />
      <div className="lg:ml-72 p-6 lg:p-10 w-full max-w-7xl mx-auto">
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Roadmap Belajar</h1>
          <p className="text-slate-500 mt-1">
            Tahapan belajar yang disarankan untuk tiap bidang karier — dari dasar sampai siap kerja.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
            <p className="font-bold text-red-800 mb-1">Backend tidak terjangkau</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {daftar.map((p) => (
            <button
              key={p.id}
              onClick={() => setAktif(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                aktif === p.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              {p.nama}
            </button>
          ))}
        </div>

        {job && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{job.nama}</h2>
                <p className="text-sm text-slate-500">
                  {job.kategori} • Rp{job.gaji_min}–{job.gaji_max} jt/bulan • Kebutuhan pasar {"★".repeat(job.demand)}
                </p>
              </div>
              <Link
                to="/rekomendasi"
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Cek Kecocokanku
              </Link>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-indigo-100" />
              {job.roadmap.map((langkah, i) => (
                <div key={i} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-8 top-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 leading-relaxed pt-0.5">{langkah}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;
