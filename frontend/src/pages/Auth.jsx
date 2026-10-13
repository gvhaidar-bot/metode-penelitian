import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { daftarAkun, masukAkun } from "../api.js";
import { useAuth } from "../auth.jsx";
import { LogoMark } from "../components/ui.jsx";

export default function Auth() {
  const [mode, setMode] = useState("masuk");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const { masuk } = useAuth();
  const navigasi = useNavigate();

  const kirim = async (e) => {
    e.preventDefault();
    setGalat("");
    setSibuk(true);
    try {
      const user =
        mode === "masuk"
          ? await masukAkun({ email, password })
          : await daftarAkun({ name, email, password });
      masuk(user);
      navigasi("/dashboard", { replace: true });
    } catch (err) {
      setGalat(err.message);
    } finally {
      setSibuk(false);
    }
  };

  const daftar = mode === "daftar";

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_2px_12px_rgba(16,76,54,0.1)] overflow-hidden grid md:grid-cols-2">
        {/* Panel brand */}
        <div className="bg-pine-800 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <p className="font-extrabold leading-tight">
              KarierKu
              <br />
              Informatika
            </p>
          </div>
          <div className="mt-12">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              Temukan karier IT yang paling cocok untuk Anda.
            </h1>
            <p className="mt-4 text-pine-100 text-sm leading-relaxed">
              Masuk untuk menyimpan skill, menandai quest roadmap, dan melihat
              riwayat rekomendasi Anda. Data tersimpan di akun dan terbawa
              saat Anda masuk dari perangkat mana pun.
            </p>
          </div>
        </div>
        {/* Panel form */}
        <div className="p-8 sm:p-10">
          <div className="flex gap-2 mb-8 bg-[#f2f5f2] rounded-xl p-1">
            {[
              ["masuk", "Masuk"],
              ["daftar", "Daftar"],
            ].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setGalat("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                  mode === m ? "bg-white text-pine-800 shadow-sm" : "text-[#6b7280]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <form onSubmit={kirim} className="space-y-4">
            {daftar && (
              <div>
                <label htmlFor="nama" className="block text-sm font-semibold text-[#1c1f1c] mb-1.5">
                  Nama lengkap
                </label>
                <input
                  id="nama"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-pine-600"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1c1f1c] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-pine-600"
              />
            </div>
            <div>
              <label htmlFor="sandi" className="block text-sm font-semibold text-[#1c1f1c] mb-1.5">
                Kata sandi
              </label>
              <input
                id="sandi"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={daftar ? "Minimal 6 karakter" : "Kata sandi Anda"}
                autoComplete={daftar ? "new-password" : "current-password"}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-pine-600"
              />
            </div>
            {galat && (
              <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2.5">{galat}</p>
            )}
            <button
              type="submit"
              disabled={sibuk}
              className="w-full py-3 rounded-xl bg-pine-800 text-white text-sm font-bold hover:bg-pine-900 transition disabled:opacity-50"
            >
              {sibuk ? "Memproses..." : daftar ? "Buat Akun" : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
