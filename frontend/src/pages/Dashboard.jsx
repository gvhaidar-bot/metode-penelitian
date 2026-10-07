import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    try {
      setRiwayat(JSON.parse(localStorage.getItem("riwayat-rekomendasi") || "[]"));
    } catch { /* abaikan */ }
  }, []);

  const terakhir = riwayat[0];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />

      <div className="lg:ml-72 p-6 lg:p-10 w-full max-w-7xl mx-auto">
        <div className="mb-10 mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Dashboard</h1>
          <p className="text-lg text-slate-700 font-medium">Selamat datang kembali, Haidar.</p>
          <p className="text-slate-500 mt-1">
            Temukan bidang karier IT yang paling cocok dengan skill dan minatmu.
          </p>
        </div>

        {/* Primary Action Card */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-100/50 p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mulai Rekomendasi Karier</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Masukkan skill yang kamu kuasai dan nilai minatmu. Sistem mencocokkannya
              dengan profil 10 bidang pekerjaan IT menggunakan Content-Based Filtering
              + Cosine Similarity, lalu merangkingnya dengan metode SAW.
            </p>
            <Link
              to="/rekomendasi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              Mulai Rekomendasi
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </div>
          <div className="relative z-10 hidden md:flex items-center justify-center w-32 h-32 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-500">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Rekomendasi</p>
              <p className="text-2xl font-bold text-slate-900">{riwayat.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.938 23.938 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Bidang Pekerjaan</p>
              <p className="text-2xl font-bold text-slate-900">10</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Roadmap Tersedia</p>
              <p className="text-2xl font-bold text-slate-900">10</p>
            </div>
          </div>
        </div>

        {/* Recent + About */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Rekomendasi Terakhir</h3>
              <Link to="/riwayat" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Lihat Semua
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="p-6 flex-1">
              {!terakhir ? (
                <p className="text-slate-500 text-sm">Belum ada rekomendasi. <Link to="/rekomendasi" className="text-indigo-600 font-medium hover:underline">Buat yang pertama</Link>.</p>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-3">{terakhir.tanggal}</p>
                  <div className="space-y-2">
                    {terakhir.teratas.map((t, j) => (
                      <div key={j} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                        <span className="font-medium text-slate-800">
                          <span className="text-indigo-600 font-bold mr-2">{j + 1}.</span>{t.nama}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{(t.skor * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tentang Sistem</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Sistem rekomendasi bidang karier untuk mahasiswa IT. Skill yang dimasukkan
              dicocokkan dengan profil 10 pekerjaan memakai Content-Based Filtering +
              Cosine Similarity, lalu dirangking dengan SAW dari skor skill, minat,
              gaji, dan kebutuhan pasar. Setiap hasil dilengkapi roadmap belajar.
            </p>
            <Link to="/rekomendasi" className="block text-center w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors">
              Coba Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
