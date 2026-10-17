"""Lapisan database (PostgreSQL via SQLAlchemy), skema 3NF.

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
    from sqlalchemy import (Column, DECIMAL, ForeignKey, Integer, String, Text,
                            UniqueConstraint, create_engine)
    from sqlalchemy.orm import declarative_base, relationship, sessionmaker

    Base = declarative_base()

    class Kategori(Base):
        __tablename__ = "kategori"
        id = Column(Integer, primary_key=True, autoincrement=True)
        nama = Column(String(50), nullable=False, unique=True)

    class Skill(Base):
        __tablename__ = "skill"
        id = Column(Integer, primary_key=True, autoincrement=True)
        nama = Column(String(100), nullable=False, unique=True)

    class Pekerjaan(Base):
        __tablename__ = "pekerjaan"
        id = Column(String(50), primary_key=True)
        nama = Column(String(100), nullable=False)
        kategori_id = Column(Integer, ForeignKey("kategori.id"), nullable=False)
        gaji_min = Column(DECIMAL(5, 1), nullable=False)
        gaji_max = Column(DECIMAL(5, 1), nullable=False)
        demand = Column(Integer, nullable=False)
        kategori = relationship("Kategori")
        relasi_skill = relationship("PekerjaanSkill", cascade="all, delete-orphan")
        roadmaps = relationship("Roadmap", cascade="all, delete-orphan",
                                order_by="Roadmap.urutan")

    class PekerjaanSkill(Base):
        __tablename__ = "pekerjaan_skill"
        pekerjaan_id = Column(String(50), ForeignKey("pekerjaan.id",
                               ondelete="CASCADE"), primary_key=True)
        skill_id = Column(Integer, ForeignKey("skill.id",
                           ondelete="CASCADE"), primary_key=True)
        skill = relationship("Skill")

    class Roadmap(Base):
        __tablename__ = "roadmap"
        id = Column(Integer, primary_key=True, autoincrement=True)
        pekerjaan_id = Column(String(50), ForeignKey("pekerjaan.id",
                               ondelete="CASCADE"), nullable=False)
        urutan = Column(Integer, nullable=False)
        judul = Column(String(100), nullable=False)
        detail = Column(Text, nullable=False)
        estimasi = Column(String(30), nullable=False)
        __table_args__ = (UniqueConstraint("pekerjaan_id", "urutan"),)

    _HAS_SQLA = True
except ImportError:
    _HAS_SQLA = False


def muat_dari_db():
    """Kembalikan list profil pekerjaan dari PostgreSQL, atau None bila tak tersedia."""
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
                "kategori": p.kategori.nama,
                "skills": [rs.skill.nama for rs in p.relasi_skill],
                "roadmap": [{"judul": r.judul, "detail": r.detail, "estimasi": r.estimasi}
                            for r in sorted(p.roadmaps, key=lambda r: r.urutan)],
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


def _dapat_atau_buat(s, model, **kwargs):
    obj = s.query(model).filter_by(**kwargs).one_or_none()
    if obj is None:
        obj = model(**kwargs)
        s.add(obj)
        s.flush()
    return obj


def seed_dari_json():
    """Isi tabel PostgreSQL dari pekerjaan.json (aman dijalankan ulang)."""
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
            kat = _dapat_atau_buat(s, Kategori, nama=job["kategori"])
            p = Pekerjaan(id=job["id"], nama=job["nama"], kategori_id=kat.id,
                          gaji_min=job["gaji_min"], gaji_max=job["gaji_max"],
                          demand=job["demand"])
            for sk in job["skills"]:
                skill = _dapat_atau_buat(s, Skill, nama=sk)
                p.relasi_skill.append(PekerjaanSkill(skill_id=skill.id))
            p.roadmaps = [Roadmap(urutan=i + 1, judul=lk["judul"],
                                  detail=lk["detail"], estimasi=lk["estimasi"])
                          for i, lk in enumerate(job["roadmap"])]
            s.add(p)
        s.commit()
    print(f"[db] seed selesai: {len(data)} pekerjaan")


if __name__ == "__main__":
    seed_dari_json()
