"""Test otomatis backend (pytest): memetakan TC-01..TC-08 dari
docs/rencana-pengujian.md plus pengujian autentikasi.

Jalankan dari folder backend/:
    pytest -q
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as app_module  # noqa: E402

MINAT_LENGKAP = {"Web": 5, "Mobile": 3, "Data & AI": 4,
                 "Infrastruktur & Keamanan": 2, "Desain & Manajemen": 1}


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


# TC-02: tanpa skill
def test_tc02_tanpa_skill(client):
    tok = _token(client)
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


# TC-04: body kosong
def test_tc04_body_kosong(client):
    tok = _token(client)
    r = _rek(client, tok, {})
    assert r.status_code == 200
    assert len(r.get_json()["hasil"]) == 5


# TC-05: GET /pekerjaan
def test_tc05_daftar_pekerjaan(client):
    r = client.get("/pekerjaan")
    assert r.status_code == 200
    data = r.get_json()
    assert len(data) == 10
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
    """{Python, SQL} + minat Data tinggi -> Data Analyst/ML Engineer di top-3."""
    tok = _token(client)
    r = _rek(client, tok, {"skills": ["Python", "SQL"],
                           "minat": {"Data & AI": 5, "Web": 2, "Mobile": 1,
                                     "Infrastruktur & Keamanan": 1,
                                     "Desain & Manajemen": 1}})
    top3 = [h["id"] for h in r.get_json()["hasil"][:3]]
    assert any(i in top3 for i in ("data-analyst", "ml-engineer")), top3


def test_relevansi_html_css_js_frontend_teratas(client):
    r = _rek(client, _token(client),
             {"skills": ["HTML", "CSS", "JavaScript"],
              "minat": {"Web": 5, "Mobile": 2, "Data & AI": 1,
                        "Infrastruktur & Keamanan": 1,
                        "Desain & Manajemen": 2}})
    assert r.get_json()["hasil"][0]["id"] == "frontend-dev"


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
