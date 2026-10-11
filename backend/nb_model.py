"""Naive Bayes (varian Bernoulli) sebagai METODE PEMBANDING rekomendasi karier.

Tiap karier = satu kelas; tiap skill = satu ciri biner (ada / tidak ada di
profil karier). Model "dilatih" dari profil karier yang sama dengan yang
dipakai CBF+SAW, lalu menghitung P(karier | skill_user) untuk perangkingan.

PERAN: murni pembanding untuk uji konsistensi (lihat
docs/rencana-pengujian.md bagian B) — BUKAN pengganti sistem utama
CBF+SAW, dan BUKAN klaim superioritas.
"""

import math

ALPHA = 1.0  # Laplace smoothing agar probabilitas tak pernah nol


def latih(pekerjaan, normalisasi):
    """Bangun model dari daftar profil pekerjaan.

    normalisasi: fungsi penyama teks skill (dipakai bersama dengan app.py
    agar kosakata konsisten dengan perhitungan CBF).
    """
    kosakata = sorted({normalisasi(s) for j in pekerjaan for s in j["skills"]})
    n_kelas = len(pekerjaan)
    model = {
        "kosakata": kosakata,
        "prior_log": math.log(1.0 / n_kelas),  # prior seragam
        "kelas": [],
    }
    for j in pekerjaan:
        punya = {normalisasi(s) for s in j["skills"]}
        # Tiap karier = 1 "dokumen latih": count = 1 bila skill ada di
        # profil, 0 bila tidak. Laplace: P = (count + alpha) / (1 + 2*alpha).
        p_hadir = {}
        for s in kosakata:
            c = 1 if s in punya else 0
            p_hadir[s] = (c + ALPHA) / (1.0 + 2.0 * ALPHA)
        model["kelas"].append({"id": j["id"], "nama": j["nama"], "p_hadir": p_hadir})
    return model


def prediksi(model, skill_user):
    """Ranking karier berdasarkan P(karier | skill_user), menurun.

    skill_user: himpunan skill yang sudah dinormalisasi.
    Mengembalikan list {id, nama, probabilitas}.
    """
    hasil = []
    for k in model["kelas"]:
        logp = model["prior_log"]
        for s in model["kosakata"]:
            p = k["p_hadir"][s]
            logp += math.log(p) if s in skill_user else math.log(1.0 - p)
        hasil.append({"id": k["id"], "nama": k["nama"], "log_prob": logp})
    # Softmax agar terbaca sebagai probabilitas (jumlah = 1).
    maks = max(h["log_prob"] for h in hasil)
    exps = [math.exp(h["log_prob"] - maks) for h in hasil]
    total = sum(exps)
    for h, e in zip(hasil, exps):
        h["probabilitas"] = round(e / total, 4)
        del h["log_prob"]
    hasil.sort(key=lambda h: h["probabilitas"], reverse=True)
    return hasil
