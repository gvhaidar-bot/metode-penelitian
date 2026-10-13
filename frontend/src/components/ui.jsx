/* Komponen kecil yang dipakai ulang di beberapa halaman. */

export function LogoMark({ ukuran = "w-10 h-10", ikon = "w-5 h-5" }) {
  return (
    <div className={`${ukuran} rounded-xl bg-[#e8a93d] flex items-center justify-center shrink-0`}>
      <svg
        className={`${ikon} text-[#0b3828]`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 20h4v-4h4v-4h4V8" />
        <path d="M13 11l3-3 3 3" />
      </svg>
    </div>
  );
}

export function Kartu({ children, className = "" }) {
  return (
    <div className={`bg-card rounded-2xl border border-line shadow-[0_1px_2px_rgba(16,24,40,0.05)] p-6 sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

export function JudulKartu({ judul, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-ink">{judul}</h2>
      {sub && <p className="text-sm text-muted mt-1">{sub}</p>}
    </div>
  );
}

export function BilahProgress({ persen, warna = "bg-primary" }) {
  return (
    <div className="h-2 rounded-full bg-wash overflow-hidden">
      <div
        className={`h-full rounded-full ${warna} transition-all`}
        style={{ width: Math.max(0, Math.min(100, persen)) + "%" }}
      />
    </div>
  );
}

export function Kosong({ judul, sub }) {
  return (
    <div className="text-center py-10 px-4">
      <p className="font-semibold text-ink">{judul}</p>
      {sub && <p className="text-sm text-muted mt-2 max-w-sm mx-auto">{sub}</p>}
    </div>
  );
}

export function TombolPrimer({ children, ...props }) {
  return (
    <button
      {...props}
      className={`px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-deep transition disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

/* Badge ketahanan karier terhadap AI. Hanya informasi tampilan,
   tidak ikut perhitungan skor. */
const WARNA_RISIKO = {
  rendah: "bg-success-wash text-success",
  sedang: "bg-[#fdf6e3] text-[#b07d1e]",
  tinggi: "bg-[#fdeeee] text-coral",
};

export function BadgeAirisk({ risiko }) {
  if (!risiko || !risiko.level || risiko.level === "-") return null;
  return (
    <span
      title={risiko.alasan || ""}
      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${WARNA_RISIKO[risiko.level] || "bg-wash text-muted"}`}
    >
      Risiko AI: {risiko.level}
    </span>
  );
}

export function DisclaimerData({ className = "" }) {
  return (
    <p className={`text-xs text-muted leading-relaxed ${className}`}>
      Data demand dan gaji per Juni 2026. Rekomendasi ini titik awal,
      bukan keputusan final; tinjau ulang tiap 1-2 tahun.
    </p>
  );
}
