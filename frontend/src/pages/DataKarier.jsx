import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPekerjaan } from "../api.js";
import { FooterPublik } from "./Landing.jsx";
import { LogoMark, BadgeAirisk, DisclaimerData } from "../components/ui.jsx";

export default function DataKarier() {
  const [pekerjaan, setPekerjaan] = useState(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    getPekerjaan().then(setPekerjaan).catch((e) => setGalat(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark ukuran="w-9 h-9" ikon="w-4 h-4" />
            <span className="font-extrabold text-ink leading-tight text-sm">
              KarierKu
              <br />
              Informatika
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-sm font-semibold text-muted">
            <Link to="/metode" className="hover:text-ink">Metode</Link>
            <Link to="/data" className="text-ink">Data Karier</Link>
          </nav>
          <Link
            to="/masuk"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-deep transition"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
          Dataset penelitian
        </p>
        <h1 className="text-3xl font-extrabold text-ink mt-3">Data karier</h1>
        <p className="text-muted mt-3 max-w-2xl">
          {(pekerjaan ? pekerjaan.length : 23)} profil karier hasil kurasi. Tiap profil memuat daftar
          skill, kategori bidang, rentang gaji, dan tingkat kebutuhan industri.
          Data inilah yang dibandingkan dengan profil Anda oleh sistem.
        </p>
        <DisclaimerData className="mt-4 max-w-2xl" />

        {galat && (
          <p className="mt-6 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{galat}</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {(pekerjaan || []).map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-line p-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                {p.kategori}
              </p>
              <h2 className="text-lg font-extrabold text-ink mt-2">{p.nama}</h2>
              <div className="mt-2">
                <BadgeAirisk risiko={p.ai_risk} />
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <p className="text-muted">
                  <span className="font-extrabold text-ink">{p.skills.length}</span> skill
                </p>
                <p className="text-muted">
                  <span className="font-extrabold text-ink">Rp{p.gaji_min}-{p.gaji_max} jt</span>/bln
                </p>
                <p className="text-muted">
                  Demand <span className="font-extrabold text-ink">{p.demand}/5</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.skills.slice(0, 6).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-wash text-xs font-semibold text-ink">
                    {s}
                  </span>
                ))}
                {p.skills.length > 6 && (
                  <span className="px-2.5 py-1 text-xs font-semibold text-muted">
                    +{p.skills.length - 6} lagi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-card rounded-2xl border border-line p-6 sm:p-8 text-center">
          <h2 className="text-xl font-extrabold text-ink">Lihat posisi Anda di antara 14 karier ini</h2>
          <p className="text-sm text-muted mt-2">
            Masuk, isi skill, dan biarkan sistem menghitung peringkat kecocokan Anda.
          </p>
          <Link
            to="/masuk"
            className="inline-block mt-5 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-deep transition"
          >
            Masuk ke Sistem
          </Link>
        </div>
      </main>
      <FooterPublik />
    </div>
  );
}
