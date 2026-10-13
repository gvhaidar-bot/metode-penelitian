"""Pipeline: petakan lowongan Glints ke 10 karier -> backend/data/glints_stats.json.

Jalankan dari folder backend:
    python data/build_glints.py
"""
import json
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from glints import muat_lowongan  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)))


def median(data):
    data = sorted(d for d in data if d is not None)
    if not data:
        return None
    n = len(data)
    tengah = n // 2
    return data[tengah] if n % 2 else (data[tengah - 1] + data[tengah]) / 2


def main():
    semua = muat_lowongan()
    per_karier = {}
    tak_terpetakan = 0
    for l in semua:
        cid = l["karier_id"]
        if not cid:
            tak_terpetakan += 1
            continue
        d = per_karier.setdefault(cid, {"lowongan": [], "gmin": [], "gmax": []})
        d["lowongan"].append(l)
        if l["gaji_min"]:
            d["gmin"].append(l["gaji_min"])
        if l["gaji_max"]:
            d["gmax"].append(l["gaji_max"])

    stats = {"total_barisan": len(semua), "tak_terpetakan": tak_terpetakan, "karier": {}}
    for cid, d in sorted(per_karier.items()):
        stats["karier"][cid] = {
            "jumlah_lowongan": len(d["lowongan"]),
            "gaji_min_median_jt": median(d["gmin"]),
            "gaji_max_median_jt": median(d["gmax"]),
            "perusahaan_unik": len({l["perusahaan"] for l in d["lowongan"] if l["perusahaan"]}),
        }

    keluar = os.path.join(DATA_DIR, "glints_stats.json")
    with open(keluar, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"ditulis: {keluar}")
    print(f"total: {len(semua)}, terpetakan: {len(semua) - tak_terpetakan}, tak terpetakan: {tak_terpetakan}")
    for cid, s in stats["karier"].items():
        print(f"  {cid}: {s['jumlah_lowongan']} lowongan, "
              f"gaji median {s['gaji_min_median_jt']}-{s['gaji_max_median_jt']} jt")


if __name__ == "__main__":
    main()
