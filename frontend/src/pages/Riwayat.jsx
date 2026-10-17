import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRiwayat } from "../api.js";
import { JudulKartu, Kartu, Kosong } from "../components/ui.jsx";

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    let batal = false;
    getRiwayat()
      .then((d) => {
        if (!batal) setRiwayat(d.riwayat || []);
      })
      .catch((e) => {
        if (!batal) setGalat(e.message);
      });
    return () => {
      batal = true;
    };
  }, []);

  if (galat) {
    return (
      <Kartu>
        <Kosong judul="Riwayat tidak dapat dimuat" sub={galat} />
      </Kartu>
    );
  }

  if (!riwayat) {
    return (
      <Kartu>
        <Kosong judul="Memuat riwayat..." />
      </Kartu>
    );
  }

  return (
    <div className="space-y-4">
      {riwayat.length === 0 ? (
        <Kartu>
          <Kosong
            judul="Belum ada riwayat"
            sub="Hasil rekomendasi tersimpan otomatis di sini."
          />
          <div className="text-center mt-2">
            <Link
              to="/rekomendasi"
              className="text-sm font-bold text-primary hover:text-primary-deep"
            >
              Buat rekomendasi pertama
            </Link>
          </div>
        </Kartu>
      ) : (
        riwayat.map((r, i) => (
          <Kartu key={i}>
            <JudulKartu judul={r.waktu} sub={"Skill: " + (r.skills || []).join(", ")} />
            <div className="space-y-2">
              {(r.hasil || []).slice(0, 3).map((h, rank) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between bg-wash rounded-xl px-4 py-2.5"
                >
                  <p className="text-sm font-bold text-ink">
                    <span className="text-muted font-semibold mr-2">{rank + 1}.</span>
                    {h.nama}
                  </p>
                  <p className="text-sm font-extrabold text-primary">
                    {Math.round(h.skor_akhir * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </Kartu>
        ))
      )}
    </div>
  );
}
