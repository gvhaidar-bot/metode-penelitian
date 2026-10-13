import { Link } from "react-router-dom";
import { FooterPublik } from "./Landing.jsx";
import { LogoMark } from "../components/ui.jsx";

function NavPublik() {
  return (
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
          <Link to="/metode" className="text-ink">Metode</Link>
          <Link to="/data" className="hover:text-ink">Data Karier</Link>
        </nav>
        <Link
          to="/masuk"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-deep transition"
        >
          Masuk
        </Link>
      </div>
    </header>
  );
}

function Rumus({ children }) {
  return (
    <p className="mt-3 inline-block bg-wash rounded-xl px-5 py-3 font-mono text-sm text-ink">
      {children}
    </p>
  );
}

export default function Metode() {
  return (
    <div className="min-h-screen bg-bg">
      <NavPublik />
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            Metode penelitian
          </p>
          <h1 className="text-3xl font-extrabold text-ink mt-3">
            Content-Based Filtering dan SAW
          </h1>
          <p className="text-muted mt-3">
            Sistem ini memakai dua metode yang bekerja berurutan. Tidak ada
            metode lain yang dipakai dalam perhitungan.
          </p>
        </div>

        <section className="bg-card rounded-2xl border border-line p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Tahap 1</p>
          <h2 className="text-xl font-extrabold text-ink mt-2">Content-Based Filtering</h2>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Skill yang Anda kuasai dibentuk menjadi profil, lalu dibandingkan
            dengan profil skill tiap karier. Perbandingan memakai cosine
            similarity: jumlah skill yang sama dibagi akar perkalian jumlah
            skill kedua profil. Nilainya 0 sampai 1. Karier yang memakai banyak
            skill yang Anda kuasai mendapat skor mendekati 1.
          </p>
          <Rumus>cos(A, B) = |A ∩ B| / (√|A| × √|B|)</Rumus>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Sebelum dibandingkan, nama skill dinormalkan: huruf kecil,
            "HTML/CSS" dipecah menjadi dua, dan istilah Bahasa Indonesia
            dipadankan ke Bahasa Inggris ("ui desain" menjadi "ui design"),
            karena profil karier memakai istilah Inggris.
          </p>
        </section>

        <section className="bg-card rounded-2xl border border-line p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Tahap 2</p>
          <h2 className="text-xl font-extrabold text-ink mt-2">Simple Additive Weighting (SAW)</h2>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Empat kriteria dinilai untuk tiap karier, dinormalisasi ke skala
            0-1 dengan rumus kriteria benefit, lalu dijumlahkan memakai bobot.
            Karier dengan nilai preferensi tertinggi menempati peringkat pertama.
          </p>
          <Rumus>V = 0,45×skill + 0,25×minat + 0,15×gaji + 0,15×demand</Rumus>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["Kecocokan skill (0,45)", "Hasil cosine similarity tahap 1, dipakai langsung."],
              ["Minat (0,25)", "Anda mengurutkan lima bidang dari yang paling diminati. Urutan diubah menjadi bobot memakai Rank Order Centroid, teknik pembobotan baku untuk mengubah ranking menjadi bobot di dalam SAW."],
              ["Gaji (0,15)", "Gaji maksimum karier dibagi gaji maksimum seluruh data."],
              ["Demand (0,15)", "Tingkat kebutuhan industri skala 1-5, dibagi 5."],
            ].map(([judul, desk]) => (
              <div key={judul} className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-muted"><span className="font-bold text-ink">{judul}.</span> {desk}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-line p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">Informasi ketahanan terhadap AI</h2>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Setiap karier punya label ketahanan terhadap AI
            (rendah/sedang/tinggi). Label ini hanya informasi tambahan dan{" "}
            <span className="font-bold text-ink">tidak ikut perhitungan</span>,
            sehingga metode tetap dua.
          </p>
        </section>

        <section className="bg-card rounded-2xl border border-line p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">Contoh perhitungan</h2>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Pengguna menguasai Python dan SQL, dengan urutan minat: Data &amp; AI
            di peringkat 1, Web di peringkat 2.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="bg-wash rounded-xl p-4">
              <p className="font-extrabold text-ink">Data Analyst</p>
              <p className="text-muted mt-1 font-mono text-xs sm:text-sm">
                V = 0,45×0,4264 + 0,25×0,4567 + 0,15×0,4823 + 0,15×0,2000 = 0,4084
              </p>
            </div>
            <div className="bg-wash rounded-xl p-4">
              <p className="font-extrabold text-ink">Frontend Developer</p>
              <p className="text-muted mt-1 font-mono text-xs sm:text-sm">
                V = 0,45×0,0000 + 0,25×0,2567 + 0,15×0,6454 + 0,15×0,8000 = 0,2810
              </p>
            </div>
          </div>
          <p className="text-sm text-muted mt-4">
            Peringkat: <span className="font-bold text-ink">1. Data Analyst (0,4084)</span> di
            atas Frontend Developer (0,2810), sesuai skill dan minat pengguna.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/masuk"
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-deep transition"
          >
            Coba Sistem
          </Link>
          <Link
            to="/data"
            className="px-6 py-3 rounded-xl bg-card border border-line text-ink font-bold hover:border-primary transition"
          >
            Lihat Data Karier
          </Link>
        </div>
      </main>
      <FooterPublik />
    </div>
  );
}
