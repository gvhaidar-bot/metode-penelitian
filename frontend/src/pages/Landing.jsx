import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMeta, getPekerjaan } from "../api.js";
import { LogoMark } from "../components/ui.jsx";

const KRITERIA = [
  ["Kecocokan skill", "0,45", "Cosine similarity antara skill Anda dan profil skill karier"],
  ["Minat", "0,25", "Bobot kategori dari urutan prioritas minat Anda"],
  ["Gaji", "0,15", "Rentang gaji maksimum, ternormalisasi"],
  ["Demand", "0,15", "Tingkat kebutuhan industri, skala 1-5"],
];

const LANGKAH = [
  ["1", "Isi skill", "Pilih skill yang Anda kuasai dari daftar atau usulkan sendiri."],
  ["2", "Urutkan minat", "Susun lima bidang dari yang paling Anda minati, tanpa angka."],
  ["3", "Hitung rekomendasi", "Sistem menghitung skor CBF + SAW dan memberi peringkat karier."],
  ["4", "Ikuti roadmap", "Tandai quest belajar tiap karier sampai siap kerja."],
];

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
          <Link to="/metode" className="hover:text-ink">Metode</Link>
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

export function FooterPublik() {
  return (
    <footer className="border-t border-line mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Sistem Pendukung Keputusan Rekomendasi Karier Mahasiswa Informatika
        </p>
        <p className="text-sm text-muted">
          Metode: Content-Based Filtering + SAW
        </p>
      </div>
    </footer>
  );
}

export default function Landing() {
  const [pekerjaan, setPekerjaan] = useState([]);
  const [jmlSkill, setJmlSkill] = useState(null);

  useEffect(() => {
    getPekerjaan().then(setPekerjaan).catch(() => {});
    getMeta().then((m) => setJmlSkill((m.skills || []).length)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <NavPublik />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-14 sm:pt-20 pb-12">
        <p className="inline-block text-xs font-extrabold uppercase tracking-widest text-primary bg-wash rounded-full px-4 py-1.5">
          Sistem Pendukung Keputusan
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink mt-5 max-w-3xl leading-tight">
          Rekomendasi Karier Mahasiswa Informatika
        </h1>
        <p className="text-muted text-base sm:text-lg mt-4 max-w-2xl">
          Sistem berbasis web yang membantu mahasiswa Informatika memilih arah
          karier secara objektif, dihitung dari skill yang dikuasai dan urutan
          minat menggunakan metode Content-Based Filtering dan Simple Additive
          Weighting (SAW).
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            to="/masuk"
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-deep transition"
          >
            Coba Sistem
          </Link>
          <Link
            to="/metode"
            className="px-6 py-3 rounded-xl bg-card border border-line text-ink font-bold hover:border-primary transition"
          >
            Pelajari Metode
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {[
            [String(pekerjaan.length || 23), "Profil karier"],
            ["2", "Metode inti"],
            ["4", "Kriteria SAW"],
            [jmlSkill === null ? "-" : String(jmlSkill), "Skill terdaftar"],
          ].map(([angka, label]) => (
            <div key={label} className="bg-card rounded-2xl border border-line p-5">
              <p className="text-3xl font-extrabold text-primary">{angka}</p>
              <p className="text-sm text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metode ringkas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-2xl font-extrabold text-ink">Metode penelitian</h2>
        <p className="text-muted mt-2 max-w-2xl">
          Dua metode inti bekerja berurutan: CBF mengukur kecocokan skill,
          SAW menggabungkan empat kriteria menjadi satu skor akhir.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-card rounded-2xl border border-line p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Tahap 1</p>
            <h3 className="text-lg font-extrabold text-ink mt-2">Content-Based Filtering</h3>
            <p className="text-sm text-muted mt-2">
              Profil skill Anda dibandingkan dengan profil skill tiap karier
              memakai cosine similarity. Makin banyak skill yang cocok, makin
              tinggi skornya.
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-line p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Tahap 2</p>
            <h3 className="text-lg font-extrabold text-ink mt-2">Simple Additive Weighting</h3>
            <p className="text-sm text-muted mt-2">
              Empat kriteria dinormalisasi lalu dijumlahkan dengan bobot.
              Hasilnya adalah peringkat karier dari yang paling cocok.
            </p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-line p-6 mt-4 overflow-x-auto">
          <h3 className="text-base font-extrabold text-ink mb-4">Kriteria dan bobot SAW</h3>
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-2 pr-4 font-semibold">Kriteria</th>
                <th className="py-2 pr-4 font-semibold">Bobot</th>
                <th className="py-2 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {KRITERIA.map(([nama, bobot, ket]) => (
                <tr key={nama} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4 font-bold text-ink">{nama}</td>
                  <td className="py-3 pr-4 text-primary font-extrabold">{bobot}</td>
                  <td className="py-3 text-muted">{ket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alur */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-2xl font-extrabold text-ink">Cara kerja sistem</h2>
        <div className="grid sm:grid-cols-4 gap-4 mt-6">
          {LANGKAH.map(([no, judul, desk]) => (
            <div key={no} className="bg-card rounded-2xl border border-line p-6">
              <p className="w-9 h-9 rounded-full bg-wash text-primary font-extrabold flex items-center justify-center">
                {no}
              </p>
              <h3 className="font-extrabold text-ink mt-4">{judul}</h3>
              <p className="text-sm text-muted mt-1">{desk}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data karier */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-ink">Data karier</h2>
          <Link to="/data" className="text-sm font-bold text-primary hover:text-primary-deep">
            Lihat semua
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {pekerjaan.map((p) => (
            <Link
              key={p.id}
              to="/data"
              className="px-4 py-2 rounded-full bg-card border border-line text-sm font-semibold text-ink hover:border-primary transition"
            >
              {p.nama}
            </Link>
          ))}
        </div>
      </section>

      <FooterPublik />
    </div>
  );
}
