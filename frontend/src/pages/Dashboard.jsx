import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { getPekerjaan } from "../api.js";

function bacaRiwayat() {
  try {
    const data = JSON.parse(localStorage.getItem("riwayat-rekomendasi") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const Dashboard = () => {
  const { user } = useAuth();
  const [riwayat] = useState(bacaRiwayat);
  const [jumlahKarier, setJumlahKarier] = useState(null);

  useEffect(() => {
    getPekerjaan()
      .then((d) => setJumlahKarier(d.length))
      .catch(() => setJumlahKarier(null));
  }, []);

  const terakhir = riwayat[0];
  const namaDepan = (user?.name || "kawan").split(" ")[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="lg:ml-72 w-full max-w-5xl mx-auto p-6 lg:p-10">
        <div className="mt-12 lg:mt-0 mb-8">
          <p className="text-sm font-semibold text-pine-700 mb-1">Halo, {namaDepan}!</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Mau jadi apa setelah lulus?</h1>
          <p className="text-stone-500 mt-2 max-w-xl">
            Jawab dua langkah singkat — pilih skill yang kamu kuasai, nilai
            minatmu — dan lihat bidang karier IT yang paling cocok untukmu.
          </p>
        </div>

        <Link
          to="/rekomendasi"
          className="block bg-pine-900 text-white rounded-2xl p-8 mb-6 relative overflow-hidden group"
        >
          <div
            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition"
            style={{ backgroundImage: "radial-gradient(circle at 85% 20%, #e8a93d 0, transparent 35%)" }}
          />
          <div className="relative">
            <p className="text-gold-400 text-sm font-bold mb-2">MULAI DARI SINI</p>
            <h2 className="text-2xl font-extrabold mb-2">Cek kecocokan kariermu</h2>
            <p className="text-pine-100/80 text-sm mb-6 max-w-md">
              Cuma butuh ±2 menit. Hasilnya berupa ranking karier + roadmap
              belajar yang bisa langsung kamu ikuti.
            </p>
            <span className="inline-flex items-center gap-2 bg-gold-400 text-pine-900 font-bold text-sm px-5 py-2.5 rounded-xl">
              Mulai Sekarang
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { angka: riwayat.length, label: "Rekomendasi dibuat" },
            { angka: jumlahKarier ?? "…", label: "Bidang karier" },
            { angka: jumlahKarier ?? "…", label: "Roadmap tersedia" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-200/70 p-5">
              <p className="text-3xl font-extrabold text-pine-800">{s.angka}</p>
              <p className="text-xs font-semibold text-stone-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold">Terakhir kamu cek</h3>
            {riwayat.length > 0 && (
              <Link to="/riwayat" className="text-sm font-bold text-pine-700 hover:underline">
                Lihat semua
              </Link>
            )}
          </div>
          {!terakhir ? (
            <p className="text-sm text-stone-500">
              Belum ada. <Link to="/rekomendasi" className="font-bold text-pine-700 hover:underline">Buat rekomendasi pertamamu</Link>.
            </p>
          ) : (
            <div className="space-y-2">
              {(terakhir.teratas || []).map((t, j) => (
                <div key={j} className="flex items-center justify-between bg-paper rounded-xl px-4 py-3">
                  <span className="font-semibold text-sm">
                    <span className="text-pine-700 font-extrabold mr-2">{j + 1}.</span>{t.nama}
                  </span>
                  <span className="text-sm font-extrabold text-pine-800">{(t.skor * 100).toFixed(1)}%</span>
                </div>
              ))}
              <p className="text-xs text-stone-400 pt-1">{terakhir.tanggal || ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
