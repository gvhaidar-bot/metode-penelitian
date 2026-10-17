"""Lapisan database (PostgreSQL via SQLAlchemy), skema 3NF.

Database WAJIB tersedia: backend membaca seluruh data persisten dari
PostgreSQL (karier, bobot SAW, lowongan Glints, akun, quest, riwayat).
Tidak ada lagi fallback ke file JSON. File JSON/CSV di backend/data
hanya bahan seed/dataset (pekerjaan.json -> seed.sql, glints_jobs.csv
-> load_glints.py), tidak dibaca aplikasi saat berjalan.

Aktif bila environment variable DATABASE_URL diisi, contoh:
    postgresql+psycopg2://postgres:password@localhost/karier_it
"""
import json
import os
from datetime import datetime
from pathlib import Path

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

try:
    from sqlalchemy import (Column, DECIMAL, DateTime, Float, ForeignKey,
                            Integer, String, Text, UniqueConstraint,
                            create_engine)
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

    class Users(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, autoincrement=True)
        nama = Column(String(100), nullable=False)
        email = Column(String(200), nullable=False, unique=True)
        password_hash = Column(Text, nullable=False)
        dibuat = Column(DateTime, nullable=False, default=datetime.now)

    class Sesi(Base):
        __tablename__ = "sesi"
        token_hash = Column(String(64), primary_key=True)
        user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                         nullable=False)
        exp = Column(DateTime, nullable=False)
        user = relationship("Users")

    class ProfilSkill(Base):
        __tablename__ = "profil_skill"
        user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                         primary_key=True)
        skill = Column(String(40), primary_key=True)
        urutan = Column(Integer, nullable=False)

    class QuestProgress(Base):
        __tablename__ = "quest_progress"
        user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                         primary_key=True)
        karier_id = Column(String(50), ForeignKey("pekerjaan.id",
                           ondelete="CASCADE"), primary_key=True)
        langkah = Column(Integer, primary_key=True)

    class Riwayat(Base):
        __tablename__ = "riwayat"
        id = Column(Integer, primary_key=True, autoincrement=True)
        user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                         nullable=False)
        waktu = Column(DateTime, nullable=False, default=datetime.now)

    class RiwayatSkill(Base):
        __tablename__ = "riwayat_skill"
        riwayat_id = Column(Integer, ForeignKey("riwayat.id",
                             ondelete="CASCADE"), primary_key=True)
        urutan = Column(Integer, primary_key=True)
        skill = Column(String(100), nullable=False)

    class RiwayatMinat(Base):
        __tablename__ = "riwayat_minat"
        riwayat_id = Column(Integer, ForeignKey("riwayat.id",
                             ondelete="CASCADE"), primary_key=True)
        urutan = Column(Integer, primary_key=True)
        kategori = Column(String(50), nullable=False)

    class RiwayatHasil(Base):
        __tablename__ = "riwayat_hasil"
        riwayat_id = Column(Integer, ForeignKey("riwayat.id",
                             ondelete="CASCADE"), primary_key=True)
        urutan = Column(Integer, primary_key=True)
        karier_id = Column(String(50), ForeignKey("pekerjaan.id",
                           ondelete="CASCADE"), nullable=False)
        skor_akhir = Column(Float, nullable=False)
        pekerjaan = relationship("Pekerjaan")

    class BobotSaw(Base):
        __tablename__ = "bobot_saw"
        kriteria = Column(String(20), primary_key=True)
        nilai = Column(DECIMAL(4, 3), nullable=False)

    class LowonganGlints(Base):
        __tablename__ = "lowongan_glints"
        id = Column(Integer, primary_key=True, autoincrement=True)
        karier_id = Column(String(50), ForeignKey("pekerjaan.id",
                           ondelete="SET NULL"))
        judul = Column(String(300), nullable=False)
        perusahaan = Column(String(200), nullable=False)
        lokasi = Column(String(200), nullable=False, default="")
        gaji_teks = Column(String(200), nullable=False, default="")
        gaji_min = Column(DECIMAL(6, 1))
        gaji_max = Column(DECIMAL(6, 1))
        tipe = Column(String(50), nullable=False, default="")
        pengalaman = Column(String(100), nullable=False, default="")

    _HAS_SQLA = True
except ImportError:
    _HAS_SQLA = False


_ENGINE = None


def engine():
    """Satu engine SQLAlchemy untuk seluruh aplikasi (dibuat sekali)."""
    global _ENGINE
    if _ENGINE is None:
        if not (_HAS_SQLA and DATABASE_URL):
            raise RuntimeError("DATABASE_URL belum diisi")
        _ENGINE = create_engine(DATABASE_URL, pool_pre_ping=True)
    return _ENGINE


def sesi_db():
    """Session SQLAlchemy baru (panggil .close() setelah dipakai)."""
    return sessionmaker(bind=engine())()


BOBOT_SAW_DEFAULT = {"skill": 0.45, "minat": 0.25, "gaji": 0.15, "demand": 0.15}


def muat_dari_db():
    """Kembalikan list profil pekerjaan dari PostgreSQL, atau None bila tak tersedia."""
    if not (_HAS_SQLA and DATABASE_URL):
        return None
    try:
        with sesi_db() as s:
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
        print(f"[db] PostgreSQL tidak terjangkau ({e})")
        return None


def muat_bobot_dari_db():
    """Baca bobot SAW dari tabel bobot_saw; gagal bila DB tidak tersedia
    atau total bobot != 1."""
    with sesi_db() as s:
        rows = s.query(BobotSaw).all()
        bobot = {r.kriteria: float(r.nilai) for r in rows}
    total = sum(bobot.values())
    if not bobot or abs(total - 1.0) > 1e-9:
        raise ValueError(f"Total bobot SAW harus = 1, dapat {total}")
    return bobot


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
    """Isi tabel PostgreSQL dari pekerjaan.json + bobot SAW (aman diulang)."""
    if not (_HAS_SQLA and DATABASE_URL):
        raise RuntimeError("DATABASE_URL belum diisi")
    Base.metadata.create_all(engine())
    data = muat_dari_json()
    with sesi_db() as s:
        for kriteria, nilai in BOBOT_SAW_DEFAULT.items():
            if s.get(BobotSaw, kriteria) is None:
                s.add(BobotSaw(kriteria=kriteria, nilai=nilai))
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
