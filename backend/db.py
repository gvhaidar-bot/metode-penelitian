"""Lapisan database (PostgreSQL via SQLAlchemy).

Aktif bila environment variable DATABASE_URL diisi, contoh:
    postgresql+psycopg2://postgres:password@localhost/karier_it

Bila tidak diisi / koneksi gagal, backend otomatis memakai pekerjaan.json
(mode fallback) sehingga tetap bisa jalan tanpa PostgreSQL.
"""
import json
import os
from pathlib import Path

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

try:
    from sqlalchemy import Column, DECIMAL, ForeignKey, Integer, String, Text, create_engine
    from sqlalchemy.orm import declarative_base, relationship, sessionmaker

    Base = declarative_base()

    class Pekerjaan(Base):
        __tablename__ = "pekerjaan"
        id = Column(String(50), primary_key=True)
        nama = Column(String(100), nullable=False)
        kategori = Column(String(50), nullable=False)
        gaji_min = Column(DECIMAL(5, 1), nullable=False)
        gaji_max = Column(DECIMAL(5, 1), nullable=False)
        demand = Column(Integer, nullable=False)
        skills = relationship("PekerjaanSkill", cascade="all, delete-orphan")
        roadmaps = relationship("Roadmap", cascade="all, delete-orphan",
                                order_by="Roadmap.urutan")

    class PekerjaanSkill(Base):
        __tablename__ = "pekerjaan_skill"
        id = Column(Integer, primary_key=True, autoincrement=True)
        pekerjaan_id = Column(String(50), ForeignKey("pekerjaan.id"), nullable=False)
        skill = Column(String(100), nullable=False)

    class Roadmap(Base):
        __tablename__ = "roadmap"
        id = Column(Integer, primary_key=True, autoincrement=True)
        pekerjaan_id = Column(String(50), ForeignKey("pekerjaan.id"), nullable=False)
        urutan = Column(Integer, nullable=False)
        langkah = Column(Text, nullable=False)

    _HAS_SQLA = True
except ImportError:
    _HAS_SQLA = False


def muat_dari_db():
    """Kembalikan list profil pekerjaan dari MySQL, atau None bila tak tersedia."""
    if not (_HAS_SQLA and DATABASE_URL):
        return None
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        Session = sessionmaker(bind=engine)
        with Session() as s:
            rows = s.query(Pekerjaan).all()
            if not rows:
                return None
            return [{
                "id": p.id,
                "nama": p.nama,
                "kategori": p.kategori,
                "skills": [sk.skill for sk in p.skills],
                "roadmap": [r.langkah for r in sorted(p.roadmaps, key=lambda r: r.urutan)],
                "gaji_min": float(p.gaji_min),
                "gaji_max": float(p.gaji_max),
                "demand": int(p.demand),
            } for p in rows]
    except Exception as e:
        print(f"[db] PostgreSQL tidak terjangkau ({e}); pakai pekerjaan.json")
        return None


def muat_dari_json():
    p = Path(__file__).parent / "data" / "pekerjaan.json"
    return json.loads(p.read_text(encoding="utf-8"))


def seed_dari_json():
    """Isi tabel MySQL dari pekerjaan.json (sekali saja)."""
    if not (_HAS_SQLA and DATABASE_URL):
        raise RuntimeError("DATABASE_URL belum diisi")
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    data = muat_dari_json()
    with Session() as s:
        for job in data:
            if s.get(Pekerjaan, job["id"]):
                continue
            p = Pekerjaan(id=job["id"], nama=job["nama"], kategori=job["kategori"],
                          gaji_min=job["gaji_min"], gaji_max=job["gaji_max"],
                          demand=job["demand"])
            p.skills = [PekerjaanSkill(skill=sk) for sk in job["skills"]]
            p.roadmaps = [Roadmap(urutan=i + 1, langkah=lk)
                          for i, lk in enumerate(job["roadmap"])]
            s.add(p)
        s.commit()
    print(f"[db] seed selesai: {len(data)} pekerjaan")


if __name__ == "__main__":
    seed_dari_json()
