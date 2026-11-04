// Analisis audio (Tugas B): kirim rekaman ke backend (/voice/analyze),
// lalu ubah hasilnya menjadi teks yang mudah dimengerti pengguna.
//
// Dipakai bersama oleh halaman chatbot dan widget supaya tampilannya sama.
// Hasilnya berupa TEKS BIASA (emoji + baris baru) karena widget tidak merender markdown.
//
// Yang sengaja TIDAK ditampilkan ke pengguna: skor suara, detik, dan label teknis.

export interface MateriRekomendasi {
  kode: string;
  slug: string;
  judul: string;
  topik: string;
  nomor_topik: number;
}

export interface HasilAnalisisAudio {
  tingkat_risiko: string;
  saran: string;
  suara: { tersedia: boolean; label?: string };
  isi: {
    tersedia: boolean;
    label?: string;
    alasan?: string;
    bukti?: { kutipan: string }[];
  };
  rekomendasi_materi?: MateriRekomendasi[];
}

// Proses pertama bisa 15-30 detik (memuat model + Gemini), jadi batasnya dibuat longgar
const BATAS_WAKTU_MS = 120_000;
const MAKS_KUTIPAN = 3;

export function susunBalasan(h: HasilAnalisisAudio): string {
  const bagian: string[] = [];
  const isiAda = !!h.isi?.tersedia;
  const berisiko = isiAda && h.isi.label !== "aman";
  const suaraAI = !!h.suara?.tersedia && h.suara.label === "sintetis";

  // 1. Penjelasan isi percakapan (bahasa sehari-hari dari Gemini)
  if (isiAda) {
    const cadangan = berisiko
      ? "Percakapan dalam rekaman ini mengandung tanda-tanda penipuan."
      : "Percakapan dalam rekaman ini tampak wajar.";
    bagian.push(`${berisiko ? "⚠️" : "✅"} ${h.isi.alasan?.trim() || cadangan}`);

    const kutipan = (h.isi.bukti ?? []).slice(0, MAKS_KUTIPAN);
    if (berisiko && kutipan.length > 0) {
      bagian.push(
        "🔎 Kalimat yang patut diwaspadai:\n" +
          kutipan.map(b => `• "${b.kutipan}"`).join("\n")
      );
    }
  } else {
    bagian.push("ℹ️ Isi percakapan dalam rekaman ini belum bisa dianalisis saat ini.");
  }

  // 2. Suara buatan AI (hanya dijelaskan jika terindikasi, tanpa angka)
  if (suaraAI) {
    bagian.push(
      "🤖 Suara dalam rekaman ini terindikasi buatan AI, bukan suara manusia asli. " +
        "Hati-hati bila penelepon meminta data pribadi atau uang, dan pastikan dulu siapa yang sebenarnya berbicara."
    );
  }

  // 3. Saran tindakan
  if (h.saran?.trim()) {
    bagian.push(`💡 Yang sebaiknya dilakukan:\n${h.saran.trim()}`);
  }

  // 4. Materi pembelajaran yang cocok dengan isi rekaman
  const materi = h.rekomendasi_materi ?? [];
  if (materi.length > 0) {
    bagian.push(
      "📚 Materi yang bisa Anda pelajari di menu Pembelajaran:\n" +
        materi.map(m => `• ${m.judul}: ${m.topik}`).join("\n")
    );
  }

  return bagian.join("\n\n");
}

/** Kirim file audio ke backend dan kembalikan teks balasan siap tampil (tidak pernah melempar error). */
export async function analisisSuara(file: File): Promise<string> {
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), BATAS_WAKTU_MS);
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/analyze`, {
      method: "POST",
      body: form,
      signal: kontrol.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const pesan = typeof data.detail === "string" ? data.detail : "Gagal menganalisis audio.";
      return `⚠️ ${pesan}`;
    }
    return susunBalasan(data.hasil as HasilAnalisisAudio);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return "⚠️ Analisis memakan waktu terlalu lama. Coba lagi dengan rekaman yang lebih pendek.";
    }
    return "⚠️ Tidak dapat terhubung ke server. Pastikan backend aktif.";
  } finally {
    clearTimeout(timer);
  }
}