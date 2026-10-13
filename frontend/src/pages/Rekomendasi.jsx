import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMeta, getProfil, hitungRekomendasi } from "../api.js";
import { JudulKartu, Kartu, Kosong, TombolPrimer } from "../components/ui.jsx";

const persen = (x) => Math.round(x * 100);

function IkonPanah({ arah }) {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {arah === "atas" ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  );
}

export default function Rekomendasi() {
  const [minat, setMinat] = useState([]);
  const [skills, setSkills] = useState([]);
  const [hasil, setHasil] = useState(null);
  const [terbuka, setTerbuka] = useState(null);
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    let batal = false;
    Promise.all([getMeta(), getProfil()])
      .then(([m, p]) => {
        if (!batal) {
          setMinat(m.kategori || []);
          setSkills(p.skills || []);
        }
      })
      .catch((e) => {
        if (!batal) setGalat(e.message);
      });
    return () => {
      batal = true;
    };
  }, []);

  const geser = (index, arah) => {
    setMinat((lama) => {
      const tujuan = index + arah;
      if (tujuan < 0 || tujuan >= lama.length) return lama;
      const baru = [...lama];
      [baru[index], baru[tujuan]] = [baru[tujuan], baru[index]];
      return baru;
    });
  };

  const hitung = async () => {
    setGalat("");
    setHasil(null);
    if (skills.length === 0) {
      setGalat("Isi dulu skill di halaman Skill Saya sebelum menghitung.");
      return;
    }
    setSibuk(true);
    try {
      const d = await hitungRekomendasi({ skills, minat, top_n: 5 });
      setHasil(d.hasil || []);
    } catch (e) {
      setGalat(e.message);
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="space-y-6">
      <Kartu>
        <JudulKartu
          judul="Skill Anda"
          sub="Diambil dari profil. Hasil dihitung dari skill ini."
        />
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-pine-50 text-pine-800"
              >
                {s}
              </span>
            ))}
          </div>
        ) : (
          <Kosong
            judul="Belum ada skill di profil"
            sub="Tambahkan skill terlebih dahulu agar rekomendasi bisa dihitung."
          />
        )}
        <Link
          to="/skill"
          className="inline-block mt-4 text-sm font-bold text-pine-700 hover:text-pine-800"
        >
          Ubah di Skill Saya
        </Link>
      </Kartu>

      <Kartu>
        <JudulKartu
          judul="Urutan minat"
          sub="Susun lima bidang dari yang paling Anda minati. Baris teratas adalah minat utama Anda."
        />
        <ol className="space-y-2">
          {minat.map((k, i) => (
            <li
              key={k}
              className="flex items-center gap-3 bg-[#f7f5f0] rounded-xl px-4 py-3"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${
                  i === 0 ? "bg-gold-400 text-pine-900" : "bg-white text-[#6b7280] border border-[#e5e7eb]"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-bold text-[#1c1f1c]">{k}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => geser(i, -1)}
                  disabled={i === 0}
                  aria-label={"Naikkan " + k}
                  className="p-2 rounded-lg text-[#6b7280] hover:bg-white hover:text-pine-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <IkonPanah arah="atas" />
                </button>
                <button
                  type="button"
                  onClick={() => geser(i, 1)}
                  disabled={i === minat.length - 1}
                  aria-label={"Turunkan " + k}
                  className="p-2 rounded-lg text-[#6b7280] hover:bg-white hover:text-pine-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <IkonPanah arah="bawah" />
                </button>
              </div>
            </li>
          ))}
        </ol>
        {galat && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2.5">{galat}</p>
        )}
        <div className="mt-4 flex justify-end">
          <TombolPrimer onClick={hitung} disabled={sibuk || minat.length !== 5}>
            {sibuk ? "Menghitung..." : "Hitung Rekomendasi"}
          </TombolPrimer>
        </div>
      </Kartu>

      {hasil && (
        <Kartu>
          <JudulKartu
            judul="Hasil rekomendasi"
            sub="Peringkat lima karier dengan skor kecocokan tertinggi."
          />
          {hasil.length === 0 ? (
            <Kosong judul="Tidak ada hasil" sub="Coba ubah skill atau urutan minat Anda." />
          ) : (
            <div className="space-y-4">
              {hasil.map((h, i) => {
                const buka = terbuka === h.id;
                return (
                  <div key={h.id} className="border border-[#f2f5f2] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-[#6b7280]">Peringkat {i + 1}</p>
                        <h3 className="text-lg font-extrabold text-[#1c1f1c] mt-0.5">
                          {h.nama}
                        </h3>
                        <p className="text-sm text-[#6b7280] mt-1">
                          {h.kategori} | Rp{h.gaji_min}-{h.gaji_max} jt/bulan
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold text-pine-800 shrink-0">
                        {persen(h.skor_akhir)}%
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                      {[
                        ["Skill", h.skor_skill],
                        ["Minat", h.skor_minat],
                        ["Gaji", h.skor_gaji],
                        ["Demand", h.skor_demand],
                      ].map(([label, nilai]) => (
                        <div key={label} className="bg-[#f7f5f0] rounded-xl px-3 py-2">
                          <p className="text-xs text-[#6b7280]">{label}</p>
                          <p className="text-sm font-extrabold text-[#1c1f1c]">
                            {persen(nilai)}%
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setTerbuka(buka ? null : h.id)}
                        className="text-sm font-bold text-pine-700 hover:text-pine-800"
                      >
                        {buka ? "Sembunyikan detail skill" : "Lihat detail skill"}
                      </button>
                      <Link
                        to={"/roadmap?karier=" + h.id}
                        className="text-sm font-bold text-pine-700 hover:text-pine-800"
                      >
                        Lihat Roadmap
                      </Link>
                    </div>
                    {buka && (
                      <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-bold text-pine-800 mb-2">Skill yang cocok</p>
                          {h.skills_cocok.length > 0 ? (
                            <ul className="list-disc list-inside text-[#1c1f1c] space-y-1">
                              {h.skills_cocok.map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#6b7280]">Belum ada yang cocok.</p>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#6b7280] mb-2">Perlu dipelajari</p>
                          {h.skills_kurang.length > 0 ? (
                            <ul className="list-disc list-inside text-[#1c1f1c] space-y-1">
                              {h.skills_kurang.slice(0, 8).map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[#6b7280]">Semua skill sudah dikuasai.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Kartu>
      )}
    </div>
  );
}
