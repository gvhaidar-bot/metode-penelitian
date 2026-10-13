import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { getMeta, kirimRekomendasi } from "../api.js";

const simpanRiwayat = (skills, hasil) => {
  try {
    const raw = localStorage.getItem("riwayat-rekomendasi") || "[]";
    const lama = JSON.parse(raw);
    const list = Array.isArray(lama) ? lama : [];
    list.unshift({
      tanggal: new Date().toLocaleString("id-ID"),
      skills: Array.isArray(skills) ? skills : [],
      teratas: (hasil || []).slice(0, 3).map((h) => ({ nama: h.nama, skor: h.skor_akhir })),
    });
    localStorage.setItem("riwayat-rekomendasi", JSON.stringify(list.slice(0, 20)));
  } catch { /* abaikan */ }
};

const LANGKAH = ["Pilih skill", "Nilai minat", "Hasil"];

const Rekomendasi = () => {
  const [tahap, setTahap] = useState(0);
  const [daftarSkill, setDaftarSkill] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [jumlahKarier, setJumlahKarier] = useState(null);
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
        setJumlahKarier(m.jumlah_pekerjaan ?? null);
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
      const data = await kirimRekomendasi({ skills, minat, top_n: 5 });
      setHasil(data);
      simpanRiwayat(skills, data.hasil);
      setTahap(2);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const mulaiUlang = () => {
    setTahap(0);
    setHasil(null);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="lg:ml-72 w-full max-w-4xl mx-auto p-6 lg:p-10">
        <div className="mt-12 lg:mt-0 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Rekomendasi Karier</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Tiga langkah singkat menuju karier yang cocok untukmu.
          </p>
        </div>

        {/* Indikator langkah */}
        <div className="flex items-center gap-2 mb-8">
          {LANGKAH.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold ${
                    i < tahap ? "bg-pine-700 text-white" : i === tahap ? "bg-pine-800 text-white" : "bg-cream text-stone-400"
                  }`}
                >
                  {i < tahap ? "✓" : i + 1}
                </span>
                <span className={`text-sm font-bold hidden sm:block ${i <= tahap ? "text-ink" : "text-stone-400"}`}>
                  {label}
                </span>
              </div>
              {i < LANGKAH.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < tahap ? "bg-pine-700" : "bg-cream"}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <p className="font-bold text-red-800 mb-1">Terjadi masalah</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {memuat && !error && <p className="text-stone-500 mb-6">Menyiapkan data...</p>}

        {/* Tahap 0: skill */}
        {tahap === 0 && !memuat && (
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6 sm:p-8">
            <h2 className="text-xl font-extrabold mb-1">Skill apa yang sudah kamu kuasai?</h2>
            <p className="text-sm text-stone-500 mb-6">
              Ketuk untuk memilih — boleh lebih dari satu. Nanti dicocokkan dengan {jumlahKarier ?? "…"} bidang pekerjaan.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {daftarSkill.map((s) => {
                const aktif = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                      aktif
                        ? "bg-pine-800 text-white border-pine-800"
                        : "bg-white text-stone-600 border-stone-200 hover:border-pine-600 hover:text-pine-700"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {skills.length === 0 ? "Pilih minimal 1 skill" : `${skills.length} skill dipilih`}
                {skills.length > 0 && (
                  <button type="button" onClick={() => setSkills([])} className="ml-3 font-bold text-red-600 hover:underline">
                    Bersihkan
                  </button>
                )}
              </p>
              <button
                type="button"
                onClick={() => setTahap(1)}
                disabled={skills.length === 0}
                className="px-6 py-3 rounded-xl bg-pine-800 hover:bg-pine-700 disabled:opacity-40 text-white font-bold transition"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* Tahap 1: minat */}
        {tahap === 1 && (
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6 sm:p-8">
            <h2 className="text-xl font-extrabold mb-1">Seberapa tertarik kamu di tiap bidang?</h2>
            <p className="text-sm text-stone-500 mb-6">Geser ke kanan kalau kamu tertarik (1 = tidak, 5 = sangat).</p>
            <div className="space-y-5 mb-8">
              {kategori.map((k) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">{k}</span>
                    <span className="font-extrabold text-pine-700">{minat[k]}</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={minat[k] ?? 3}
                    onChange={(e) => setMinat((p) => ({ ...p, [k]: Number(e.target.value) }))}
                    className="slider-minat w-full"
                    aria-label={`Minat bidang ${k}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button" onClick={() => setTahap(0)}
                className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:bg-cream transition"
              >
                Kembali
              </button>
              <button
                type="button" onClick={proses} disabled={loading}
                className="px-6 py-3 rounded-xl bg-pine-800 hover:bg-pine-700 disabled:opacity-40 text-white font-bold transition"
              >
                {loading ? "Menghitung..." : "Lihat Hasilku"}
              </button>
            </div>
          </div>
        )}

        {/* Tahap 2: hasil */}
        {tahap === 2 && hasil && (
          <div>
            <div className="bg-pine-50 border border-pine-100 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-extrabold mb-1">Ini karier yang paling cocok untukmu</h2>
              <p className="text-sm text-stone-500">
                Dirangking dari kecocokan skill, minat, gaji, dan kebutuhan pasar.
              </p>
            </div>
            <div className="space-y-4 mb-8">
              {hasil.hasil.map((h, i) => (
                <div key={h.id} className="bg-white rounded-2xl border border-stone-200/70 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white ${i === 0 ? "bg-gold-500" : "bg-pine-800"}`}>
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-extrabold">{h.nama}</h3>
                        <p className="text-sm text-stone-500">{h.kategori}</p>
                      </div>
                    </div>
                    <Link
                      to={`/roadmap?karier=${h.id}`}
                      className="px-4 py-2 text-sm font-bold text-pine-700 bg-pine-50 hover:bg-pine-100 rounded-xl transition shrink-0"
                    >
                      Roadmap
                    </Link>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-stone-500 font-medium">Tingkat kecocokan</span>
                      <span className="font-extrabold">{(h.skor_akhir * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-cream rounded-full h-2.5">
                      <div className="bg-pine-700 h-2.5 rounded-full" style={{ width: `${h.skor_akhir * 100}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                    <div className="bg-paper rounded-xl p-3">
                      <p className="text-stone-500 text-xs mb-1">Skill cocok</p>
                      <p className="font-extrabold">{(h.skor_skill * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-paper rounded-xl p-3">
                      <p className="text-stone-500 text-xs mb-1">Gaji / bulan</p>
                      <p className="font-extrabold">Rp{h.gaji_min}–{h.gaji_max} jt</p>
                    </div>
                    <div className="bg-paper rounded-xl p-3">
                      <p className="text-stone-500 text-xs mb-1">Kebutuhan pasar</p>
                      <p className="font-extrabold text-gold-500">{"★".repeat(h.demand)}{"☆".repeat(5 - h.demand)}</p>
                    </div>
                  </div>

                  {h.skills_cocok.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-bold text-stone-500 mb-1.5">SKILL KAMU YANG COCOK</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.skills_cocok.map((s) => (
                          <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pine-50 text-pine-700 border border-pine-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.skills_kurang.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-stone-500 mb-1.5">PERLU KAMU PELAJARI</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.skills_kurang.map((s) => (
                          <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button" onClick={mulaiUlang}
              className="w-full py-3 rounded-xl font-bold text-pine-700 bg-pine-50 hover:bg-pine-100 transition"
            >
              Ulangi dari awal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rekomendasi;
