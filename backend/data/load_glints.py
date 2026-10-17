"""Impor glints_jobs.csv ke tabel lowongan_glints di PostgreSQL.

Jalankan dari folder backend, setelah schema.sql + seed.sql:
    python data/load_glints.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from glints import impor_csv_ke_db  # noqa: E402


def main():
    total, terpetakan, tak_terpetakan = impor_csv_ke_db()
    print(f"lowongan_glints: total={total}, terpetakan={terpetakan}, "
          f"tak terpetakan={tak_terpetakan}")


if __name__ == "__main__":
    main()
