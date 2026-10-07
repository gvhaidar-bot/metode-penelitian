import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { SEMUA_SKILL, KATEGORI } from "../data/pekerjaan.js";
import { kirimRekomendasi } from "../api.js";

const simpanRiwayat = (skills, hasil) => {
  try {
    const lama = JSON.parse(localStorage.getItem("riwayat-rekomendasi") || "[]");
    lama.unshift({
      tanggal: new Date().toLocaleString("id-ID"),
      skills,
      teratas: hasil.slice(0, 3).map((h) => ({ nama: h.nama, skor: h.skor_akhir })),
    });
    localStorage.setItem("riwayat-rekomendasi", JSON.stringify(lama.slice(0, 20)));
  } catch { /* abaikan */ }
};

const Rekomendasi = () => {
  const [skills, setSkills] = useState([]);
  const [minat, setMinat] = useState(Object.fromEntries(KATEGORI.map((k) => [k, 3])));
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (s) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const proses = async () => {
    if (skills.length === 0) return;
    setLoading(true);
    try {
      const data = await kirimRekomendasi({ skills, minat, top_n: 5 });
      setHasil(data);
      simpanRiwayat(skills, data.hasil);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />
      <div className="lg:ml-72 p-6 lg:p-10 w-full max-w-7xl mx-auto">
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Rekomendasi Karier</h1>
          <p className="text-slate-500 mt-1">
            Pilih skill yang kamu kuasai dan nilai minatmu — sistem akan mencocokkannya
            dengan profil 10 bidang pekerjaan IT memakai Content-Based Filtering + Cosine Similarity.
          </p>
        </div>

        {/* Form skill */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">1. Skill yang kamu kuasai</h2>
          <p className="text-sm text-slate-500 mb-4">Klik untuk memilih (boleh lebih dari satu).</p>
          <div className="flex flex-wrap gap-2">
            {SEMUA_SKILL.map((s) => {
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
          <p className="text-sm text-slate-500 mb-4">Geser ke kanan kalau kamu tertarik (1 = tidak minat, 5 = sangat minat).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {KATEGORI.map((k) => (
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
          disabled={skills.length === 0 || loading}
          className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] mb-10"
        >
          {loading ? "Menghitung..." : "Lihat Rekomendasi"}
        </button>

        {/* Hasil */}
        {hasil && (
          <div className="pb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Hasil Rekomendasi
              <span className="ml-3 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full align-middle">
                sumber: {hasil.sumber}
              </span>
            </h2>
            <div className="space-y-4">
              {hasil.hasil.map((h, i) => (
                <div key={h.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${i === 0 ? "bg-indigo-600" : "bg-slate-300"}`}>
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{h.nama}</h3>
                          <p className="text-sm text-slate-500">{h.kategori}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/roadmap?karier=${h.id}`}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    >
                      Lihat Roadmap
                    </Link>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Skor akhir (SAW)</span>
                      <span className="font-bold text-slate-900">{(h.skor_akhir * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${h.skor_akhir * 100}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-slate-500 text-xs mb-1">Kecocokan skill</p>
                      <p className="font-bold text-slate-900">{(h.skor_skill * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-slate-500 text-xs mb-1">Gaji (per bulan)</p>
                      <p className="font-bold text-slate-900">Rp{h.gaji_min}–{h.gaji_max} jt</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-slate-500 text-xs mb-1">Kebutuhan pasar</p>
                      <p className="font-bold text-slate-900">{"★".repeat(h.demand)}{"☆".repeat(5 - h.demand)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-slate-500 text-xs mb-1">Skor minat</p>
                      <p className="font-bold text-slate-900">{(h.skor_minat * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {h.skills_cocok.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">Skill kamu yang cocok:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.skills_cocok.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.skills_kurang.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1.5">Perlu dipelajari:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.skills_kurang.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rekomendasi;
