/* Lapisan akses API backend KarierKu Informatika. */

const API_URL =
  import.meta.env.VITE_API_URL === undefined
    ? "http://localhost:8000"
    : import.meta.env.VITE_API_URL;

const TOKEN_KEY = "kk-token";
const USER_KEY = "kk-user";

export function ambilToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t || t === "undefined" || t === "null") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  return t;
}

export function ambilUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function simpanSesi(token, user) {
  if (!token || typeof user !== "object" || !user) {
    throw new Error("Respons backend tidak valid.");
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function hapusSesi() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function panggil(path, options = {}) {
  const token = ambilToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = "Bearer " + token;
  let res;
  try {
    res = await fetch(API_URL + path, { ...options, headers });
  } catch {
    throw new Error(
      "Tidak dapat menghubungi server. Periksa koneksi lalu muat ulang halaman ini."
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      hapusSesi();
      if (window.location.pathname !== "/masuk") {
        window.location.href = "/masuk";
      }
      throw new Error("Sesi berakhir. Silakan masuk lagi.");
    }
    throw new Error(data.detail || "Server mengembalikan status " + res.status + ".");
  }
  return data;
}

/* Autentikasi */

export async function daftarAkun({ name, email, password }) {
  const data = await panggil("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  simpanSesi(data.token, data.user);
  return data.user;
}

export async function masukAkun({ email, password }) {
  const data = await panggil("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  simpanSesi(data.token, data.user);
  return data.user;
}

export async function keluarAkun() {
  try {
    await panggil("/auth/logout", { method: "POST" });
  } catch {
    /* abaikan: token kedaluwarsa tetap dibersihkan lokal */
  }
  hapusSesi();
}

/** Verifikasi token tersimpan ke server. Null bila tidak ada sesi. */
export async function cekSesi() {
  if (!ambilToken()) return null;
  const data = await panggil("/auth/me");
  return data.user || null;
}

/* Data master */

export function getMeta() {
  return panggil("/meta");
}

export function cariSkills(q) {
  return panggil("/skills?q=" + encodeURIComponent(q || ""));
}

/* Profil skill */

export function getProfil() {
  return panggil("/profil");
}

export function simpanProfil(skills) {
  return panggil("/profil", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills }),
  });
}

/* Pekerjaan dan lowongan */

export function getPekerjaan() {
  return panggil("/pekerjaan");
}

export function getLowongan(id) {
  return panggil("/pekerjaan/" + id + "/lowongan");
}

/* Rekomendasi */

export function hitungRekomendasi({ skills, minat, top_n = 5 }) {
  return panggil("/rekomendasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills, minat, top_n }),
  });
}

/* Quest roadmap */

export function getQuest() {
  return panggil("/quest");
}

export function setQuest(karier_id, langkah, selesai) {
  return panggil("/quest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ karier_id, langkah, selesai }),
  });
}

/* Riwayat */

export function getRiwayat() {
  return panggil("/riwayat");
}
