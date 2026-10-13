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

  const inputCls =
    "w-full bg-transparent text-white placeholder-white/80 border-none outline-none pr-5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-400 to-blue-50 relative overflow-hidden px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md text-center bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl p-8 z-10"
      >
        <h1 className="text-white text-3xl font-semibold tracking-wide">
          {mode === "login" ? "Masuk" : "Daftar"}
        </h1>
        <p className="text-white/80 text-sm mt-2 mb-8">
          {mode === "login"
            ? "Silakan masuk untuk melanjutkan"
            : "Buat akun untuk memulai"}
        </p>

        {error && (
          <div className="mb-4 text-sm text-left bg-red-500/20 border border-red-200/40 text-white rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {mode !== "login" && (
          <div className="mb-4">
            <label htmlFor="nama" className="sr-only">Nama lengkap</label>
            <div className="flex items-center w-full bg-white/20 ring-1 ring-white/30 focus-within:ring-white h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all shadow-inner">
              <input
                id="nama"
                type="text"
                name="nama"
                autoComplete="name"
                placeholder="Nama lengkap"
                className={inputCls}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="sr-only">Alamat email</label>
          <div className="flex items-center w-full bg-white/20 ring-1 ring-white/30 focus-within:ring-white h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all shadow-inner">
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Alamat email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="sr-only">Kata sandi</label>
          <div className="flex items-center w-full bg-white/20 ring-1 ring-white/30 focus-within:ring-white h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all shadow-inner">
            <input
              id="password"
              type="password"
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Kata sandi (min. 6 karakter)"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full text-blue-600 font-semibold bg-white hover:bg-blue-50 hover:shadow-lg transition-all shadow-md disabled:opacity-70"
        >
          {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
        </button>

        <p className="text-white text-sm mt-6 mb-2">
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setError(null);
            }}
            className="text-blue-100 font-medium hover:text-white hover:underline transition ml-1"
          >
            {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
          </button>
        </p>
      </form>

      {/* Lingkaran dekoratif */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Home;
