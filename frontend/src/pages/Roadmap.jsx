import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { getLowongan, getPekerjaan } from "../api.js";

const Roadmap = () => {
  const [params, setParams] = useSearchParams();
  const [daftar, setDaftar] = useState([]);
  const [lowongan, setLowongan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPekerjaan()
      .then(setDaftar)
      .catch((e) => setError(e.message));
  }, []);

  // Karier aktif mengikuti query param (?karier=...) agar selalu sinkron
  // dengan URL, termasuk saat navigasi dari halaman hasil rekomendasi.
  // Bila id tidak dikenal, fallback ke karier pertama agar halaman
  // tidak kosong.
  const paramId = params.get("karier");
  const aktif = daftar.some((p) => p.id === paramId)
    ? paramId
    : (daftar[0] ? daftar[0].id : "");

  const job = daftar.find((p) => p.id === aktif);

  useEffect(() => {
    if (!aktif) return;
    let batal = false;
    getLowongan(aktif)
      .then((d) => { if (!batal) setLowongan(d); })
      .catch(() => { if (!batal) setLowongan({ lowongan: [], total_terpetakan: 0 }); });
    return () => { batal = true; };
  }, [aktif]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="lg:ml-72 w-full max-w-4xl mx-auto p-6 lg:p-10">
        <div className="mt-12 lg:mt-0 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Roadmap Belajar</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Tahapan belajar tiap bidang karier — dari dasar sampai siap kerja.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <p className="font-bold text-red-800 mb-1">Terjadi masalah</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {daftar.map((p) => (
            <button
              key={p.id}
              onClick={() => setParams({ karier: p.id })}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                aktif === p.id
                  ? "bg-pine-800 text-white border-pine-800"
                  : "bg-white text-stone-600 border-stone-200 hover:border-pine-600 hover:text-pine-700"
              }`}
            >
              {p.nama}
            </button>
          ))}
        </div>

        {job && (
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div>
                <h2 className="text-xl font-extrabold">{job.nama}</h2>
                <p className="text-sm text-stone-500">
                  {job.kategori} • Rp{job.gaji_min}–{job.gaji_max} jt/bulan •{" "}
                  <span className="text-gold-500 font-bold">{"★".repeat(job.demand)}</span>
                  <span className="text-stone-300">{"★".repeat(5 - job.demand)}</span>
                </p>
              </div>
              <Link
                to="/rekomendasi"
                className="px-4 py-2 text-sm font-bold text-pine-700 bg-pine-50 hover:bg-pine-100 rounded-xl transition"
              >
                Cek Kecocokanku
              </Link>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-pine-100" />
              {(job.roadmap || []).map((langkah, i) => (
                <div key={i} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-pine-800 text-white text-sm font-extrabold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-stone-700 leading-relaxed pt-1">{langkah}</p>
                </div>
              ))}
            </div>

            {lowongan && lowongan.lowongan.length > 0 && (
              <div className="mt-8 pt-8 border-t border-stone-200/70">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-extrabold">Lowongan terkait di Glints</h3>
                </div>
                <div className="space-y-2">
                  {lowongan.lowongan.map((l, i) => (
                    <div key={i} className="bg-paper rounded-xl px-4 py-3">
                      <p className="font-bold text-sm">{l.judul}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {l.perusahaan}{l.lokasi ? " • " + l.lokasi : ""}{l.gaji ? " • " + l.gaji : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-3">Sumber: Glints Indonesia (Mei–Jun 2026, klaim tim).</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;
