// Klien API. Mencoba backend Flask dulu (VITE_API_URL atau localhost:8000),
// kalau tidak terjangkau otomatis memakai mesin lokal (mode demo) supaya
// UI tetap bisa didemokan tanpa backend.

import { hitungRekomendasi } from "./lib/rekomendasi.js";
import { PEKERJAAN } from "./data/pekerjaan.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function cobaFetch(path, options) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getPekerjaan() {
  try {
    return await cobaFetch("/pekerjaan");
  } catch {
    return PEKERJAAN;
  }
}

export async function getPekerjaanDetail(id) {
  try {
    return await cobaFetch(`/pekerjaan/${id}`);
  } catch {
    return PEKERJAAN.find((p) => p.id === id) || null;
  }
}

export async function kirimRekomendasi({ skills, minat, top_n = 5 }) {
  try {
    const data = await cobaFetch("/rekomendasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills, minat, top_n }),
    });
    return { ...data, sumber: "backend" };
  } catch {
    return hitungRekomendasi(skills, minat, top_n);
  }
}
