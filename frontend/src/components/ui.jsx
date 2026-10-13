/* Komponen kecil yang dipakai ulang di beberapa halaman. */

export function LogoMark({ ukuran = "w-10 h-10", ikon = "w-5 h-5" }) {
  return (
    <div className={`${ukuran} rounded-xl bg-gold-400 flex items-center justify-center shrink-0`}>
      <svg
        className={`${ikon} text-pine-900`}
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
    <div className={`bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,76,54,0.08)] p-6 sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

export function JudulKartu({ judul, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-[#1c1f1c]">{judul}</h2>
      {sub && <p className="text-sm text-[#6b7280] mt-1">{sub}</p>}
    </div>
  );
}

export function BilahProgress({ persen, warna = "bg-pine-700" }) {
  return (
    <div className="h-2 rounded-full bg-[#f2f5f2] overflow-hidden">
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
      <p className="font-semibold text-[#1c1f1c]">{judul}</p>
      {sub && <p className="text-sm text-[#6b7280] mt-2 max-w-sm mx-auto">{sub}</p>}
    </div>
  );
}

export function TombolPrimer({ children, ...props }) {
  return (
    <button
      {...props}
      className={`px-5 py-2.5 rounded-xl bg-pine-800 text-white text-sm font-bold hover:bg-pine-900 transition disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
