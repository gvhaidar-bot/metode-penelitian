import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getLowongan, getPekerjaan, getQuest, setQuest as simpanQuest } from "../api.js";
import { BilahProgress, JudulKartu, Kartu, Kosong } from "../components/ui.jsx";

export default function Roadmap() {
  const [params] = useSearchParams();
  const [daftar, setDaftar] = useState([]);
  const [aktif, setAktif] = useState("");
  const [quest, setQuest] = useState({});
  const [lowongan, setLowongan] = useState(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    let batal = false;
    Promise.all([getPekerjaan(), getQuest()])
      .then(([pk, q]) => {
        if (!batal) {
          setDaftar(pk);
          setQuest(q);
          const dariUrl = params.get("karier");
          setAktif(pk.some((p) => p.id === dariUrl) ? dariUrl : pk[0]?.id || "");
        }
      })
      .catch((e) => {
        if (!batal) setGalat(e.message);
      });
    return () => {
      batal = true;
    };
  }, [params]);

  useEffect(() => {
    if (!aktif) return;
    let batal = false;
    getLowongan(aktif)
      .then((d) => {
        if (!batal) setLowongan(d);
      })
      .catch(() => {
        if (!batal) setLowongan({ lowongan: [] });
      });
    return () => {
      batal = true;
    };
  }, [aktif]);

  const job = daftar.find((p) => p.id === aktif);
  const progres = quest[aktif] || { selesai: [], total: 0, persen: 0 };
  const selesaiSet = new Set(progres.selesai);

  const toggle = async (langkah) => {
    const sudah = selesaiSet.has(langkah);
    // Optimistic update agar checkbox langsung merespons.
    setQuest((lama) => {
      const lamaQ = lama[aktif] || { selesai: [], total: 0, persen: 0 };
      const baru = sudah
        ? lamaQ.selesai.filter((x) => x !== langkah)
        : [...lamaQ.selesai, langkah].sort((a, b) => a - b);
      const total = lamaQ.total;
      return {
        ...lama,
        [aktif]: {
          selesai: baru,
          total,
          persen: total ? Math.round((baru.length / total) * 100) : 0,
        },
      };
    });
    try {
      await simpanQuest(aktif, langkah, !sudah);
    } catch (e) {
      setGalat(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <Kartu>
        <JudulKartu judul="Pilih karier" sub="Quest tersimpan di akun dan terbawa ke perangkat lain." />
        <label htmlFor="pilih-karier" className="sr-only">
          Pilih karier
        </label>
        <select
          id="pilih-karier"
          value={aktif}
          onChange={(e) => setAktif(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-line text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          {daftar.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
      </Kartu>

      {galat && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{galat}</p>
      )}

      {job && (
        <Kartu>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <h2 className="text-xl font-extrabold text-ink">{job.nama}</h2>
              <p className="text-sm text-muted mt-1">
                {job.kategori} | Rp{job.gaji_min}-{job.gaji_max} jt/bulan
              </p>
            </div>
            <p className="text-sm font-bold text-primary">
              {progres.selesai.length}/{progres.total} selesai ({progres.persen}%)
            </p>
          </div>
          <BilahProgress persen={progres.persen} />

          <div className="mt-6 space-y-3">
            {(job.roadmap || []).map((langkah, i) => {
              const centang = selesaiSet.has(i);
              return (
                <label
                  key={i}
                  className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    centang ? "border-primary bg-primary-wash" : "border-line bg-card hover:border-primary"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={centang}
                    onChange={() => toggle(i)}
                    aria-label={langkah.judul}
                    className="mt-1 w-5 h-5 rounded accent-primary shrink-0"
                  />
                  <div>
                    <p className={`font-bold ${centang ? "text-primary line-through" : "text-ink"}`}>
                      {langkah.judul}
                    </p>
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      {langkah.detail}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-2">
                      Estimasi: {langkah.estimasi}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {lowongan && lowongan.lowongan.length > 0 && (
            <div className="mt-8 pt-6 border-t border-line">
              <h3 className="font-extrabold text-ink mb-4">Lowongan terkait di Glints</h3>
              <div className="space-y-2">
                {lowongan.lowongan.map((l, i) => (
                  <div key={i} className="bg-wash rounded-xl px-4 py-3">
                    <p className="font-bold text-sm text-ink">{l.judul}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {l.perusahaan}
                      {l.lokasi ? " | " + l.lokasi : ""}
                      {l.gaji ? " | " + l.gaji : ""}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-3">
                Sumber: Glints Indonesia (Mei-Jun 2026, klaim tim).
              </p>
            </div>
          )}
        </Kartu>
      )}

      {!job && daftar.length === 0 && (
        <Kartu>
          <Kosong judul="Memuat data karier..." />
        </Kartu>
      )}
    </div>
  );
}
