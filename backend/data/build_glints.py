"""Statistik lowongan Glints per karier, dihitung dari database.

Jalankan dari folder backend:
    python data/build_glints.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from glints import muat_lowongan  # noqa: E402


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

    print(f"total: {len(semua)}, terpetakan: {len(semua) - tak_terpetakan}, "
          f"tak terpetakan: {tak_terpetakan}")
    for cid, d in sorted(per_karier.items()):
        print(f"  {cid}: {len(d['lowongan'])} lowongan, "
              f"gaji median {median(d['gmin'])}-{median(d['gmax'])} jt, "
              f"{len({l['perusahaan'] for l in d['lowongan'] if l['perusahaan']})} perusahaan unik")


if __name__ == "__main__":
    main()
