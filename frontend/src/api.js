const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function panggil(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error(
      "Tidak dapat menghubungi backend di " + API_URL + ". " +
      "Jalankan backend (flask --app app run --debug --port 8000) lalu muat ulang halaman ini."
    );
  }
  if (!res.ok) {
    throw new Error("Backend mengembalikan status " + res.status + ".");
  }
  return res.json();
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

export async function kirimRekomendasi({ skills, minat, top_n = 5 }) {
  const data = await panggil("/rekomendasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills, minat, top_n }),
  });
  return { ...data, sumber: "backend" };
}
