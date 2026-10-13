/* Ikon garis tipis untuk navigasi. File terpisah agar lolos aturan react-refresh. */

function bungkus(path) {
  return function Ikon({ className = "w-5 h-5" }) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };
}

export const IkonDashboard = bungkus(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>
);

export const IkonSkill = bungkus(
  <>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </>
);

export const IkonRekomendasi = bungkus(
  <>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M7 14l4-4 3 3 5-6" />
  </>
);

export const IkonRoadmap = bungkus(
  <>
    <path d="M9 20l-5.5-2.8A1 1 0 0 1 3 16.3V5.7a1 1 0 0 1 1.5-.9L9 7.5m0 12.5 6-3m-6 3V7.5m6 10 4.5 2.2a1 1 0 0 0 1.5-.9V8.2a1 1 0 0 0-.5-.9L15 5m0 12.5V5m0 0L9 7.5" />
  </>
);

export const IkonRiwayat = bungkus(
  <>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 2" />
  </>
);

export const IkonKeluar = bungkus(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
);
