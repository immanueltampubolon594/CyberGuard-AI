import type { ModuleQuiz } from "./types";

// Soal materi AI Cyber Attack (slug: ai-attack).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada ai-attack.json (Topik 00 sampai 04).
export const aiAttackQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "ai-1",
      type: "single",
      prompt: "Menurut peringatan FBI (Desember 2024), dalam bentuk apa saja penjahat memakai AI generatif untuk penipuan?",
      options: [
        "Hanya teks, karena AI belum bisa meniru suara",
        "Hanya video, untuk membuat film palsu",
        "Teks, gambar, audio, dan video",
        "Hanya untuk meretas server bank secara langsung",
      ],
      correct: 2,
      explanation:
        "FBI menyebut empat bentuk: teks (pesan dan profil palsu), gambar (foto profil dan dokumen palsu), audio (suara kerabat tiruan), dan video (panggilan video palsu).",
      concept: "Bentuk Serangan AI",
      conceptNote:
        "AI generatif dipakai dalam teks, gambar, audio, dan video (lihat Topik 00 · Evolusi Ancaman: Dari Skrip Statis ke Generative AI).",
    },
    {
      id: "ai-2",
      type: "scenario",
      prompt: "Studi kasus: Ibumu menerima telepon berikut dari nomor tak dikenal. Suaranya mirip sekali dengan suaramu. Apa yang paling tepat dilakukan Ibu?",
      message: {
        sender: "Nomor tidak dikenal",
        time: "Hari ini, 21.40",
        lines: [
          "\"Bu, ini aku. HP-ku rusak, ini pinjam HP teman.\"",
          "\"Aku kena masalah, butuh Rp5 juta sekarang juga.\"",
          "\"Tolong transfer ke rekening temanku ya, jangan bilang siapa-siapa.\"",
        ],
      },
      options: [
        "Segera transfer karena suaranya jelas suara anaknya",
        "Transfer setengahnya dulu sambil menunggu kabar",
        "Mengirim foto KTP agar penelepon percaya",
        "Menanyakan kata rahasia keluarga, lalu menutup telepon dan menelepon balik nomor anaknya yang tersimpan",
      ],
      correct: 3,
      explanation:
        "Suara bisa ditiru dengan voice cloning. FBI menyarankan kata atau frasa rahasia keluarga dan menelepon balik lewat nomor yang sudah dikenal. Permintaan untuk merahasiakan adalah tanda bahaya.",
      concept: "Verifikasi Lewat Jalur Lain",
      conceptNote:
        "Suara dan wajah bukan bukti identitas; verifikasi lewat jalur lain (lihat Topik 00 · Prinsip Pertahanan: Verifikasi Lewat Jalur Lain).",
    },
    {
      id: "ai-3",
      type: "single",
      prompt:
        "Benar atau salah: Dalam laporan Februari 2024, Microsoft dan OpenAI menyatakan belum melihat teknik serangan AI yang benar-benar baru dari kelompok peretas negara; AI lebih banyak dipakai sebagai alat produktivitas.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Microsoft dan OpenAI menyebut kelompok tersebut memakai AI untuk riset, menulis skrip, dan menyusun email phishing, tetapi belum ditemukan teknik serangan yang benar-benar baru.",
      concept: "AI sebagai Alat Produktivitas",
      conceptNote:
        "Awalnya AI mempercepat pekerjaan yang sudah dikenal (lihat Topik 00 · Empat Wajah Serangan Berbasis AI).",
    },
    {
      id: "ai-4",
      type: "multi_select",
      prompt: "Mana saja langkah pertahanan yang disarankan materi untuk menghadapi penipuan berbasis AI? Pilih semua yang benar.",
      options: [
        "Menyepakati kata atau frasa rahasia dengan keluarga",
        "Menghubungi balik orang atau lembaga lewat nomor yang dicari sendiri",
        "Percaya pada video atau suara selama terlihat dan terdengar asli",
        "Membatasi foto dan rekaman suara yang dibagikan secara publik",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Kata rahasia membantu memastikan identitas saat ada telepon darurat.",
        "Benar. Menelepon balik lewat nomor resmi adalah salah satu langkah utama dari FBI.",
        "Salah. Suara, wajah, dan tulisan kini bisa dipalsukan dengan AI, jadi tidak boleh dijadikan bukti.",
        "Benar. Semakin sedikit bahan publik, semakin sulit pelaku membuat tiruan.",
      ],
      concept: "Prinsip Pertahanan",
      conceptNote:
        "Kata rahasia, telepon balik, dan batasi jejak publik (lihat Topik 00 · Prinsip Pertahanan: Verifikasi Lewat Jalur Lain).",
    },
    {
      id: "ai-5",
      type: "single",
      prompt: "Apa yang membuat WormGPT (dilaporkan SlashNext, Juli 2023) berbahaya?",
      options: [
        "Alat ini dipakai polisi untuk melacak penipu",
        "Alat ini dipromosikan sebagai alternatif 'blackhat' tanpa batasan etika untuk membuat email phishing dan BEC yang meyakinkan",
        "Alat ini hanya bisa dipakai oleh peretas negara yang sangat ahli",
        "Alat ini menghapus semua email penipuan dari kotak masuk",
      ],
      correct: 1,
      explanation:
        "WormGPT dibangun di atas model GPT-J dan diiklankan untuk phishing serta Business Email Compromise. Alat seperti ini membuat pelaku pemula bisa membuat email penipuan yang rapi dalam jumlah besar.",
      concept: "Alat AI untuk Kejahatan",
      conceptNote:
        "AI menurunkan hambatan bagi pelaku pemula (lihat Topik 00 · studi kasus WormGPT).",
    },
    {
      id: "ai-6",
      type: "single",
      prompt: "Dalam studi Heiding, Schneier, dkk., berapa persen peserta yang mengklik email spear phishing yang sepenuhnya dibuat AI?",
      options: [
        "Hanya 1%, karena AI mudah dikenali",
        "12%, sama dengan email phishing biasa",
        "100% peserta",
        "54%, setara dengan email buatan pakar manusia",
      ],
      correct: 3,
      explanation:
        "Email AI penuh diklik 54% peserta, sama dengan email buatan pakar (54%), sedangkan email phishing biasa hanya 12%. Email AI yang diperiksa manusia mencapai 56%.",
      concept: "Efektivitas AI Phishing",
      conceptNote:
        "AI kini mampu membuat phishing setara pakar (lihat Topik 01 · Evolusi Phishing: Dari Template ke Generative AI).",
    },
    {
      id: "ai-7",
      type: "scenario",
      prompt: "Studi kasus: Kakakmu menerima email kantor berikut. Bahasanya sangat rapi dan menyebut jabatannya dengan tepat. Apa langkah terbaik?",
      message: {
        sender: "HR Department <hr@kantor-portal-karyawan.com>",
        time: "Senin, 08.05",
        lines: [
          "Yth. Bapak Rian, Supervisor Keuangan,",
          "Sehubungan dengan pembaruan sistem penggajian, mohon verifikasi akun Anda hari ini.",
          "Silakan masuk melalui tautan berikut: portal-gaji-karyawan.com/login",
        ],
      },
      options: [
        "Tidak mengklik tautan; mengecek domain pengirim dan mengonfirmasi ke HR lewat nomor atau kanal internal resmi",
        "Langsung login karena bahasanya rapi dan menyebut jabatannya",
        "Membalas email untuk menanyakan apakah email itu asli",
        "Meneruskan email ke rekan kerja agar mereka juga verifikasi",
      ],
      correct: 0,
      explanation:
        "AI bisa membuat email yang rapi dan personal. Fokuslah pada isi permintaan: ada tautan login dan domain yang bukan domain kantor. Konfirmasi lewat saluran resmi, bukan dengan membalas email.",
      concept: "Rapi Bukan Jaminan",
      conceptNote:
        "Periksa isi permintaan dan domain, bukan gaya bahasa (lihat Topik 01 · Tanda Bahaya Baru: Tata Bahasa Rapi Bukan Lagi Jaminan).",
    },
    {
      id: "ai-8",
      type: "multi_select",
      prompt: "Mana saja yang merupakan tanda bahaya pesan phishing di era AI menurut materi? Pilih semua yang benar.",
      options: [
        "Pesan meminta OTP atau kata sandi",
        "Pesan mendesak agar segera transfer ke rekening baru",
        "Pesan mengajak pindah ke aplikasi chat lain",
        "Pesan ditulis dengan tata bahasa yang rapi",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. Lembaga resmi tidak meminta OTP atau kata sandi lewat pesan.",
        "Benar. Desakan dan rekening baru adalah tanda klasik penipuan.",
        "Benar. Ajakan pindah kanal sering dipakai untuk menjauhkan korban dari pengawasan.",
        "Salah. Tata bahasa rapi bukan tanda bahaya maupun tanda aman; AI dan alat terjemahan bisa membuat pesan penipuan yang rapi.",
      ],
      concept: "Tanda Bahaya Phishing AI",
      conceptNote:
        "Nilai isi permintaannya, bukan kerapian bahasanya (lihat Topik 01 · Tanda Bahaya Baru: Tata Bahasa Rapi Bukan Lagi Jaminan).",
    },
    {
      id: "ai-9",
      type: "scenario",
      prompt: "Studi kasus: Temanmu berkenalan dengan seseorang di media sosial. Setelah dua minggu chat, ia dikirimi pesan berikut. Apa saran terbaik?",
      message: {
        sender: "Clara (kenalan online)",
        time: "Hari ini, 19.12",
        lines: [
          "Aku sudah untung banyak dari platform kripto ini, lho 😊",
          "Daftar saja, nanti customer service-nya bantu 24 jam.",
          "Mulai dari deposit Rp2 juta dulu ya, biar kita bisa sukses bareng.",
        ],
      },
      options: [
        "Mendaftar dengan modal kecil dulu untuk mencoba",
        "Meminta Clara mengirim tangkapan layar keuntungannya",
        "Tidak mengirim uang; ajakan investasi dari kenalan online adalah tanda penipuan, dan legalitas platform perlu dicek di OJK",
        "Bertanya ke chatbot customer service platform apakah aman",
      ],
      correct: 2,
      explanation:
        "AI memungkinkan pelaku melayani banyak korban sekaligus dan memasang chatbot di situs investasi palsu. Tangkapan layar keuntungan mudah dipalsukan, dan chatbot platform palsu tentu akan bilang 'aman'.",
      concept: "AI Chat Scam",
      conceptNote:
        "Kenalan online yang mengajak investasi adalah tanda bahaya (lihat Topik 01 · AI Chat Scam: Chatbot di Balik Penipuan Asmara dan Investasi).",
    },
    {
      id: "ai-10",
      type: "single",
      prompt: "Apa tujuan pelaku dalam modus 'panggilan sunyi' yang dijelaskan Bisnis.com (Januari 2026)?",
      options: [
        "Menguji apakah sinyal telepon korban bagus",
        "Merekam suara korban saat berkata 'halo' untuk dijadikan bahan kloning suara",
        "Menawarkan promo kartu perdana",
        "Memastikan nomor korban sudah terdaftar di operator",
      ],
      correct: 1,
      explanation:
        "Pelaku menelepon lalu diam saja sambil merekam suara korban. Rekaman itu bisa dipakai untuk melatih AI meniru suara korban, lalu dipakai menipu keluarga atau rekannya.",
      concept: "Panggilan Sunyi",
      conceptNote:
        "Rekaman singkat bisa menjadi bahan voice cloning (lihat Topik 02 · Modus di Indonesia: Panggilan Sunyi dan Suara 'Keluarga').",
    },
    {
      id: "ai-11",
      type: "scenario",
      prompt: "Studi kasus: Seorang staf keuangan menerima pesan suara berikut dari nomor baru. Suaranya persis suara direkturnya. Apa yang sebaiknya ia lakukan?",
      message: {
        sender: "Pesan suara (nomor baru)",
        time: "Jumat, 16.45",
        lines: [
          "\"Ini saya, Pak Hendra. Saya sedang rapat penting dan tidak bisa ditelepon.\"",
          "\"Tolong transfer Rp150 juta ke vendor baru sebelum jam lima. Ini rahasia.\"",
          "\"Nomor rekeningnya saya kirim lewat chat.\"",
        ],
      },
      options: [
        "Langsung transfer karena suaranya persis suara direktur",
        "Meminta direktur mengirim ulang pesan suara agar lebih yakin",
        "Transfer dulu, lalu melapor setelah selesai",
        "Menunda transfer, menghubungi direktur lewat nomor yang sudah dikenal, dan mengikuti prosedur persetujuan perusahaan",
      ],
      correct: 3,
      explanation:
        "Suara bisa dikloning, dan pesan suara tambahan tidak membuktikan apa pun. Desakan waktu, kerahasiaan, dan vendor baru adalah tanda bahaya. Verifikasi lewat nomor yang sudah dikenal.",
      concept: "Voice Cloning Atasan",
      conceptNote:
        "Tutup, lalu hubungi balik lewat nomor yang dikenal (lihat Topik 02 · Pertahanan: Kata Sandi Keluarga dan Telepon Balik).",
    },
    {
      id: "ai-12",
      type: "single",
      prompt:
        "Benar atau salah: Dalam kasus Ferrari (Juli 2024), eksekutif yang ditelepon sempat mentransfer dana sebelum akhirnya menyadari suara CEO itu palsu.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Eksekutif tersebut curiga karena intonasi yang terdengar mekanis, lalu menanyakan judul buku yang baru direkomendasikan CEO. Penelepon langsung menutup telepon, dan Ferrari tidak mengalami kerugian.",
      concept: "Pertanyaan Verifikasi",
      conceptNote:
        "Satu pertanyaan pribadi menggagalkan deepfake (lihat Topik 02 · studi kasus Ferrari).",
    },
    {
      id: "ai-13",
      type: "multi_select",
      prompt: "Mana saja langkah yang tepat untuk menghadapi risiko voice cloning? Pilih semua yang benar.",
      options: [
        "Memperhatikan nada, pilihan kata yang aneh, dan jeda atau lag dalam panggilan",
        "Mengunggah sebanyak mungkin pesan suara ke media sosial",
        "Mengumpulkan bukti dan melapor ke polisi jika sudah menjadi korban",
        "Menutup telepon dan menghubungi balik lewat nomor yang tersimpan",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. FBI menyarankan memperhatikan perbedaan nada, pilihan kata, dan jeda yang tidak wajar.",
        "Salah. Rekaman suara publik justru menjadi bahan bagi pelaku untuk membuat suara tiruan.",
        "Benar. Rekaman, tangkapan layar, dan riwayat panggilan membantu proses laporan.",
        "Benar. Menelepon balik lewat nomor yang dikenal memutus kendali pelaku.",
      ],
      concept: "Pertahanan Voice Cloning",
      conceptNote:
        "Waspadai kejanggalan suara dan verifikasi ulang (lihat Topik 02 · Pertahanan: Kata Sandi Keluarga dan Telepon Balik).",
    },
    {
      id: "ai-14",
      type: "single",
      prompt: "Dalam kasus perusahaan energi Inggris (2019) yang tertipu suara tiruan CEO perusahaan induk, apa yang membuat penipuan itu akhirnya terbongkar?",
      options: [
        "Pelaku menelepon lagi untuk ketiga kalinya dari nomor Austria dan 'penggantian dana' yang dijanjikan tidak pernah datang",
        "Bank menolak transfer karena jumlahnya terlalu besar",
        "Suara pelaku sama sekali tidak mirip dengan CEO asli",
        "CEO perusahaan induk sedang berada di kantor yang sama",
      ],
      correct: 0,
      explanation:
        "CEO Inggris sudah mentransfer €220.000, tetapi mulai curiga karena penggantian yang dijanjikan tidak datang, dan telepon ketiga berasal dari nomor Austria. Ia pun menolak membayar lagi.",
      concept: "Kasus Awal Voice Cloning",
      conceptNote:
        "Voice cloning untuk penipuan sudah tercatat sejak 2019 (lihat Topik 02 · Evolusi Voice Cloning: Dari Sampel Panjang ke Zero-Shot).",
    },
    {
      id: "ai-15",
      type: "scenario",
      prompt: "Studi kasus: Pamanmu sering video call dengan kenalan online yang wajahnya terlihat nyata. Kini ia menerima pesan berikut. Apa saran terbaik?",
      message: {
        sender: "Mei Lin",
        time: "Hari ini, 22.30",
        lines: [
          "Sayang, kan kita sudah video call berkali-kali, kamu tahu aku nyata 🥰",
          "Dana investasimu di platform itu harus ditambah Rp10 juta",
          "supaya keuntunganmu bisa ditarik. Cepat ya!",
        ],
      },
      options: [
        "Menambah dana karena wajahnya sudah terlihat di video call",
        "Meminta video call sekali lagi untuk memastikan",
        "Berhenti mengirim uang; video bisa dipalsukan dengan deepfake, dan dana yang 'tidak bisa ditarik' adalah tanda penipuan",
        "Mentransfer setengahnya dulu",
      ],
      correct: 2,
      explanation:
        "Seperti sindikat di Hong Kong (2024), pelaku memakai deepfake agar korban yakin kenalannya nyata. Permintaan setoran tambahan agar 'keuntungan bisa ditarik' adalah tanda klasik penipuan investasi.",
      concept: "Deepfake dalam Penipuan Asmara",
      conceptNote:
        "Wajah di layar bukan bukti identitas (lihat Topik 03 · Cara Mengenali Video Palsu).",
    },
    {
      id: "ai-16",
      type: "single",
      prompt: "Menurut FBI, kejanggalan apa yang bisa menjadi petunjuk sebuah video atau gambar dibuat dengan AI?",
      options: [
        "Video yang direkam di luar ruangan",
        "Video dengan resolusi tinggi",
        "Video yang memakai bahasa Indonesia",
        "Tangan atau gigi yang aneh, bayangan tidak konsisten, lag, dan gerakan tidak alami",
      ],
      correct: 3,
      explanation:
        "FBI menyebut kejanggalan seperti tangan, gigi, atau mata yang aneh, bayangan tidak konsisten, watermark, lag, dan gerakan tidak alami. Namun, deepfake terus membaik, jadi verifikasi lewat jalur lain tetap penting.",
      concept: "Mengenali Deepfake",
      conceptNote:
        "Perhatikan kejanggalan visual, tetapi tetap verifikasi (lihat Topik 03 · Cara Mengenali Video Palsu).",
    },
    {
      id: "ai-17",
      type: "single",
      prompt: "Dalam kasus sindikat deepfake Hong Kong (Oktober 2024), kapan banyak korban baru sadar telah tertipu?",
      options: [
        "Saat pertama kali melihat foto profil pelaku",
        "Saat pelaku mengirim dokumen pelatihan",
        "Saat mereka tidak bisa menarik dana dari platform investasi kripto",
        "Saat polisi meminta mereka berinvestasi",
      ],
      correct: 2,
      explanation:
        "Pelaku membangun kepercayaan lewat persona buatan AI, lalu menawarkan investasi kripto dengan bukti transaksi palsu. Banyak korban baru sadar ketika dananya tidak bisa ditarik. Total kerugian sekitar HK$360 juta.",
      concept: "Pola Penipuan Investasi",
      conceptNote:
        "Deepfake membangun kepercayaan, investasi palsu menguras dana (lihat Topik 03 · studi kasus sindikat deepfake Hong Kong).",
    },
    {
      id: "ai-18",
      type: "multi_select",
      prompt: "Menurut laporan Microsoft (Februari 2024), untuk apa saja kelompok peretas negara memakai model bahasa? Pilih semua yang benar.",
      options: [
        "Meriset target, misalnya lembaga pemikir atau teknologi satelit",
        "Menyusun email atau konten untuk spear phishing",
        "Membuat senjata siber baru yang tidak pernah dikenal sebelumnya",
        "Menulis skrip dan memperbaiki kode",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Contohnya Forest Blizzard (riset satelit dan radar) dan Emerald Sleet (riset lembaga pemikir).",
        "Benar. Emerald Sleet dan Crimson Sandstorm memakai AI untuk konten phishing.",
        "Salah. Microsoft dan OpenAI menyatakan belum melihat teknik serangan AI yang benar-benar baru.",
        "Benar. Beberapa kelompok memakai AI untuk skrip dasar dan memperbaiki kesalahan kode.",
      ],
      concept: "AI di Tangan APT",
      conceptNote:
        "AI mempercepat riset, phishing, dan skrip (lihat Topik 04 · Apa yang Sebenarnya Dilakukan Peretas Negara dengan AI?).",
    },
    {
      id: "ai-19",
      type: "single",
      prompt: "Dalam kampanye GTG-1002 yang diungkap Anthropic (November 2025), berapa besar porsi operasi taktis yang dinilai dijalankan AI secara mandiri?",
      options: [
        "Sekitar 10 sampai 20 persen",
        "Sekitar 80 sampai 90 persen",
        "Tidak ada sama sekali, semua dilakukan manusia",
        "100 persen tanpa campur tangan manusia",
      ],
      correct: 1,
      explanation:
        "Anthropic menilai AI menjalankan sekitar 80 sampai 90 persen operasi taktis, sedangkan manusia memulai kampanye dan memberi persetujuan di titik penting. AI juga sering berhalusinasi, misalnya mengarang kredensial.",
      concept: "Agen AI dalam Serangan",
      conceptNote:
        "AI mulai menjalankan sebagian besar langkah teknis (lihat Topik 04 · studi kasus GTG-1002).",
    },
    {
      id: "ai-20",
      type: "scenario",
      prompt: "Studi kasus: Kepala TI sebuah perusahaan membaca berita berikut dan meminta saran. Langkah mana yang paling tepat?",
      message: {
        sender: "Berita teknologi",
        time: "Pagi ini",
        lines: [
          "Peretas mulai memakai agen AI untuk memindai dan menyerang",
          "puluhan organisasi sekaligus dengan kecepatan tinggi.",
        ],
      },
      options: [
        "Memperkuat dasar keamanan (patch, MFA tahan phishing, least privilege) serta mempercepat pemantauan dan respons, termasuk memakai AI untuk bertahan",
        "Mematikan seluruh internet kantor secara permanen",
        "Menunggu sampai ada serangan dulu baru bertindak",
        "Hanya membeli antivirus berbasis signature",
      ],
      correct: 0,
      explanation:
        "Serangan berbantuan AI tetap memanfaatkan celah yang dikenal. Kontrol dasar yang kuat, pemantauan perilaku, log terpusat, dan respons cepat adalah pertahanan utama. Antivirus berbasis signature saja tidak cukup.",
      concept: "Pertahanan Era AI",
      conceptNote:
        "Fondasi kuat ditambah deteksi dan respons cepat (lihat Topik 04 · Pertahanan di Era Serangan Berbantuan AI).",
    },
  ],
};