// Analisis audio (Tugas B): kirim rekaman ke backend (/voice/analyze),
// lalu ubah hasilnya menjadi balasan yang rapi dan mudah dimengerti pengguna awam.
//
// Dipakai bersama oleh halaman chatbot dan widget supaya isinya sama.
// Balasan berupa teks dengan format ringan (judul "###", tebal "**", kutipan ">", daftar "-",
// dan tautan "[teks](alamat)"). Tampilannya digambar oleh komponen PesanSuara.tsx.
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
    modus?: string;
    alasan?: string;
    bukti?: { kutipan: string }[];
  };
  rekomendasi_materi?: MateriRekomendasi[];
}

// Proses pertama bisa 15-30 detik (memuat model + Gemini), jadi batasnya dibuat longgar
const BATAS_WAKTU_MS = 120_000;
const MAKS_KUTIPAN = 3;
const MAKS_HURUF_KUTIPAN = 160;
const KODE_SUARA_AI = "ai-attack:2"; // materi Voice Cloning (ditambahkan otomatis jika suara buatan AI)

// Judul ini menjadi penanda bahwa sebuah pesan adalah hasil analisis suara.
// Chatbot dan widget memakainya untuk memilih tampilan yang tepat.
export const PENANDA_BALASAN_SUARA = "### 🎙️ Hasil Analisis Rekaman";

export function adalahBalasanSuara(teks: string): boolean {
  return typeof teks === "string" && teks.trimStart().startsWith(PENANDA_BALASAN_SUARA);
}

/** Alamat halaman materi. Contoh: /pembelajaran/scam-online?step=topic-2 */
export function tautanMateri(m: MateriRekomendasi): string | null {
  if (!/^[a-z0-9-]+$/.test(m.slug) || !Number.isInteger(m.nomor_topik)) return null;
  return `/pembelajaran/${m.slug}?step=topic-${m.nomor_topik}`;
}

// Teks dari AI/transkrip dibersihkan dulu supaya tidak bisa menyelipkan format
// (tebal, tautan, daftar) atau tautan berbahaya ke dalam balasan.
function bersihkan(teks: unknown, maks = 0): string {
  let t = String(teks ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[*_`\[\]<>\\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  t = t.replace(/^([#>+-]|\d+[.)])\s*/, ""); // jangan diawali penanda judul/daftar
  if (maks > 0 && t.length > maks) t = t.slice(0, maks).replace(/\s+\S*$/, "") + "…";
  return t;
}

// Pecah beberapa kalimat menjadi daftar (tidak memecah angka seperti "Rp 50.000")
function pecahKalimat(teks: string): string[] {
  const bagian = teks.split(/([.!?])\s+(?=[A-Z"“])/);
  const hasil: string[] = [];
  for (let i = 0; i < bagian.length; i += 2) {
    const kalimat = (bagian[i] + (bagian[i + 1] ?? "")).trim();
    if (kalimat) hasil.push(kalimat);
  }
  return hasil;
}

// Jenis penipuan diambil dari materi paling cocok (selain materi Voice Cloning tambahan)
function pilihJenis(materi: MateriRekomendasi[]): { nama: string; kelompok: string } | null {
  const m = materi.find(x => x.kode !== KODE_SUARA_AI);
  if (!m) return null;
  const umum = m.topik.includes("?"); // mis. "Apa itu Scam Online?" -> pakai nama materinya saja
  const nama = umum ? m.judul : m.topik;
  return { nama, kelompok: umum || m.topik === m.judul ? "" : m.judul };
}

export function susunBalasan(h: HasilAnalisisAudio): string {
  const bagian: string[] = [PENANDA_BALASAN_SUARA];
  const isiAda = !!h.isi?.tersedia;
  const label = h.isi?.label;
  const berisiko = isiAda && label !== "aman";
  const suaraAI = !!h.suara?.tersedia && h.suara.label === "sintetis";
  const materi = h.rekomendasi_materi ?? [];

  // 1. Kesimpulan singkat + jenis penipuan + penjelasan
  if (isiAda) {
    if (label === "penipuan") bagian.push("**⚠️ Rekaman ini terindikasi penipuan**");
    else if (berisiko) bagian.push("**⚠️ Rekaman ini mencurigakan, harap berhati-hati**");
    else bagian.push("**✅ Isi rekaman tampak wajar**");

    if (berisiko) {
      const jenis = pilihJenis(materi);
      const modus = bersihkan(h.isi.modus, 120);
      const modusAda = modus !== "" && !/^tidak ada/i.test(modus);
      if (jenis) {
        const kelompok = jenis.kelompok ? ` (masuk kelompok _${bersihkan(jenis.kelompok)}_)` : "";
        bagian.push(
          label === "penipuan"
            ? `Sepertinya isi rekaman ini adalah penipuan jenis **${bersihkan(jenis.nama)}**${kelompok}.`
            : `Pola percakapan ini mirip dengan penipuan jenis **${bersihkan(jenis.nama)}**${kelompok}.`
        );
      } else if (modusAda) {
        bagian.push(`Modus yang terlihat: **${modus}**.`);
      }
    }

    const cadangan = berisiko
      ? "Percakapan dalam rekaman ini mengandung tanda-tanda penipuan."
      : "Percakapan dalam rekaman ini tampak wajar.";
    bagian.push(bersihkan(h.isi.alasan) || cadangan);

    const kutipan = (h.isi.bukti ?? [])
      .map(b => bersihkan(b?.kutipan, MAKS_HURUF_KUTIPAN).replace(/["“”]/g, "'"))
      .filter(Boolean)
      .slice(0, MAKS_KUTIPAN);
    if (berisiko && kutipan.length > 0) {
      bagian.push(
        "**🔎 Kalimat yang patut diwaspadai**\n" + kutipan.map(k => `> "${k}"`).join("\n")
      );
    }
  } else {
    bagian.push("**ℹ️ Isi rekaman belum bisa dianalisis**");
    bagian.push(
      "Isi percakapan dalam rekaman ini belum bisa dianalisis saat ini. " +
        "Silakan coba lagi nanti, atau gunakan rekaman dengan suara yang lebih jelas."
    );
  }

  // 2. Suara buatan AI (tanpa angka)
  if (suaraAI) {
    bagian.push(
      "**🤖 Suara terindikasi buatan AI**\n" +
        (berisiko
          ? "Suara ini kemungkinan bukan manusia asli, misalnya suara tiruan (voice cloning). " +
            "Ini baru indikasi dan bisa keliru, jadi pastikan dulu siapa yang sebenarnya berbicara sebelum memberikan data pribadi atau uang."
          : "Suara ini terdengar seperti buatan AI. Itu belum tentu berbahaya karena banyak layanan resmi memakai suara AI, " +
            "dan hasil ini baru indikasi yang bisa keliru. Tetap pastikan siapa yang berbicara sebelum membagikan data pribadi atau uang.")
    );
  }

  // 3. Saran tindakan
  const saran = bersihkan(h.saran);
  if (saran) {
    const langkah = pecahKalimat(saran);
    bagian.push(
      "**💡 Yang sebaiknya Anda lakukan**\n" +
        (langkah.length >= 2 ? langkah.map(s => `- ${s}`).join("\n") : saran)
    );
  }

  // 4. Materi pembelajaran (berupa tautan yang bisa diklik)
  const daftarMateri = materi
    .map(m => ({ m, url: tautanMateri(m) }))
    .filter(x => x.url !== null)
    .map(({ m, url }) => `- [${m.topik}](${url}) · ${m.judul}`);
  if (daftarMateri.length > 0) {
    const pengantar = berisiko
      ? "Ingin paham lebih dalam tentang penipuan seperti ini? Klik materi di bawah (terbuka di tab baru):"
      : "Ingin tahu lebih banyak? Klik materi di bawah (terbuka di tab baru):";
    bagian.push(
      "**📚 Pelajari lebih lanjut**\n" +
        pengantar + "\n\n" +
        daftarMateri.join("\n") + "\n\n" +
        "_Materi dipelajari berurutan, jadi tautan akan membuka bagian terdekat yang sudah bisa Anda akses._"
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