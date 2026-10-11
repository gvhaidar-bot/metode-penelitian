"""Metrik perbandingan dua daftar peringkat (uji konsistensi metode).

Dipakai oleh endpoint POST /bandingkan untuk membandingkan ranking
CBF+SAW vs Naive Bayes. Tidak butuh scipy — dihitung manual.
"""

import math


def overlap_at_k(ranking_a, ranking_b, k):
    """Proporsi id yang sama-sama muncul di top-k kedua ranking (0..1)."""
    a = {x["id"] for x in ranking_a[:k]}
    b = {x["id"] for x in ranking_b[:k]}
    return round(len(a & b) / k, 4)


def _peringkat(ranking):
    return {x["id"]: i + 1 for i, x in enumerate(ranking)}


def spearman_rho(ranking_a, ranking_b):
    """Korelasi Spearman antara dua peringkat lengkap (-1..1)."""
    ra, rb = _peringkat(ranking_a), _peringkat(ranking_b)
    ids = list(ra)
    n = len(ids)
    xa = [ra[i] for i in ids]
    xb = [rb[i] for i in ids]
    ma, mb = sum(xa) / n, sum(xb) / n
    pembilang = sum((a - ma) * (b - mb) for a, b in zip(xa, xb))
    da = sum((a - ma) ** 2 for a in xa)
    db = sum((b - mb) ** 2 for b in xb)
    if da == 0 or db == 0:
        return 0.0
    return round(pembilang / math.sqrt(da * db), 4)


def kendall_tau(ranking_a, ranking_b):
    """Kendall's tau antara dua peringkat lengkap (-1..1)."""
    ra, rb = _peringkat(ranking_a), _peringkat(ranking_b)
    ids = list(ra)
    concord = discord = 0
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            s = (ra[ids[i]] - ra[ids[j]]) * (rb[ids[i]] - rb[ids[j]])
            if s > 0:
                concord += 1
            elif s < 0:
                discord += 1
    total = concord + discord
    return round((concord - discord) / total, 4) if total else 0.0
