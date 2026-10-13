import { useEffect, useRef, useState } from "react";
import { cariSkills, getProfil, simpanProfil } from "../api.js";
import { JudulKartu, Kartu, Kosong, TombolPrimer } from "../components/ui.jsx";

export default function Skill() {
  const [dipilih, setDipilih] = useState([]);
  const [kata, setKata] = useState("");
  const [saran, setSaran] = useState([]);
  const [usulan, setUsulan] = useState("");
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const tunda = useRef(null);

  useEffect(() => {
    let batal = false;
    getProfil()
      .then((p) => {
        if (!batal) setDipilih(p.skills || []);
      })
      .catch((e) => {
        if (!batal) setGalat(e.message);
      });
    return () => {
      batal = true;
    };
  }, []);

  // Pencarian skill dengan jeda ketik.
  useEffect(() => {
    if (tunda.current) clearTimeout(tunda.current);
    const q = kata.trim();
    tunda.current = setTimeout(() => {
      if (!q) {
        setSaran([]);
        return;
      }
      cariSkills(q)
        .then((d) => setSaran(d.skills || []))
        .catch(() => setSaran([]));
    }, 300);
    return () => {
      if (tunda.current) clearTimeout(tunda.current);
    };
  }, [kata]);

  const toggle = (s) => {
    setDipilih((lama) =>
      lama.includes(s) ? lama.filter((x) => x !== s) : [...lama, s]
    );
  };

  const tambahUsulan = () => {
    const s = usulan.trim().slice(0, 40);
    if (!s) return;
    if (!dipilih.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setDipilih((lama) => [...lama, s]);
    }
    setUsulan("");
  };

  const simpan = async () => {
    setGalat("");
    setPesan("");
    setSibuk(true);
    try {
      const p = await simpanProfil(dipilih);
      setDipilih(p.skills || []);
      setPesan("Skill tersimpan. Daftar ini dipakai sebagai dasar rekomendasi.");
    } catch (e) {
      setGalat(e.message);
    } finally {
      setSibuk(false);
    }
  };

  const chip = (s, aktif) => (
    <button
      key={s}
      type="button"
      onClick={() => toggle(s)}
      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${
        aktif
          ? "bg-primary text-white border-primary"
          : "bg-card text-ink border-line hover:border-primary"
      }`}
    >
      {s}
    </button>
  );

  return (
    <div className="space-y-6">
      <Kartu>
        <JudulKartu
          judul="Skill yang Anda kuasai"
          sub={`${dipilih.length} skill dipilih. Pilih dari daftar atau usulkan skill baru.`}
        />
        <label htmlFor="cari-skill" className="sr-only">
          Cari skill
        </label>
        <input
          id="cari-skill"
          type="text"
          value={kata}
          onChange={(e) => setKata(e.target.value)}
          placeholder="Ketik untuk mencari skill, mis. Python"
          className="w-full px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
        />
        {saran.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {saran.map((s) => chip(s, dipilih.includes(s)))}
          </div>
        )}
        {dipilih.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dipilih.map((s) => chip(s, true))}
          </div>
        ) : (
          <Kosong
            judul="Belum ada skill dipilih"
            sub="Cari skill di kolom atas, atau usulkan skill baru di bawah."
          />
        )}
      </Kartu>

      <Kartu>
        <JudulKartu
          judul="Usulkan skill baru"
          sub="Tidak menemukan skill Anda di daftar? Tulis di sini, maksimal 40 karakter."
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={usulan}
            onChange={(e) => setUsulan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") tambahUsulan();
            }}
            placeholder="Mis. Bahasa Inggris"
            maxLength={40}
            aria-label="Skill baru"
            className="flex-1 px-4 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <TombolPrimer onClick={tambahUsulan}>Tambah</TombolPrimer>
        </div>
      </Kartu>

      {pesan && (
        <p className="text-sm text-primary bg-primary-wash rounded-xl px-4 py-3">{pesan}</p>
      )}
      {galat && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{galat}</p>
      )}

      <div className="flex justify-end">
        <TombolPrimer onClick={simpan} disabled={sibuk}>
          {sibuk ? "Menyimpan..." : "Simpan ke Profil"}
        </TombolPrimer>
      </div>
    </div>
  );
}
