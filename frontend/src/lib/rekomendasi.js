// Mesin rekomendasi sisi klien (mode demo/offline).
// Logikanya sama persis dengan backend/main.py:
//   1. Content-Based Filtering + Cosine Similarity -> kecocokan skill
//   2. SAW -> skor akhir dari skill, minat, gaji, demand.
// Dipakai otomatis oleh api.js ketika backend Flask tidak terjangkau.

import { PEKERJAAN } from "../data/pekerjaan.js";

const BOBOT = { skill: 0.45, minat: 0.25, gaji: 0.15, demand: 0.15 };
const MAX_GAJI = Math.max(...PEKERJAAN.map((p) => p.gaji_max));

const norm = (s) => s.trim().toLowerCase();

function cosineSimilarity(skillUser, skillJob) {
  if (skillUser.size === 0 || skillJob.size === 0) return 0;
  let irisan = 0;
  for (const s of skillUser) if (skillJob.has(s)) irisan++;
  return irisan / (Math.sqrt(skillUser.size) * Math.sqrt(skillJob.size));
}

export function hitungRekomendasi(skills, minat = {}, topN = 5) {
  const skillUser = new Set(skills.map(norm).filter(Boolean));

  const hasil = PEKERJAAN.map((job) => {
    const skillsJob = new Set(job.skills.map(norm));

    const skorSkill = cosineSimilarity(skillUser, skillsJob);
    const skorMinat = (minat[job.kategori] ?? 3) / 5;
    const skorGaji = job.gaji_max / MAX_GAJI;
    const skorDemand = job.demand / 5;

    const skorAkhir =
      BOBOT.skill * skorSkill +
      BOBOT.minat * skorMinat +
      BOBOT.gaji * skorGaji +
      BOBOT.demand * skorDemand;

    const cocok = [...skillUser].filter((s) => skillsJob.has(s));
    const kurang = [...skillsJob].filter((s) => !skillUser.has(s));

    return {
      id: job.id,
      nama: job.nama,
      kategori: job.kategori,
      skor_akhir: +skorAkhir.toFixed(4),
      skor_skill: +skorSkill.toFixed(4),
      skor_minat: +skorMinat.toFixed(4),
      skor_gaji: +skorGaji.toFixed(4),
      skor_demand: +skorDemand.toFixed(4),
      gaji_min: job.gaji_min,
      gaji_max: job.gaji_max,
      demand: job.demand,
      skills_cocok: cocok,
      skills_kurang: kurang,
    };
  });

  hasil.sort((a, b) => b.skor_akhir - a.skor_akhir);
  return { hasil: hasil.slice(0, topN), metode: "Content-Based Filtering + Cosine Similarity + SAW", sumber: "lokal (demo)" };
}
