import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPekerjaan, getProfil, getQuest, getRiwayat } from "../api.js";
import { useAuth } from "../auth.jsx";
import { BilahProgress, JudulKartu, Kartu, Kosong, TombolPrimer } from "../components/ui.jsx";

function DiagramBatang({ data }) {
  const maks = Math.max(...data.map((d) => d.nilai), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-[#1c1f1c]">{d.nama}</span>
            <span className="text-[#6b7280] font-semibold">{d.nilai}%</span>
          </div>
          <div className="h-3 rounded-full bg-[#f2f5f2] overflow-hidden">
            <div
              className="h-full rounded-full bg-pine-700"
              style={{ width: (d.nilai / maks) * 100 + "%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
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

  const namaDepan = (user?.name || "").split(" ")[0] || "Mahasiswa";
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
      {/* Hero */}
      <Kartu className="bg-pine-800 !shadow-none">
        <p className="text-pine-100 text-sm">Selamat datang kembali,</p>
        <h2 className="text-2xl font-extrabold text-white mt-1">{namaDepan}</h2>
        {terakhir ? (
          <p className="text-pine-100 text-sm mt-3">
            Rekomendasi terakhir Anda:{" "}
            <span className="font-bold text-gold-400">
              {terakhir.hasil[0]?.nama}
            </span>{" "}
            dengan skor kecocokan {Math.round(terakhir.hasil[0]?.skor_akhir * 100)}%.
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-pine-100 text-sm mb-3">
              Lengkapi skill Anda, lalu hitung rekomendasi karier pertama Anda.
            </p>
            <Link to="/skill">
              <TombolPrimer className="!bg-gold-400 !text-pine-900 hover:!bg-gold-500">
                Isi Skill Saya
              </TombolPrimer>
            </Link>
          </div>
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
            <p className="text-3xl font-extrabold text-pine-800">{nilai}</p>
            <p className="text-sm text-[#6b7280] mt-1">{label}</p>
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
            sub="Hasil perhitungan akan muncul di sini setelah Anda menjalankan rekomendasi pertama."
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
                    className="font-semibold text-[#1c1f1c] hover:text-pine-700"
                  >
                    {namaKarier(q.id)}
                  </Link>
                  <span className="text-[#6b7280]">
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
            sub="Buka halaman Roadmap, pilih karier, lalu tandai langkah yang sudah Anda selesaikan."
          />
        )}
      </Kartu>
    </div>
  );
}
