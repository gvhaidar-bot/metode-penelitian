import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/sidebar";
import { getMeta, bandingkanMetode } from "../api.js";

const tafsirKorelasi = (r) => {
  const a = Math.abs(r);
  if (a >= 0.7) return "kesepakatan kuat";
  if (a >= 0.4) return "kesepakatan sedang";
  if (a > 0) return "kesepakatan lemah";
  return "tidak sepakat";
};

const KartuMetrik = ({ label, nilai, tafsir, persen }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-3xl font-bold text-slate-900">
      {persen ? `${(nilai * 100).toFixed(0)}%` : nilai.toFixed(2)}
    </p>
    <p className="text-sm text-slate-500 mt-1">{tafsir}</p>
  </div>
);

const KolomRanking = ({ judul, deskripsi, warna, items, kunciSkor, labelSkor }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <h3 className="text-lg font-bold text-slate-900 mb-1">{judul}</h3>
    <p className="text-sm text-slate-500 mb-4">{deskripsi}</p>
    <ol className="space-y-3">
      {items.map((h, i) => (
        <li key={h.id} className="flex items-center gap-3">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0 ${i === 0 ? warna : "bg-slate-300"}`}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate">{h.nama}</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
              <div className={`${warna.replace("bg-", "bg-")} h-2 rounded-full`} style={{ width: `${Math.min(100, h[kunciSkor] * 100)}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-slate-700 w-14 text-right">
            {labelSkor(h)}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

const Perbandingan = () => {
  const [daftarSkill, setDaftarSkill] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [skills, setSkills] = useState([]);
  const [minat, setMinat] = useState({});
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMeta()
      .then((m) => {
        setDaftarSkill(m.skills);
        setKategori(m.kategori);
        setMinat(Object.fromEntries(m.kategori.map((k) => [k, 3])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setMemuat(false));
  }, []);

  const toggleSkill = (s) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const proses = async () => {
    if (skills.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bandingkanMetode({ skills, minat, top_n: 5 });
      setHasil(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />
      <div className="lg:ml-72 p-6 lg:p-10 w-full max-w-7xl mx-auto">
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Perbandingan Metode</h1>
          <p className="text-slate-500 mt-1">
            Uji konsistensi: bandingkan ranking <b>CBF + SAW</b> (metode utama)
            dengan <b>Naive Bayes</b> (pembanding) pada input yang sama.
            Kesepakatan tinggi bukan berarti satu metode lebih akurat.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <p className="font-bold text-red-800 mb-1">Backend tidak terjangkau</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {memuat && !error && (
          <p className="text-slate-500 mb-6">Memuat data dari backend...</p>
        )}

        {/* Form skill */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">1. Skill yang kamu kuasai</h2>
          <p className="text-sm text-slate-500 mb-4">Klik untuk memilih (boleh lebih dari satu).</p>
          <div className="flex flex-wrap gap-2">
            {daftarSkill.map((s) => {
              const aktif = skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    aktif
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-slate-500 mt-3">{skills.length} skill dipilih</p>
        </div>

        {/* Form minat */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">2. Nilai minatmu per bidang</h2>
          <p className="text-sm text-slate-500 mb-4">Hanya dipakai metode CBF+SAW (Naive Bayes hanya memakai skill).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {kategori.map((k) => (
              <div key={k}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{k}</span>
                  <span className="font-bold text-indigo-600">{minat[k]}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={minat[k]}
                  onChange={(e) => setMinat((p) => ({ ...p, [k]: Number(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={proses}
          disabled={skills.length === 0 || loading || memuat}
          className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] mb-10"
        >
          {loading ? "Membandingkan..." : "Bandingkan Metode"}
        </button>

        {/* Hasil */}
        {hasil && (
          <div className="pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Hasil Perbandingan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <KartuMetrik
                label="Overlap@5"
                nilai={hasil.metrik.overlap}
                persen
                tafsir={`${Math.round(hasil.metrik.overlap * 5)} dari 5 teratas sama pada kedua metode`}
              />
              <KartuMetrik
                label="Korelasi Spearman"
                nilai={hasil.metrik.spearman_rho}
                tafsir={tafsirKorelasi(hasil.metrik.spearman_rho)}
              />
              <KartuMetrik
                label="Kendall's Tau"
                nilai={hasil.metrik.kendall_tau}
                tafsir={tafsirKorelasi(hasil.metrik.kendall_tau)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <KolomRanking
                judul="CBF + SAW"
                deskripsi="Metode utama: cosine similarity + 4 kriteria berbobot."
                warna="bg-indigo-600"
                items={hasil.cbf_saw}
                kunciSkor="skor_akhir"
                labelSkor={(h) => `${(h.skor_akhir * 100).toFixed(1)}%`}
              />
              <KolomRanking
                judul="Naive Bayes"
                deskripsi="Pembanding: P(karier | skill) probabilistik."
                warna="bg-emerald-600"
                items={hasil.naive_bayes}
                kunciSkor="probabilitas"
                labelSkor={(h) => `${(h.probabilitas * 100).toFixed(1)}%`}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-sm text-amber-800">
                <b>Catatan:</b> {hasil.catatan}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perbandingan;
