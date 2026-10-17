"""Generate backend/seed.sql dari backend/data/pekerjaan.json.

Seed adalah turunan data JSON (satu sumber kebenaran), bukan data
yang ditulis tangan. Bila pekerjaan.json berubah, jalankan ulang:

    python data/generate_seed.py

lalu jalankan ulang seed.sql di PostgreSQL. Gaya INSERT idempotent
(ON CONFLICT DO NOTHING) dipertahankan dari seed lama agar aman
dijalankan berulang kali.
"""
import json
import os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(DATA_DIR, "pekerjaan.json")
SEED_PATH = os.path.join(os.path.dirname(DATA_DIR), "seed.sql")


def q(teks):
    """Escape satu nilai string untuk literal SQL PostgreSQL."""
    return "'" + str(teks).replace("'", "''") + "'"


def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)
    items = data if isinstance(data, list) else data.get("pekerjaan", data)

    kategori = sorted({p["kategori"] for p in items})
    skills = sorted({s for p in items for s in p["skills"]})

    out = []
    out.append("-- seed.sql — DIGENERATE dari backend/data/pekerjaan.json.")
    out.append("-- Jangan edit manual; ubah pekerjaan.json lalu jalankan:")
    out.append("--   python backend/data/generate_seed.py")
    out.append("")
    out.append("INSERT INTO kategori (nama) VALUES")
    out.append(",\n".join(f"  ({q(k)})" for k in kategori))
    out.append("ON CONFLICT (nama) DO NOTHING;")
    out.append("")
    out.append("INSERT INTO skill (nama) VALUES")
    out.append(",\n".join(f"  ({q(s)})" for s in skills))
    out.append("ON CONFLICT (nama) DO NOTHING;")
    out.append("")
    out.append("INSERT INTO pekerjaan (id, nama, kategori_id, gaji_min, gaji_max, demand) VALUES")
    baris = []
    for p in items:
        baris.append(
            f"  ({q(p['id'])}, {q(p['nama'])}, "
            f"(SELECT id FROM kategori WHERE nama = {q(p['kategori'])}), "
            f"{p['gaji_min']}, {p['gaji_max']}, {p['demand']})"
        )
    out.append(",\n".join(baris))
    out.append("ON CONFLICT (id) DO NOTHING;")
    out.append("")
    out.append("INSERT INTO pekerjaan_skill (pekerjaan_id, skill_id) VALUES")
    baris = []
    for p in items:
        for s in p["skills"]:
            baris.append(
                f"  ({q(p['id'])}, (SELECT id FROM skill WHERE nama = {q(s)}))"
            )
    out.append(",\n".join(baris))
    out.append("ON CONFLICT DO NOTHING;")
    out.append("")
    out.append("INSERT INTO roadmap (pekerjaan_id, urutan, judul, detail, estimasi) VALUES")
    baris = []
    for p in items:
        for i, lk in enumerate(p["roadmap"], 1):
            baris.append(
                f"  ({q(p['id'])}, {i}, {q(lk['judul'])}, "
                f"{q(lk['detail'])}, {q(lk['estimasi'])})"
            )
    out.append(",\n".join(baris))
    out.append("ON CONFLICT (pekerjaan_id, urutan) DO NOTHING;")
    out.append("")

    with open(SEED_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(out))

    n_relasi = sum(len(p["skills"]) for p in items)
    n_roadmap = sum(len(p["roadmap"]) for p in items)
    print(f"ditulis: {SEED_PATH}")
    print(f"kategori={len(kategori)} skill={len(skills)} "
          f"pekerjaan={len(items)} relasi={n_relasi} roadmap={n_roadmap}")


if __name__ == "__main__":
    main()
