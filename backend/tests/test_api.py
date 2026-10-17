"""Test otomatis backend (pytest): memetakan TC-01..TC-08 dari
docs/rencana-pengujian.md plus pengujian autentikasi.

Backend wajib membaca dari database, jadi tes memakai database SQLite
sementara (dibuat + di-seed sebelum app diimpor, dihapus setelahnya).

Jalankan dari folder backend/:
    pytest -q
"""
import atexit
import os
import sys
import tempfile

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database tes: SQLite sementara, disiapkan SEBELUM app diimpor
# (app gagal cepat bila DATABASE_URL tidak tersedia).
_DB_TES = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_DB_TES.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_TES.name}"


def _hapus_db_tes():
    try:
        os.unlink(_DB_TES.name)
    except OSError:
        pass


atexit.register(_hapus_db_tes)

import db as db_module  # noqa: E402
from glints import impor_csv_ke_db  # noqa: E402

db_module.seed_dari_json()
impor_csv_ke_db()

import app as app_module  # noqa: E402

MINAT_LENGKAP = ["Data & AI", "Web", "Mobile",
                 "Infrastruktur & Keamanan", "Desain & Manajemen"]


@pytest.fixture()
def client():
    app_module.app.config["TESTING"] = True
    with app_module.app.test_client() as c:
        yield c


def _token(client):
    """Register user acak lalu login; kembalikan token."""
    import uuid
    email = f"t{uuid.uuid4().hex[:8]}@example.com"
    r = client.post("/auth/register",
                    json={"name": "Tester", "email": email,
                          "password": "rahasia1"})
    assert r.status_code == 201, r.get_json()
    return r.get_json()["token"]


def _rek(client, token, body):
    return client.post("/rekomendasi", json=body,
                       headers={"Authorization": f"Bearer {token}"})


# TC-01: input valid
def test_tc01_input_valid(client):
    tok = _token(client)
    r = _rek(client, tok, {"skills": ["Python", "SQL"],
                           "minat": MINAT_LENGKAP, "top_n": 5})
    assert r.status_code == 200
    hasil = r.get_json()["hasil"]
    assert len(hasil) == 5
    skor = [h["skor_akhir"] for h in hasil]
    assert skor == sorted(skor, reverse=True)


# TC-02: tanpa skill dan profil kosong -> 400 dengan pesan jelas
def test_tc02_tanpa_skill(client):
    tok = _token(client)
    r = _rek(client, tok, {"skills": [], "minat": MINAT_LENGKAP})
    assert r.status_code == 400
    assert "skill" in r.get_json()["detail"].lower()


# TC-02b: skill dari profil dipakai bila body tidak mengirim skills
def test_tc02b_skill_dari_profil(client):
    tok = _token(client)
    hdr = {"Authorization": f"Bearer {tok}"}
    r = client.put("/profil", json={"skills": ["Python", "SQL"]}, headers=hdr)
    assert r.status_code == 200
    r = _rek(client, tok, {"skills": [], "minat": MINAT_LENGKAP})
    assert r.status_code == 200
    assert len(r.get_json()["hasil"]) == 5


# TC-03: top_n=3
def test_tc03_top_n_3(client):
    tok = _token(client)
    r = _rek(client, tok, {"skills": ["HTML"], "minat": MINAT_LENGKAP,
                           "top_n": 3})
    assert r.status_code == 200
    assert len(r.get_json()["hasil"]) == 3


# TC-04: body kosong -> 400 (tidak ada skill, tidak ada minat valid)
def test_tc04_body_kosong(client):
    tok = _token(client)
    r = _rek(client, tok, {})
    assert r.status_code == 400


# TC-04b: ranking minat tidak lengkap -> 400
def test_tc04b_minat_tidak_lengkap(client):
    tok = _token(client)
    r = _rek(client, tok, {"skills": ["Python"],
                           "minat": ["Web", "Data & AI"]})
    assert r.status_code == 400
    assert "kategori" in r.get_json()["detail"].lower()


# TC-05: GET /pekerjaan
def test_tc05_daftar_pekerjaan(client):
    r = client.get("/pekerjaan")
    assert r.status_code == 200
    data = r.get_json()
    assert len(data) == 23
    assert all("skills" in p and "roadmap" in p for p in data)


# TC-06: GET /pekerjaan/{id} valid
def test_tc06_detail_valid(client):
    r = client.get("/pekerjaan/data-analyst")
    assert r.status_code == 200
    data = r.get_json()
    assert data["id"] == "data-analyst"
    assert len(data["roadmap"]) == 6


# TC-07: GET /pekerjaan/{id} tidak ada -> 404
def test_tc07_detail_tidak_ada(client):
    r = client.get("/pekerjaan/tidak-ada")
    assert r.status_code == 404


# TC-08: GET /pekerjaan/{id}/roadmap
def test_tc08_roadmap(client):
    r = client.get("/pekerjaan/mobile-dev/roadmap")
    assert r.status_code == 200
    data = r.get_json()
    assert data["id"] == "mobile-dev"
    assert isinstance(data["roadmap"], list) and len(data["roadmap"]) > 0


# Relevansi: skenario sintetis (docs/rencana-pengujian.md bagian B)
def test_relevansi_python_sql_masuk_top3(client):
    """{Python, SQL} + Data & AI peringkat 1 -> karier data di top-3."""
    tok = _token(client)
    r = _rek(client, tok, {"skills": ["Python", "SQL"],
                           "minat": ["Data & AI", "Web", "Mobile",
                                     "Infrastruktur & Keamanan",
                                     "Desain & Manajemen"]})
    top3 = [h["id"] for h in r.get_json()["hasil"][:3]]
    assert any(i in top3 for i in ("data-analyst", "ml-engineer",
                                   "data-scientist", "data-engineer")), top3


def test_relevansi_html_css_js_frontend_teratas(client):
    r = _rek(client, _token(client),
             {"skills": ["HTML", "CSS", "JavaScript"],
              "minat": ["Web", "Mobile", "Data & AI",
                        "Infrastruktur & Keamanan",
                        "Desain & Manajemen"]})
    # Skill web murni: frontend-dev teratas (profilnya paling fokus;
    # tokenisasi membuat "HTML/CSS" cocok dengan "HTML"+"CSS").
    assert r.get_json()["hasil"][0]["id"] in ("frontend-dev", "fullstack-dev")


def test_relevansi_html_css_saja_frontend_teratas(client):
    # Kasus nyata user: skill "HTML/CSS" saja (satu token garis miring),
    # minat Web peringkat 1. Frontend/Fullstack yang relevan harus di atas;
    # Backend tidak boleh menang hanya karena token "HTML/CSS".
    r = _rek(client, _token(client),
             {"skills": ["HTML/CSS"],
              "minat": ["Web", "Mobile", "Data & AI",
                        "Desain & Manajemen",
                        "Infrastruktur & Keamanan"]})
    hasil = r.get_json()["hasil"]
    top2 = [h["id"] for h in hasil[:2]]
    assert "frontend-dev" in top2, top2
    be = next(h for h in hasil if h["id"] == "backend-dev")
    assert be["skor_skill"] == 0.0


# Autentikasi
def test_auth_register_duplikat_ditolak(client):
    import uuid
    email = f"d{uuid.uuid4().hex[:8]}@example.com"
    body = {"name": "A", "email": email, "password": "rahasia1"}
    assert client.post("/auth/register", json=body).status_code == 201
    r = client.post("/auth/register", json=body)
    assert r.status_code == 409


def test_auth_login_salah_ditolak(client):
    tok_body = {"name": "B", "email": "b@example.com", "password": "rahasia1"}
    client.post("/auth/register", json=tok_body)
    r = client.post("/auth/login",
                    json={"email": "b@example.com", "password": "salah"})
    assert r.status_code == 401


def test_auth_rekomendasi_tanpa_token_ditolak(client):
    r = client.post("/rekomendasi", json={"skills": ["Python"]})
    assert r.status_code == 401


def test_auth_me_dan_logout(client):
    tok = _token(client)
    h = {"Authorization": f"Bearer {tok}"}
    assert client.get("/auth/me", headers=h).status_code == 200
    assert client.post("/auth/logout", headers=h).status_code == 200
    assert client.get("/auth/me", headers=h).status_code == 401


def test_auth_logout_tanpa_token_ditolak(client):
    assert client.post("/auth/logout").status_code == 401
    assert client.post("/auth/logout", headers={"Authorization": "Bearer salah"}).status_code == 401


# Lowongan Glints per karier
def test_lowongan_valid(client):
    r = client.get("/pekerjaan/data-analyst/lowongan")
    assert r.status_code == 200
    data = r.get_json()
    assert data["id"] == "data-analyst"
    assert data["total_terpetakan"] > 0
    assert len(data["lowongan"]) <= 5
    for l in data["lowongan"]:
        assert l["judul"] and l["perusahaan"]


def test_lowongan_id_tidak_ada(client):
    assert client.get("/pekerjaan/tidak-ada/lowongan").status_code == 404


# Profil skill
def test_profil_get_put(client):
    tok = _token(client)
    hdr = {"Authorization": f"Bearer {tok}"}
    r = client.get("/profil", headers=hdr)
    assert r.status_code == 200
    assert r.get_json()["skills"] == []
    r = client.put("/profil", json={"skills": ["Python", "SQL", "Python", "  "]}, headers=hdr)
    assert r.status_code == 200
    assert r.get_json()["skills"] == ["Python", "SQL"]


def test_profil_skill_kustom_bebas(client):
    """User boleh mengajukan skill yang tidak ada di daftar master."""
    tok = _token(client)
    hdr = {"Authorization": f"Bearer {tok}"}
    r = client.put("/profil", json={"skills": ["Bahasa Isyarat Robot"]}, headers=hdr)
    assert r.status_code == 200
    assert "Bahasa Isyarat Robot" in r.get_json()["skills"]


def test_profil_tanpa_login_ditolak(client):
    assert client.get("/profil").status_code == 401
    assert client.put("/profil", json={"skills": []}).status_code == 401


# Pencarian skill
def test_skills_cari(client):
    r = client.get("/skills?q=pyth")
    assert r.status_code == 200
    data = r.get_json()
    assert "Python" in data["skills"]
    assert data["jumlah"] < client.get("/skills").get_json()["jumlah"]


# Quest roadmap
def test_quest_toggle_dan_progress(client):
    tok = _token(client)
    hdr = {"Authorization": f"Bearer {tok}"}
    r = client.post("/quest", json={"karier_id": "data-analyst", "langkah": 0,
                                    "selesai": True}, headers=hdr)
    assert r.status_code == 200
    r = client.get("/quest", headers=hdr)
    q = r.get_json()["data-analyst"]
    assert q["selesai"] == [0]
    assert q["total"] == 6 and q["persen"] == 17
    r = client.post("/quest", json={"karier_id": "data-analyst", "langkah": 0,
                                    "selesai": False}, headers=hdr)
    assert r.status_code == 200
    assert client.get("/quest", headers=hdr).get_json()["data-analyst"]["selesai"] == []


def test_quest_validasi(client):
    tok = _token(client)
    hdr = {"Authorization": f"Bearer {tok}"}
    assert client.post("/quest", json={"karier_id": "tidak-ada", "langkah": 0,
                                       "selesai": True}, headers=hdr).status_code == 404
    assert client.post("/quest", json={"karier_id": "data-analyst", "langkah": 99,
                                       "selesai": True}, headers=hdr).status_code == 400
    assert client.get("/quest").status_code == 401


# Riwayat server-side
def test_riwayat_tersimpan_per_akun(client):
    tok = _token(client)
    r = _rek(client, tok, {"skills": ["Python", "SQL"], "minat": MINAT_LENGKAP})
    assert r.status_code == 200
    hdr = {"Authorization": f"Bearer {tok}"}
    r = client.get("/riwayat", headers=hdr)
    assert r.status_code == 200
    riw = r.get_json()["riwayat"]
    assert len(riw) == 1
    assert riw[0]["hasil"][0]["id"] in ("data-analyst", "ml-engineer",
                                          "data-engineer", "data-scientist")
    assert client.get("/riwayat").status_code == 401


# ROC: ranking minat tanpa angka -> bobot valid
def test_roc_bobot_total_satu():
    w = app_module.bobot_roc(["a", "b", "c", "d", "e"])
    assert abs(sum(w.values()) - 1.0) < 1e-9
    assert w["a"] > w["b"] > w["c"] > w["d"] > w["e"]
    assert abs(w["a"] - 0.4567) < 0.001


def test_roc_mempengaruhi_ranking(client):
    """Minat Data peringkat 1 vs Web peringkat 1 memberi hasil berbeda."""
    tok = _token(client)
    r1 = _rek(client, tok, {"skills": ["Python"],
                            "minat": ["Data & AI", "Web", "Mobile",
                                      "Infrastruktur & Keamanan",
                                      "Desain & Manajemen"]})
    r2 = _rek(client, tok, {"skills": ["Python"],
                            "minat": ["Web", "Data & AI", "Mobile",
                                      "Infrastruktur & Keamanan",
                                      "Desain & Manajemen"]})
    assert r1.get_json()["hasil"][0]["id"] != r2.get_json()["hasil"][0]["id"]
