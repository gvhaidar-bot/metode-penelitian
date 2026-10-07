import React from 'react';
import { Sidebar } from "../components/sidebar";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const recentClassifications = [
    { id: 1, profesi: 'Web Developer', hasil: 'Tinggi', tanggal: '06 Oktober 2026' },
    { id: 2, profesi: 'UI/UX Designer', hasil: 'Rendah', tanggal: '05 Oktober 2026' },
    { id: 3, profesi: 'Database Administrator', hasil: 'Sedang', tanggal: '04 Oktober 2026' },
  ];

  const getBadgeColor = (hasil) => {
    switch(hasil) {
      case 'Tinggi': return 'bg-red-100 text-red-700 border-red-200';
      case 'Sedang': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rendah': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar />
      
      <div className="lg:ml-72 p-6 lg:p-10 w-full max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Dashboard</h1>
          <p className="text-lg text-slate-700 font-medium">Selamat datang kembali, Haidar.</p>
          <p className="text-slate-500 mt-1">Analisis dan lihat dampak Artificial Intelligence terhadap profesi di bidang Teknologi Informasi.</p>
        </div>

        {/* Primary Action Card */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-100/50 p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mulai Klasifikasi</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Analisis potensi dampak Artificial Intelligence terhadap suatu profesi di bidang Teknologi Informasi menggunakan algoritma Naïve Bayes.
            </p>
            <Link 
              to="/klasifikasi" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              Mulai Klasifikasi
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Klasifikasi</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Dampak Tinggi</p>
              <p className="text-2xl font-bold text-slate-900">5</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Dampak Sedang</p>
              <p className="text-2xl font-bold text-slate-900">4</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Dampak Rendah</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
          </div>
        </div>

        {/* Recent Classifications Table & System Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          
          {/* Table Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Klasifikasi Terakhir</h3>
              <Link to="/riwayat" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Lihat Semua
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100">Profesi</th>
                    <th className="px-6 py-4 border-b border-slate-100">Hasil Klasifikasi</th>
                    <th className="px-6 py-4 border-b border-slate-100">Tanggal</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentClassifications.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.profesi}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeColor(row.hasil)}`}>
                          {row.hasil}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{row.tanggal}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tentang Sistem</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Sistem ini menggunakan algoritma Naïve Bayes untuk mengklasifikasikan dampak Artificial Intelligence terhadap profesi di bidang Teknologi Informasi berdasarkan karakteristik yang telah ditentukan.
            </p>
            <button className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors">
              Pelajari Sistem
            </button>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
