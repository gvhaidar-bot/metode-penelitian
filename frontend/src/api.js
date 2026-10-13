const API_URL =
  import.meta.env.VITE_API_URL === undefined
    ? "http://localhost:8000"
    : import.meta.env.VITE_API_URL;
const TOKEN_KEY = "rk-token";
const USER_KEY = "rk-user";

export function ambilToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t || t === "undefined" || t === "null") {
    // Bersihkan sisa sesi rusak (mis. dari respons backend yang tidak valid)
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  return t;
}

export function simpanSesi(token, user) {
  if (!token || typeof user !== "object" || !user) {
    throw new Error("Respons backend tidak valid.");
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function ambilUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
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
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Tidak dapat menghubungi backend di " + API_URL + ". " +
      "Jalankan backend (python app.py dari folder backend) lalu muat ulang halaman ini."
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      // Token basi/invalid: bersihkan sesi dan kembalikan ke halaman login.
      hapusSesi();
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
      throw new Error("Sesi berakhir. Silakan masuk lagi.");
    }
    throw new Error(data.detail || "Backend mengembalikan status " + res.status + ".");
  }
  return data;
}

export function getMeta() {
  return panggil("/meta");
}

export function getPekerjaan() {
  return panggil("/pekerjaan");
}

export function getPekerjaanDetail(id) {
  return panggil("/pekerjaan/" + id);
}

export function getLowongan(id) {
  return panggil("/pekerjaan/" + id + "/lowongan");
}

export async function kirimRekomendasi({ skills, minat, top_n = 5 }) {
  return panggil("/rekomendasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills, minat, top_n }),
  });
}

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

/** Verifikasi token yang tersimpan ke backend; null bila tidak valid. */
export async function cekSesi() {
  const data = await panggil("/auth/me");
  return data.user || null;
}
