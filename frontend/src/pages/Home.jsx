import React from "react";
import { useNavigate } from "react-router-dom";
import { daftarAkun, masukAkun } from "../api.js";
import { useAuth } from "../auth.jsx";

const Home = () => {
  const [mode, setMode] = React.useState("login");
  const [nama, setNama] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { masuk, user } = useAuth();

  React.useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u =
        mode === "login"
          ? await masukAkun({ email, password })
          : await daftarAkun({ name: nama, email, password });
      masuk(u);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full h-12 px-5 rounded-xl bg-white border border-stone-200 text-ink placeholder-stone-400 outline-none focus:border-pine-600 focus:ring-2 focus:ring-pine-100 transition";

  return (
    <div className="min-h-screen flex">
      {/* Panel kiri: brand */}
      <div className="hidden lg:flex w-[44%] bg-pine-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #e8a93d 0, transparent 40%), radial-gradient(circle at 80% 70%, #1e7a5c 0, transparent 45%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-gold-400 flex items-center justify-center">
              <svg className="w-6 h-6 text-pine-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-extrabold text-lg leading-tight">KarierKu<br />Informatika</p>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Bingung mau jadi apa setelah lulus?
          </h1>
          <p className="text-pine-100/90 leading-relaxed max-w-md">
            Masukkan skill dan minatmu, sistem akan mencocokkannya dengan
            profil 10 bidang pekerjaan IT dan memberi tahu karier yang
            paling cocok — lengkap dengan roadmap belajarnya.
          </p>
        </div>
        <ul className="relative space-y-3 text-sm text-pine-100/90">
          {["Ranking karier berbasis kecocokan skill", "Roadmap belajar tiap bidang", "Info gaji & kebutuhan pasar"].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-pine-700 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Panel kanan: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-pine-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-extrabold leading-tight">KarierKu<br />Informatika</p>
          </div>

          <h2 className="text-3xl font-extrabold mb-2">
            {mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}
          </h2>
          <p className="text-stone-500 mb-8">
            {mode === "login"
              ? "Masuk untuk melihat rekomendasi kariermu."
              : "Daftar dulu, gratis — cuma butuh semenit."}
          </p>

          {error && (
            <div className="mb-5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {mode !== "login" && (
            <div className="mb-4">
              <label htmlFor="nama" className="block text-sm font-semibold mb-1.5">Nama lengkap</label>
              <input
                id="nama" type="text" name="nama" autoComplete="name"
                placeholder="cth. Budi Santoso" className={field}
                value={nama} onChange={(e) => setNama(e.target.value)} required
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5">Email</label>
            <input
              id="email" type="email" name="email" autoComplete="email"
              placeholder="cth. budi@email.com" className={field}
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold mb-1.5">Kata sandi</label>
            <input
              id="password" type="password" name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Minimal 6 karakter" className={field}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full h-12 rounded-xl bg-pine-800 hover:bg-pine-700 disabled:opacity-60 text-white font-bold transition active:scale-[0.99]"
          >
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Sekarang"}
          </button>

          <p className="text-sm text-stone-500 text-center mt-6">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => { setMode((m) => (m === "login" ? "register" : "login")); setError(null); }}
              className="font-bold text-pine-700 hover:underline"
            >
              {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Home;
