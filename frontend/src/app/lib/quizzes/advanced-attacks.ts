import type { ModuleQuiz } from "./types";

// Soal materi Advanced Attacks (slug: advanced-attacks).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada advanced-attacks.json (Topik 00 sampai 05).
export const advancedAttacksQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "adv-1",
      type: "single",
      prompt: "Apa yang paling membedakan advanced attacks dari serangan siber biasa?",
      options: [
        "Selalu menyasar individu secara acak lewat SMS massal",
        "Selalu selesai dalam hitungan menit",
        "Terencana dan terorganisir, sering didukung negara atau kelompok besar, menggabungkan banyak teknik, dan bisa bersembunyi lama di jaringan korban",
        "Hanya memakai virus lama yang mudah dideteksi antivirus",
      ],
      correct: 2,
      explanation:
        "Advanced attacks menyasar organisasi besar dan infrastruktur kritis, memakai kombinasi rekayasa sosial, zero-day, penyusupan vendor, dan malware khusus, serta bisa bertahan diam-diam berbulan-bulan.",
      concept: "Ciri Advanced Attacks",
      conceptNote:
        "Pelaku bersumber daya besar, target strategis, teknik berlapis (lihat Topik 00 · Mengapa Advanced Attacks Berbeda dari Serangan Biasa?).",
    },
    {
      id: "adv-2",
      type: "scenario",
      prompt: "Studi kasus: Seorang developer di perusahaan fintech menerima pesan berikut. Apa langkah yang paling aman?",
      message: {
        sender: "Recruiter (Telegram)",
        time: "Hari ini, 10.15",
        lines: [
          "Halo, kami tertarik merekrut Anda untuk proyek blockchain bergaji tinggi.",
          "Sebagai tes teknis, tolong jalankan proyek Docker ini di laptop kerja Anda:",
          "github.com/proyek-tes-rekrutmen/trading-bot",
        ],
      },
      options: [
        "Menjalankan proyek di laptop kerja agar cepat selesai",
        "Menjalankan proyek sambil tetap login ke akun cloud perusahaan",
        "Meminta recruiter mengirim versi .zip agar lebih praktis",
        "Tidak menjalankan kode dari orang asing di laptop kerja dan melaporkan pesan itu ke tim keamanan",
      ],
      correct: 3,
      explanation:
        "Dalam kasus Bybit (2025), laptop developer Safe{Wallet} kemungkinan disusupi lewat proyek Docker berbahaya hasil rekayasa sosial. Dari situ penyerang membajak sesi AWS dan menyisipkan kode berbahaya.",
      concept: "Rekayasa Sosial terhadap Developer",
      conceptNote:
        "Satu perangkat developer bisa menjadi pintu masuk serangan besar (lihat Topik 00 · studi kasus Bybit).",
    },
    {
      id: "adv-3",
      type: "single",
      prompt:
        "Benar atau salah: Menurut Chainalysis, total pembayaran tebusan ransomware global pada 2024 turun sekitar 35% dibanding 2023.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Pembayaran turun menjadi sekitar US$813,55 juta dari sekitar US$1,25 miliar, antara lain karena makin banyak korban menolak membayar dan adanya operasi aparat terhadap kelompok besar seperti LockBit.",
      concept: "Tren Ransomware",
      conceptNote:
        "Pembayaran turun, tetapi jumlah serangan tetap tinggi (lihat Topik 00 · 5 Jenis Advanced Attacks yang Akan Anda Pelajari).",
    },
    {
      id: "adv-4",
      type: "multi_select",
      prompt: "Unsur advanced attack apa saja yang terlihat dalam kasus pencurian Bybit (2025)? Pilih semua yang benar.",
      options: [
        "Pelaku dikaitkan FBI dengan Korea Utara (TraderTraitor)",
        "Penyerang membajak sesi AWS developer sehingga bisa melewati MFA",
        "Penyerang membobol Bybit dengan menebak kata sandi admin secara acak",
        "JavaScript berbahaya disisipkan ke situs Safe{Wallet}, layanan pihak ketiga yang dipakai Bybit",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. FBI menyebut aktivitas Korea Utara bernama TraderTraitor bertanggung jawab.",
        "Benar. Sesi yang aktif dibajak sehingga MFA tidak lagi menjadi penghalang.",
        "Salah. Serangan dimulai dari rekayasa sosial terhadap developer pihak ketiga, bukan tebakan kata sandi acak.",
        "Benar. Ini menunjukkan unsur serangan rantai pasok lewat vendor tepercaya.",
      ],
      concept: "Anatomi Serangan Bybit",
      conceptNote:
        "Negara, rekayasa sosial, cloud, dan pihak ketiga dalam satu kasus (lihat Topik 00 · studi kasus Bybit).",
    },
    {
      id: "adv-5",
      type: "single",
      prompt: "Menurut kesaksian CEO Colonial Pipeline di Senat AS (Juni 2021), bagaimana penyerang DarkSide pertama kali masuk?",
      options: [
        "Lewat zero-day pada sistem kendali pipa",
        "Lewat profil VPN lama yang sudah tidak dipakai dan tidak dilindungi MFA",
        "Lewat orang dalam yang menyerahkan USB",
        "Lewat serangan DDoS ke situs web perusahaan",
      ],
      correct: 1,
      explanation:
        "Joseph Blount menjelaskan penyerang memakai kredensial untuk profil VPN lama yang tidak memakai MFA. Akun yang terlupakan menjadi pintu masuk serangan besar.",
      concept: "Initial Access Ransomware",
      conceptNote:
        "Akun lama tanpa MFA adalah celah fatal (lihat Topik 01 · studi kasus Colonial Pipeline).",
    },
    {
      id: "adv-6",
      type: "scenario",
      prompt: "Studi kasus: Pada Sabtu pagi, admin TI sebuah pabrik melihat pesan berikut di beberapa server. Apa langkah pertama yang paling tepat?",
      message: {
        sender: "README_RESTORE.txt",
        time: "Sabtu, 04.50",
        lines: [
          "Semua file Anda sudah kami enkripsi dan data sensitif sudah kami salin.",
          "Bayar dalam 72 jam atau data Anda kami publikasikan.",
        ],
      },
      options: [
        "Segera isolasi sistem yang terdampak, jalankan rencana respons insiden, dan hubungi tim respons serta aparat",
        "Langsung membayar tebusan agar data tidak bocor",
        "Mematikan antivirus agar proses dekripsi lancar",
        "Menunggu hari Senin sampai tim lengkap",
      ],
      correct: 0,
      explanation:
        "Panduan #StopRansomware menekankan isolasi cepat dan rencana respons yang sudah diuji. Colonial Pipeline pun langsung menghentikan operasi agar malware tidak menjalar ke jaringan OT. Membayar tebusan tidak menjamin data aman.",
      concept: "Respons Insiden Ransomware",
      conceptNote:
        "Isolasi cepat dan jalankan IR plan (lihat Topik 01 · Strategi Pertahanan Melawan Ransomware Enterprise).",
    },
    {
      id: "adv-7",
      type: "multi_select",
      prompt: "Mana saja rekomendasi panduan #StopRansomware (CISA, FBI, NSA) yang dibahas di materi? Pilih semua yang benar.",
      options: [
        "Menyimpan backup offline dan terenkripsi, lalu menguji pemulihannya",
        "Membuka RDP ke internet agar admin mudah bekerja dari rumah",
        "Menerapkan MFA tahan phishing untuk email, VPN, dan akun penting",
        "Memisahkan akun administrator dari akun harian",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Banyak ransomware sengaja mencari dan menghapus backup yang terhubung ke jaringan.",
        "Salah. Panduan justru menyarankan agar layanan seperti RDP tidak dibuka ke internet.",
        "Benar. MFA tahan phishing mempersulit penyerang memakai kredensial curian.",
        "Benar. Prinsip least privilege membatasi kerusakan jika satu akun dibobol.",
      ],
      concept: "Kontrol Anti-Ransomware",
      conceptNote:
        "Backup offline, MFA, dan least privilege (lihat Topik 01 · Strategi Pertahanan Melawan Ransomware Enterprise).",
    },
    {
      id: "adv-8",
      type: "single",
      prompt: "Apa yang dimaksud dengan teknik double extortion dalam ransomware enterprise?",
      options: [
        "Meminta tebusan dua kali lipat dari harga normal",
        "Menyerang dua perusahaan sekaligus",
        "Mengenkripsi data dua kali agar lebih sulit dibuka",
        "Mencuri data terlebih dahulu, lalu mengenkripsi sistem dan mengancam membocorkan data jika tebusan tidak dibayar",
      ],
      correct: 3,
      explanation:
        "Dengan double extortion, backup saja tidak cukup karena data yang dicuri tetap bisa dibocorkan. Itulah sebabnya pencegahan pencurian data dan pemantauan exfiltrasi juga penting.",
      concept: "Double Extortion",
      conceptNote:
        "Enkripsi ditambah ancaman kebocoran data (lihat Topik 01 · Evolusi Ransomware dari Kejahatan Sederhana ke Industri Kriminal).",
    },
    {
      id: "adv-9",
      type: "single",
      prompt: "Menurut Google Threat Intelligence Group, bagaimana gambaran zero-day yang dieksploitasi pada 2024?",
      options: [
        "Tidak ada satu pun zero-day yang dieksploitasi",
        "Hanya menyerang ponsel pribadi",
        "Ada 75 zero-day, dan 44% di antaranya menyasar teknologi perusahaan seperti perangkat keamanan dan jaringan",
        "Lebih dari 1.000 zero-day, semuanya dari kelompok kriminal",
      ],
      correct: 2,
      explanation:
        "GTIG mencatat 75 zero-day (98 pada 2023). Porsi teknologi perusahaan mencapai 44%, tertinggi yang pernah dicatat, dan 20 di antaranya menyerang produk keamanan dan jaringan.",
      concept: "Tren Zero-Day",
      conceptNote:
        "Perangkat keamanan dan jaringan makin jadi sasaran (lihat Topik 02 · Ekosistem Zero-Day Exploit yang Kompleks).",
    },
    {
      id: "adv-10",
      type: "scenario",
      prompt: "Studi kasus: Tim TI sebuah kampus menerima pemberitahuan berikut dari vendor aplikasi transfer file yang mereka pakai. Apa langkah terbaik?",
      message: {
        sender: "Security Advisory Vendor",
        time: "Hari ini, 07.00",
        lines: [
          "Celah kritis pada aplikasi transfer file kami sedang dieksploitasi secara aktif.",
          "Patch darurat sudah tersedia. Periksa juga tanda-tanda web shell di server Anda.",
        ],
      },
      options: [
        "Menunggu jadwal patch rutin bulan depan",
        "Segera memasang patch, membatasi akses aplikasi dari internet, dan memeriksa log serta file web shell baru",
        "Mengabaikan karena kampus bukan target menarik",
        "Mematikan antivirus agar patch terpasang lebih cepat",
      ],
      correct: 1,
      explanation:
        "Pada kasus MOVEit (2023), Cl0p mengeksploitasi celah secara massal dan memasang web shell LEMURLOOT. Patch cepat dan pengecekan tanda kompromi sangat penting karena data bisa sudah dicuri sebelum patch dipasang.",
      concept: "Respons Zero-Day",
      conceptNote:
        "Patch darurat dan cek tanda kompromi (lihat Topik 02 · Strategi Pertahanan Melawan Zero-Day Exploit).",
    },
    {
      id: "adv-11",
      type: "single",
      prompt: "Dalam kasus MOVEit Transfer (2023), celah jenis apa yang dieksploitasi kelompok CL0P menurut advisori CISA dan FBI?",
      options: [
        "Celah SQL injection yang belum diketahui (CVE-2023-34362), lalu dipasang web shell LEMURLOOT",
        "Celah pada kartu SIM pengguna",
        "Kata sandi default pada router rumah",
        "Celah fisik pada pintu ruang server",
      ],
      correct: 0,
      explanation:
        "CL0P mengeksploitasi SQL injection pada MOVEit Transfer sejak 27 Mei 2023, memasang LEMURLOOT, dan mencuri data. Emsisoft menghitung sedikitnya 2.773 organisasi dan sekitar 95,8 juta individu terdampak.",
      concept: "Eksploitasi Massal Zero-Day",
      conceptNote:
        "Satu celah di aplikasi internet berdampak ke ribuan organisasi (lihat Topik 02 · studi kasus MOVEit Transfer).",
    },
    {
      id: "adv-12",
      type: "single",
      prompt:
        "Benar atau salah: Dalam kasus SolarWinds, seluruh sekitar 18.000 entitas yang mengunduh pembaruan berbahaya dibobol lebih dalam oleh penyerang.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Menurut Gedung Putih, sekitar 18.000 entitas mengunduh pembaruan, tetapi yang benar-benar dibobol lebih dalam adalah 9 lembaga federal dan sekitar 100 perusahaan swasta. APT memilih target secara selektif.",
      concept: "Selektivitas APT",
      conceptNote:
        "APT bersabar dan memilih target bernilai tinggi (lihat Topik 03 · studi kasus SolarWinds).",
    },
    {
      id: "adv-13",
      type: "multi_select",
      prompt: "Mana saja cara mendeteksi dan merespons serangan APT yang dibahas di materi? Pilih semua yang benar.",
      options: [
        "Threat hunting proaktif memakai threat intelligence dan MITRE ATT&CK",
        "Log terpusat (SIEM) dengan masa simpan yang memadai",
        "Hanya menunggu peringatan antivirus tanpa analisis lanjutan",
        "Segmentasi jaringan dan prinsip Zero Trust",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Tim keamanan harus aktif mencari tanda kompromi, bukan hanya menunggu alert.",
        "Benar. Log yang lengkap memungkinkan investigasi dan perburuan ancaman.",
        "Salah. APT memakai malware khusus dan teknik living off the land yang sering lolos dari antivirus.",
        "Benar. Segmentasi membatasi perpindahan lateral penyerang.",
      ],
      concept: "Deteksi APT",
      conceptNote:
        "Berburu aktif, log lengkap, dan segmentasi (lihat Topik 03 · Cara Mendeteksi dan Merespon APT Attacks).",
    },
    {
      id: "adv-14",
      type: "scenario",
      prompt: "Studi kasus: Dua minggu setelah memasang pembaruan resmi software pemantauan jaringan, analis SOC melihat catatan berikut. Apa tindakan terbaik?",
      message: {
        sender: "SIEM Alert",
        time: "Selasa, 02.13",
        lines: [
          "Server pemantauan (MON-01) menghubungi domain asing yang belum pernah terlihat.",
          "Lalu lintas menyerupai trafik normal aplikasi.",
          "Layanan EDR di server itu berhenti tanpa perintah admin.",
        ],
      },
      options: [
        "Mengabaikan karena pembaruannya resmi dan bertanda tangan digital",
        "Menghapus log agar disk tidak penuh",
        "Me-restart server lalu menutup tiket",
        "Mengisolasi server, menyimpan bukti, memburu tanda kompromi di sistem lain, dan mengecek advisori vendor",
      ],
      correct: 3,
      explanation:
        "SUNBURST pada SolarWinds aktif setelah 'tidur' hingga sekitar dua minggu, menyamar sebagai trafik Orion yang normal, dan mematikan alat keamanan tertentu. Tanda tangan resmi tidak menjamin pembaruan aman.",
      concept: "Mengenali Backdoor Rantai Pasok",
      conceptNote:
        "Pembaruan resmi pun bisa disusupi (lihat Topik 03 · studi kasus SolarWinds).",
    },
    {
      id: "adv-15",
      type: "single",
      prompt: "Pada April 2021, AS dan Inggris secara resmi mengaitkan serangan SolarWinds dengan siapa?",
      options: [
        "Kelompok hacktivist Killnet",
        "Kelompok ransomware DarkSide",
        "Dinas intelijen luar negeri Rusia (SVR), yang dikenal juga sebagai APT29",
        "Kelompok Cl0p",
      ],
      correct: 2,
      explanation:
        "AS dan Inggris mengatribusikan serangan ini kepada SVR (APT29/Cozy Bear). AS lalu menjatuhkan sanksi dan mengusir 10 diplomat Rusia.",
      concept: "Atribusi APT",
      conceptNote:
        "APT29 dikaitkan dengan SVR Rusia (lihat Topik 03 · Beberapa APT Groups Paling Terkenal dan Berbahaya).",
    },
    {
      id: "adv-16",
      type: "single",
      prompt: "Mengapa supply chain attack dianggap sangat 'efisien' bagi penyerang?",
      options: [
        "Karena vendor selalu memiliki keamanan paling kuat",
        "Karena serangan ini tidak membutuhkan akses apa pun",
        "Karena hanya menyerang satu komputer",
        "Karena dengan membobol satu vendor tepercaya, penyerang bisa menjangkau banyak pelanggan vendor tersebut sekaligus",
      ],
      correct: 3,
      explanation:
        "Vendor sering punya akses tepercaya ke banyak pelanggan. Satu kompromi bisa memberi akses ke ratusan atau ribuan organisasi, dan lalu lintasnya terlihat sah.",
      concept: "Efek Pengganda",
      conceptNote:
        "Satu vendor dibobol, banyak pelanggan terdampak (lihat Topik 04 · Mengapa Supply Chain Attacks Menjadi Ancaman Utama?).",
    },
    {
      id: "adv-17",
      type: "scenario",
      prompt: "Studi kasus: Saat mengerjakan tugas akhir, temanmu akan memasang library berikut. Apa yang sebaiknya ia lakukan?",
      message: {
        sender: "Terminal",
        time: "Hari ini, 20.05",
        lines: [
          "$ pip install reqeusts",
          "(paket baru, 1 pengunduh, dibuat 2 hari lalu, nama mirip paket populer)",
        ],
      },
      options: [
        "Langsung memasang karena namanya mirip paket terkenal",
        "Memasang dengan hak administrator agar tidak error",
        "Mengecek ejaan dan sumber paket, memilih paket resmi yang terawat, dan memeriksa dependensinya",
        "Menyalin kode paket ke server produksi dulu untuk dicoba",
      ],
      correct: 2,
      explanation:
        "Penyerang membuat paket typosquatting dengan nama mirip paket populer atau mengambil alih paket terbengkalai. Periksa ejaan, pemelihara, dan reputasi paket sebelum memasang.",
      concept: "Serangan Open Source",
      conceptNote:
        "Typosquatting dan paket berbahaya di ekosistem OSS (lihat Topik 04 · Jenis-jenis Supply Chain Attacks).",
    },
    {
      id: "adv-18",
      type: "multi_select",
      prompt: "Mana saja strategi yang tepat untuk mengamankan rantai pasok? Pilih semua yang benar.",
      options: [
        "Meminta Software Bill of Materials (SBOM) dari vendor software",
        "Memberi semua vendor akses admin penuh agar pekerjaan cepat",
        "Menerapkan least privilege dan pemantauan untuk akses vendor",
        "Memverifikasi tanda tangan digital dan integritas software sebelum dipasang",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. SBOM membantu mengetahui cepat apakah sebuah komponen rentan ada di software Anda.",
        "Salah. Vendor tepercaya pun tetap harus diberi akses seminimal mungkin.",
        "Benar. Akses vendor harus lewat jalur khusus dengan autentikasi kuat dan dipantau.",
        "Benar. Verifikasi hash dan tanda tangan membantu mendeteksi software yang dirusak.",
      ],
      concept: "Keamanan Rantai Pasok",
      conceptNote:
        "SBOM, least privilege vendor, dan verifikasi integritas (lihat Topik 04 · Strategi untuk Mengamankan Supply Chain).",
    },
    {
      id: "adv-19",
      type: "single",
      prompt: "Menurut laporan Cloudflare, dari mana serangan DDoS rekor 31,4 Tbps pada kuartal IV 2025 berasal?",
      options: [
        "Dari satu server milik kelompok peretas",
        "Dari botnet Aisuru-Kimwolf yang sebagian besar terdiri dari perangkat Android TV yang terinfeksi",
        "Dari pusat data milik Cloudflare sendiri",
        "Dari ponsel yang terkena SIM swap",
      ],
      correct: 1,
      explanation:
        "Serangan itu hanya berlangsung sekitar 35 detik. Perangkat IoT yang tidak aman, seperti TV pintar, mudah dikuasai untuk membentuk botnet raksasa. Sepanjang 2025, Cloudflare memitigasi 47,1 juta insiden DDoS.",
      concept: "Botnet IoT",
      conceptNote:
        "Perangkat IoT yang tidak aman menjadi senjata DDoS (lihat Topik 05 · Jenis-jenis DDoS Attacks yang Menargetkan Infrastruktur Kritis).",
    },
    {
      id: "adv-20",
      type: "scenario",
      prompt: "Studi kasus: Tim TI sebuah rumah sakit menerima kabar berikut. Langkah mana yang paling tepat?",
      message: {
        sender: "Grup koordinasi keamanan siber sektor kesehatan",
        time: "Hari ini, 09.30",
        lines: [
          "Beredar daftar target kelompok hacktivist yang memuat nama rumah sakit Anda.",
          "Kelompok ini dikenal melakukan serangan DDoS.",
        ],
      },
      options: [
        "Mengaktifkan layanan mitigasi DDoS/WAF, memastikan sistem klinis terpisah dari layanan publik, dan menyiapkan serta menguji rencana respons",
        "Mengabaikan karena hacktivist sering membesar-besarkan klaimnya",
        "Mematikan semua sistem klinis secara permanen",
        "Membalas menyerang server kelompok tersebut",
      ],
      correct: 0,
      explanation:
        "HHS HC3 (2023) memperingatkan Killnet menargetkan sektor kesehatan. Meski klaimnya sering dilebih-lebihkan, HC3 menyarankan WAF, multi-CDN, dan rencana respons. Menyerang balik adalah tindakan ilegal dan berisiko.",
      concept: "Kesiapan DDoS Rumah Sakit",
      conceptNote:
        "Tanggapi ancaman dengan persiapan, bukan panik (lihat Topik 05 · studi kasus Killnet).",
    },
  ],
};