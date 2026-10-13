import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPekerjaan, getProfil, getQuest, getRiwayat } from "../api.js";
import { BilahProgress, JudulKartu, Kartu, Kosong, TombolPrimer } from "../components/ui.jsx";

function DiagramBatang({ data }) {
  const maks = Math.max(...data.map((d) => d.nilai), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-ink">{d.nama}</span>
            <span className="text-muted font-semibold">{d.nilai}%</span>
          </div>
          <div className="h-3 rounded-full bg-wash overflow-hidden">
            <div
              className="h-full rounded-full bg-lavender"
              style={{ width: (d.nilai / maks) * 100 + "%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [profil, setProfil] = useState(null);
  const [quest, setQuest] = useState(null);
  const [pekerjaan, setPekerjaan] = useState([]);
  const [riwayat, setRiwayat] = useState(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    let batal = false;
    Promise.all([getProfil(), getQuest(), getRiwayat(), getPekerjaan()])
      .then(([p, q, r, pk]) => {
        if (!batal) {
          setProfil(p);
          setQuest(q);
          setRiwayat(r.riwayat || []);
          setPekerjaan(pk);
        }
      })
      .catch((e) => {
        if (!batal) setGalat(e.message);
      });
    return () => {
      batal = true;
    };
  }, []);

  const terakhir = riwayat && riwayat.length > 0 ? riwayat[0] : null;
  const teratas = terakhir
    ? terakhir.hasil.slice(0, 5).map((h) => ({
        id: h.id,
        nama: h.nama,
        nilai: Math.round(h.skor_akhir * 100),
      }))
    : [];

  const questSelesai = quest
    ? Object.values(quest).reduce((a, q) => a + q.selesai.length, 0)
    : 0;

  const namaKarier = (id) =>
    (pekerjaan.find((p) => p.id === id) || {}).nama || id;

  const daftarQuest = quest
    ? Object.entries(quest)
        .map(([id, q]) => ({ id, ...q }))
        .filter((q) => q.persen > 0)
        .sort((a, b) => b.persen - a.persen)
        .slice(0, 6)
    : [];

  if (galat) {
    return (
      <Kartu>
        <Kosong judul="Data tidak dapat dimuat" sub={galat} />
      </Kartu>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero ala template: angka besar yang komunikatif */}
      <Kartu>
        <p className="text-sm text-muted">Selamat datang kembali,</p>
        {terakhir ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 leading-snug">
              Karier paling cocok untuk Anda adalah{" "}
              <span className="text-primary">{terakhir.hasil[0]?.nama}</span>
            </h2>
            <p className="text-muted text-sm mt-3">
              Skor kecocokan {Math.round(terakhir.hasil[0]?.skor_akhir * 100)}%,
              dihitung dengan Content-Based Filtering + SAW dari{" "}
              {terakhir.skills.length} skill dan urutan minat Anda.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link to="/rekomendasi">
                <TombolPrimer>Hitung Ulang</TombolPrimer>
              </Link>
              <Link
                to={"/roadmap?karier=" + terakhir.hasil[0]?.id}
                className="px-5 py-2.5 rounded-xl border border-line text-sm font-bold text-ink hover:border-primary transition"
              >
                Lihat Roadmap
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 leading-snug">
              Mulai petakan karier impian Anda
            </h2>
            <p className="text-muted text-sm mt-3">
              Tiga langkah: isi skill, urutkan minat, terima peringkat karier
              hasil perhitungan sistem.
            </p>
            <div className="mt-5">
              <Link to="/skill">
                <TombolPrimer>Isi Skill Saya</TombolPrimer>
              </Link>
            </div>
          </>
        )}
      </Kartu>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ["Skill dikuasai", profil ? profil.skills.length : "-"],
          ["Langkah quest selesai", quest ? questSelesai : "-"],
          ["Rekomendasi dibuat", riwayat ? riwayat.length : "-"],
        ].map(([label, nilai]) => (
          <Kartu key={label}>
            <p className="text-3xl font-extrabold text-ink">{nilai}</p>
            <p className="text-sm text-muted mt-1">{label}</p>
          </Kartu>
        ))}
      </div>

      {/* Skor karier */}
      <Kartu>
        <JudulKartu
          judul="Skor karier teratas"
          sub="Lima hasil teratas dari rekomendasi terakhir Anda."
        />
        {teratas.length > 0 ? (
          <DiagramBatang data={teratas} />
        ) : (
          <Kosong
            judul="Belum ada rekomendasi"
            sub="Jalankan rekomendasi pertama untuk melihat hasil."
          />
        )}
      </Kartu>

      {/* Progress quest */}
      <Kartu>
        <JudulKartu
          judul="Progress quest"
          sub="Langkah roadmap yang sudah Anda selesaikan per karier."
        />
        {daftarQuest.length > 0 ? (
          <div className="space-y-4">
            {daftarQuest.map((q) => (
              <div key={q.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <Link
                    to={"/roadmap?karier=" + q.id}
                    className="font-semibold text-ink hover:text-primary"
                  >
                    {namaKarier(q.id)}
                  </Link>
                  <span className="text-muted">
                    {q.selesai.length}/{q.total} ({q.persen}%)
                  </span>
                </div>
                <BilahProgress persen={q.persen} />
              </div>
            ))}
          </div>
        ) : (
          <Kosong
            judul="Belum ada quest yang dikerjakan"
            sub="Tandai quest yang selesai di halaman Roadmap."
          />
        )}
      </Kartu>
    </div>
  );
}
