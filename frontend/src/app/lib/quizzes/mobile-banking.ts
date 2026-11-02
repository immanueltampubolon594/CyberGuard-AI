import type { ModuleQuiz } from "./types";

// Soal materi Mobile Banking Attack (slug: mobile-banking).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada mobile-banking.json (Topik 00 sampai 05).
export const mobileBankingQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "mb-1",
      type: "single",
      prompt: "Mengapa penyerang mobile banking lebih sering menyasar ponsel dan pengguna daripada server bank?",
      options: [
        "Karena server bank tidak memiliki data nasabah",
        "Karena ponsel selalu lebih mahal daripada server",
        "Karena server bank dilindungi pengamanan berlapis, sedangkan perangkat dan perilaku pengguna adalah titik yang lebih lemah",
        "Karena bank melarang penyerang mengakses server",
      ],
      correct: 2,
      explanation:
        "Menembus server bank sangat sulit. Jauh lebih mudah membujuk satu orang untuk memasang satu APK atau menyebutkan satu kode OTP. Karena itulah ponsel disebut sebagai 'dompet dan ATM yang dibawa ke mana-mana'.",
      concept: "Mengapa Ponsel Jadi Target",
      conceptNote:
        "Serangan menyasar titik terlemah: perangkat dan perilaku pengguna (lihat Topik 00 · Mengapa Mobile Banking Menjadi Target Paling Menggiurkan?).",
    },
    {
      id: "mb-2",
      type: "scenario",
      prompt: "Studi kasus: Pamanmu menerima pesan WhatsApp berikut. Apa saran yang paling tepat?",
      message: {
        sender: "+62 857-xxxx-0912",
        time: "Hari ini, 08.20",
        lines: [
          "Yth. Pelanggan, tagihan listrik Anda bulan ini belum dibayar.",
          "Silakan cek rinciannya di file berikut:",
          "📎 Lembar_Tagihan_PLN.apk",
        ],
      },
      options: [
        "Jangan buka atau pasang file itu; tagihan resmi tidak pernah dikirim dalam bentuk .apk. Cek tagihan lewat aplikasi atau situs resmi PLN",
        "Pasang saja untuk melihat jumlah tagihannya",
        "Teruskan ke grup keluarga untuk bertanya",
        "Balas pesan untuk meminta file dalam format lain",
      ],
      correct: 0,
      explanation:
        "File .apk adalah aplikasi, bukan dokumen. Modus 'sniffing' yang diperingatkan OJK Malang (2023) memakai file seperti ini untuk mencuri data, termasuk data login mobile banking. Cek tagihan lewat kanal resmi yang Anda buka sendiri.",
      concept: "APK Berkedok Dokumen",
      conceptNote:
        "Undangan, tagihan, surat tilang, dan resi asli tidak pernah berbentuk .apk (lihat Topik 00 · Ekosistem Kejahatan Mobile Banking di Indonesia).",
    },
    {
      id: "mb-3",
      type: "single",
      prompt:
        "Benar atau salah: Pada Februari 2023, polisi menangkap seorang mahasiswa berusia 20 tahun yang membuat aplikasi 'undangan pernikahan' berbahaya dan menjualnya kepada orang lain lewat media sosial.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Menurut Polda Sulawesi Selatan, mahasiswa berinisial AI (20) asal Pinrang membuat aplikasi tersebut dan menjualnya kepada pembeli yang lalu memakainya untuk menipu korban di berbagai daerah. Membuat dan menjual aplikasi seperti ini adalah tindak pidana.",
      concept: "Rantai Kejahatan APK",
      conceptNote:
        "Ada pembuat, penjual, penyebar, dan korban dalam kejahatan APK (lihat Topik 00 · studi kasus APK undangan pernikahan).",
    },
    {
      id: "mb-4",
      type: "scenario",
      prompt: "Studi kasus: Ayahmu menerima pesan berikut. Apa respons yang paling tepat?",
      message: {
        sender: "POLANTAS INFO",
        time: "Hari ini, 10.05",
        lines: [
          "Kendaraan Anda terekam melanggar lalu lintas (E-TILANG).",
          "Unduh surat tilang Anda di bawah ini sebelum denda berlipat:",
          "📎 Surat_Tilang.apk",
        ],
      },
      options: [
        "Pasang aplikasinya agar tidak terkena denda berlipat",
        "Kirim foto KTP untuk membuktikan bukan pelanggar",
        "Bayar denda lewat nomor rekening yang ada di aplikasi",
        "Jangan pasang; polisi tidak mengirim surat tilang dalam bentuk APK lewat WhatsApp. Cek tilang di situs resmi kepolisian",
      ],
      correct: 3,
      explanation:
        "Pada 2023, warga Palembang kehilangan Rp2,3 miliar setelah memasang APK 'surat tilang' palsu. Pelaku menyadap OTP lewat SMS, membobol email, lalu menguras rekening melalui lebih dari 100 transaksi.",
      concept: "APK Surat Tilang Palsu",
      conceptNote:
        "Satu APK bisa membuka SMS OTP, email, lalu mobile banking (lihat Topik 01 · studi kasus APK surat tilang Palembang).",
    },
    {
      id: "mb-5",
      type: "single",
      prompt: "Cara paling aman untuk memastikan aplikasi mobile banking yang akan dipasang adalah aplikasi resmi adalah…",
      options: [
        "Mengunduh dari tautan yang dikirim lewat SMS",
        "Membuka Play Store atau App Store sendiri, mencari nama bank, dan memastikan nama pengembangnya adalah bank tersebut",
        "Memilih aplikasi dengan ikon paling mirip",
        "Mengunduh file APK dari grup WhatsApp keluarga",
      ],
      correct: 1,
      explanation:
        "Aplikasi bank resmi diterbitkan atas nama bank itu sendiri. Membuka toko aplikasi sendiri, atau mengikuti tautan dari situs resmi bank, jauh lebih aman daripada tautan dari chat atau SMS.",
      concept: "Memverifikasi Aplikasi Resmi",
      conceptNote:
        "Periksa nama pengembang di toko resmi (lihat Topik 01 · Strategi Deteksi dan Pencegahan).",
    },
    {
      id: "mb-6",
      type: "multi_select",
      prompt: "Menurut Polda Sumatera Selatan, apa saja langkah pelaku dalam kasus APK surat tilang di Palembang (2023)? Pilih semua yang benar.",
      options: [
        "Memilih korban secara acak dari nomor WhatsApp dan memastikan saldonya besar",
        "Mengirim file 'surat tilang' dalam format APK",
        "Menyadap OTP lewat SMS dan membobol email korban",
        "Meretas langsung server pusat bank",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. Pelaku memilih korban secara acak, lalu mengecek apakah saldonya besar.",
        "Benar. Pelaku menyamar sebagai polisi dan mengirim APK surat tilang.",
        "Benar. Email korban lalu dipakai sebagai username untuk masuk ke mobile banking.",
        "Salah. Pelaku tidak meretas server bank; yang diserang adalah ponsel dan akun korban.",
      ],
      concept: "Alur Serangan APK",
      conceptNote:
        "APK → baca SMS/OTP → email → mobile banking (lihat Topik 01 · studi kasus APK surat tilang Palembang).",
    },
    {
      id: "mb-7",
      type: "single",
      prompt: "Menurut materi, cara PALING UMUM pencurian kode OTP dalam penipuan sehari-hari adalah…",
      options: [
        "Menipu korban agar menyebutkan kodenya sendiri atau memasang aplikasi yang membaca SMS",
        "Menyadap jaringan SS7 operator",
        "Memasang BTS palsu di dekat rumah korban",
        "Membobol satelit telekomunikasi",
      ],
      correct: 0,
      explanation:
        "Serangan SS7 dan BTS palsu memang ada, tetapi mahal dan jarang. Dalam penipuan sehari-hari, OTP biasanya didapat dengan membujuk korban (lewat telepon atau chat) atau lewat malware yang membaca SMS.",
      concept: "Cara Umum Pencurian OTP",
      conceptNote:
        "Rekayasa sosial dan aplikasi pembaca SMS adalah cara paling umum (lihat Topik 02 · Mengapa OTP via SMS Rentan?).",
    },
    {
      id: "mb-8",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima panggilan otomatis berikut, dan beberapa detik sebelumnya ada SMS OTP masuk padahal kamu tidak sedang login. Apa yang paling tepat?",
      message: {
        sender: "Panggilan otomatis",
        lines: [
          "\"Kami mendeteksi aktivitas mencurigakan pada akun Anda.\"",
          "\"Untuk memblokir transaksi tersebut, masukkan kode 6 digit",
          "yang baru saja dikirim ke ponsel Anda, lalu tekan pagar.\"",
        ],
      },
      options: [
        "Masukkan kodenya agar transaksi mencurigakan diblokir",
        "Masukkan kode yang salah untuk menguji penelepon",
        "Tutup telepon, jangan masukkan kode apa pun, hubungi bank lewat nomor resmi, dan segera ganti password",
        "Tunggu panggilan berikutnya",
      ],
      correct: 2,
      explanation:
        "Ini pola layanan OTP.Agency di Inggris: penipu yang sudah punya data login memicu OTP, lalu bot menelepon korban agar memasukkan kode itu. OTP yang muncul padahal Anda tidak login berarti ada orang lain yang sedang mencoba masuk.",
      concept: "Bot Pencuri OTP",
      conceptNote:
        "OTP yang datang tanpa Anda login = ada yang mencoba masuk; jangan berikan kode (lihat Topik 02 · studi kasus OTP.Agency).",
    },
    {
      id: "mb-9",
      type: "single",
      prompt: "Mengapa passkey atau FIDO2 disebut tahan phishing?",
      options: [
        "Karena kodenya dikirim lewat SMS yang terenkripsi",
        "Karena passwordnya sangat panjang",
        "Karena hanya bisa dipakai pada siang hari",
        "Karena kunci rahasianya tersimpan di perangkat dan setiap login terikat pada alamat situs resmi, sehingga tidak bisa dipakai di situs tiruan",
      ],
      correct: 3,
      explanation:
        "Dengan FIDO2/passkey, tidak ada kode yang bisa dibacakan atau diketik ke situs palsu. Login hanya berhasil di domain asli yang terdaftar.",
      concept: "FIDO2 dan Passkey",
      conceptNote:
        "Passkey terikat ke domain asli dan kunci tidak pernah dikirim (lihat Topik 02 · Alternatif yang Lebih Aman: Beyond SMS OTP).",
    },
    {
      id: "mb-10",
      type: "multi_select",
      prompt: "Mana saja pernyataan yang BENAR tentang metode verifikasi menurut materi? Pilih semua yang benar.",
      options: [
        "Authenticator app (TOTP) membuat kode di perangkat sendiri, sehingga tidak bisa disadap lewat SMS",
        "Notifikasi push lebih aman daripada SMS, tetapi tetap waspadai 'MFA fatigue' (banyak permintaan persetujuan beruntun)",
        "OTP lewat SMS tetap aman meskipun nomor telepon sudah dikuasai penyerang",
        "Bank, OJK, dan polisi tidak pernah meminta OTP lewat telepon, SMS, atau chat",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Kode TOTP dibuat secara lokal dan tidak melewati jaringan seluler.",
        "Benar. Penyerang bisa mengirim banyak permintaan berharap korban menekan 'Setujui'.",
        "Salah. Jika nomor dikuasai (misalnya lewat SIM swap), semua SMS OTP jatuh ke tangan penyerang.",
        "Benar. Permintaan OTP lewat telepon atau chat hampir pasti penipuan.",
      ],
      concept: "Metode Verifikasi yang Lebih Aman",
      conceptNote:
        "TOTP, push, dan passkey lebih aman daripada SMS (lihat Topik 02 · Alternatif yang Lebih Aman: Beyond SMS OTP).",
    },
    {
      id: "mb-11",
      type: "single",
      prompt: "Apa tanda awal yang paling khas dari serangan SIM swap?",
      options: [
        "Baterai ponsel cepat panas",
        "Ponsel tiba-tiba kehilangan sinyal sama sekali ('No Service') tanpa alasan jelas",
        "Muncul iklan di browser",
        "Aplikasi bank meminta update",
      ],
      correct: 1,
      explanation:
        "Begitu nomor dipindahkan ke kartu SIM milik penyerang, kartu SIM korban langsung tidak aktif. Banyak korban mengira itu gangguan jaringan biasa, padahal saat itu penyerang mulai menerima semua SMS OTP.",
      concept: "Tanda SIM Swap",
      conceptNote:
        "'No Service' mendadak bisa berarti nomor Anda sudah dipindahkan (lihat Topik 03 · Mekanisme dan Modus Operandi).",
    },
    {
      id: "mb-12",
      type: "scenario",
      prompt: "Studi kasus: Hal berikut terjadi pada ponselmu. Apa langkah yang paling tepat?",
      message: {
        sender: "Kondisi ponselmu",
        lines: [
          "Sejak 30 menit lalu: 'No Service', padahal ponsel temanmu normal.",
          "Di laptop, masuk email: 'Password akun Anda telah diubah.'",
        ],
      },
      options: [
        "Segera hubungi operator dari telepon lain untuk memblokir nomor, periksa email dan perbankan dari perangkat tepercaya, dan hubungi bank",
        "Restart ponsel berkali-kali dan tunggu sinyal kembali besok",
        "Abaikan email karena mungkin hanya spam",
        "Ganti casing ponsel",
      ],
      correct: 0,
      explanation:
        "Kehilangan sinyal mendadak ditambah notifikasi perubahan password adalah tanda kuat SIM swap. Dalam kasus Ilham Bintang (2020), setelah menguasai nomor, pelaku mengambil alih email lalu menguras rekening. Kecepatan bertindak sangat menentukan.",
      concept: "Respons SIM Swap",
      conceptNote:
        "Hubungi operator dari telepon lain, amankan email, dan hubungi bank (lihat Topik 03 · Pertahanan Berlapis Melawan SIM Swap).",
    },
    {
      id: "mb-13",
      type: "multi_select",
      prompt: "Mana saja fakta yang BENAR tentang kasus Ilham Bintang (2020) menurut Polda Metro Jaya? Pilih semua yang benar.",
      options: [
        "Data nasabah didapat dari oknum pegawai BPR yang menjual data",
        "Salah satu pelaku datang ke gerai operator, mengaku pemilik nomor, dan meminta kartu SIM baru",
        "Pelaku mengambil alih email korban, lalu mentransfer uang ke rekening penampung",
        "Pelaku memasang malware di ponsel korban dari jarak jauh",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. Data dijual oleh oknum pegawai BPR.",
        "Benar. Rekaman CCTV gerai menjadi salah satu bukti.",
        "Benar. Rekening Ilham terkuras sekitar Rp300 juta.",
        "Salah. Kasus ini memakai SIM swap, bukan malware.",
      ],
      concept: "Kasus Ilham Bintang",
      conceptNote:
        "Kebocoran data + verifikasi lemah + nomor HP sebagai kunci cadangan (lihat Topik 03 · studi kasus Ilham Bintang).",
    },
    {
      id: "mb-14",
      type: "single",
      prompt:
        "Benar atau salah: Selama 2FA lewat SMS aktif, akun tetap aman meskipun nomor telepon sudah dikuasai penyerang lewat SIM swap.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Jika nomor dikuasai, semua SMS OTP masuk ke penyerang, sehingga 2FA via SMS tidak lagi melindungi. Untuk akun penting, gunakan authenticator app atau passkey, dan jangan jadikan nomor telepon satu-satunya cara pemulihan akun.",
      concept: "Kelemahan 2FA SMS",
      conceptNote:
        "SIM swap membuat 2FA berbasis SMS tidak berguna (lihat Topik 03 · Dampak Berantai pada Akun Digital).",
    },
    {
      id: "mb-15",
      type: "single",
      prompt: "Apa yang dimaksud dengan overlay attack?",
      options: [
        "Mengirim SMS massal ke banyak nomor",
        "Mengganti kartu SIM korban",
        "Malware menampilkan layar login palsu di atas aplikasi asli, sehingga data yang diketik korban masuk ke penyerang",
        "Membuat situs belanja palsu",
      ],
      correct: 2,
      explanation:
        "Saat korban membuka aplikasi bank, malware menutupinya dengan tampilan palsu yang sangat mirip. Korban mengira sedang login di aplikasi asli, padahal data dikirim ke server penyerang.",
      concept: "Definisi Overlay Attack",
      conceptNote:
        "Overlay = layar palsu di atas aplikasi asli (lihat Topik 04 · Mekanisme 'Tapjacking' dan 'Window Overlay').",
    },
    {
      id: "mb-16",
      type: "scenario",
      prompt: "Studi kasus: Setelah memasang aplikasi 'Battery Saver' yang meminta izin 'Tampil di atas aplikasi lain', hal berikut terjadi. Apa yang paling tepat?",
      message: {
        sender: "Aplikasi Mobile Banking",
        lines: [
          "Sesi Anda berakhir. Silakan masukkan ulang:",
          "User ID, Password, dan PIN transaksi.",
          "(Tampilannya sedikit berbeda dari biasanya.)",
        ],
      },
      options: [
        "Isi saja karena muncul di dalam aplikasi bank",
        "Jangan isi; tutup aplikasi, cabut izin 'tampil di atas aplikasi lain' dan hapus Battery Saver, lalu buka ulang aplikasi bank dari ikon resmi dan hubungi bank jika ragu",
        "Isi User ID saja, tanpa password",
        "Matikan WiFi lalu isi semua data",
      ],
      correct: 1,
      explanation:
        "Permintaan login ulang yang tidak biasa, tampilan yang sedikit berbeda, dan aplikasi baru dengan izin overlay adalah tanda khas overlay attack. Aplikasi penghemat baterai tidak memerlukan izin tampil di atas aplikasi lain.",
      concept: "Mengenali Overlay",
      conceptNote:
        "Cabut izin 'Display over other apps' dari aplikasi yang tidak membutuhkannya (lihat Topik 04 · Deteksi dan Teknik Mitigasi).",
    },
    {
      id: "mb-17",
      type: "single",
      prompt: "Menurut laporan Group-IB (2022), malware Godfather menyamar sebagai apa setelah terpasang di ponsel korban?",
      options: [
        "Aplikasi kalkulator",
        "Aplikasi bank resmi",
        "Game populer",
        "'Google Protect', dengan ikon yang disembunyikan",
      ],
      correct: 3,
      explanation:
        "Godfather menyamar sebagai 'Google Protect', menyembunyikan ikonnya, menyalahgunakan Accessibility Service, lalu menampilkan halaman login palsu di atas lebih dari 400 aplikasi keuangan yang ditargetkan.",
      concept: "Kasus Godfather",
      conceptNote:
        "Malware sering menyamar sebagai aplikasi keamanan (lihat Topik 04 · studi kasus Godfather).",
    },
    {
      id: "mb-18",
      type: "single",
      prompt: "Mengapa izin Accessibility Service sangat berbahaya jika diberikan kepada aplikasi jahat?",
      options: [
        "Karena membuat baterai cepat habis",
        "Karena membuat ponsel tidak bisa menerima telepon",
        "Karena hanya bisa dipakai di Android lama",
        "Karena fitur ini memungkinkan aplikasi membaca isi layar, menekan tombol, dan mengetik atas nama pengguna, sehingga malware bisa mengendalikan ponsel",
      ],
      correct: 3,
      explanation:
        "Accessibility Service dirancang untuk membantu pengguna dengan disabilitas, sehingga kemampuannya sangat luas. Di tangan malware, fitur ini dipakai untuk mencuri data, membaca OTP, bahkan menjalankan transfer otomatis (ATS).",
      concept: "Bahaya Accessibility Service",
      conceptNote:
        "Accessibility = kendali layar penuh; jangan berikan sembarangan (lihat Topik 05 · Kekuatan Accessibility Service).",
    },
    {
      id: "mb-19",
      type: "scenario",
      prompt: "Studi kasus: Kamu memasang aplikasi pembaca PDF dari Play Store. Beberapa hari kemudian muncul pesan berikut. Apa yang paling tepat?",
      message: {
        sender: "PDF Reader Pro",
        lines: [
          "Pembaruan penting tersedia! Unduh plugin tambahan untuk melanjutkan.",
          "Setelah itu, aktifkan izin Accessibility untuk 'membaca dokumen lebih cepat'.",
        ],
      },
      options: [
        "Unduh plugin dan aktifkan izinnya karena aplikasi berasal dari Play Store",
        "Aktifkan izin Accessibility saja tanpa mengunduh plugin",
        "Tolak, hapus aplikasinya, pindai ponsel, dan jika sudah sempat memberi izin, ganti password mobile banking dari perangkat lain",
        "Abaikan pesan dan biarkan aplikasi tetap terpasang",
      ],
      correct: 2,
      explanation:
        "Ini pola Anatsa (2024): aplikasi utilitas di Google Play tampak bersih saat dipasang, lalu mengunduh muatan berbahaya dengan kedok 'update' dan meminta Accessibility untuk mencuri data perbankan. Pembaca PDF tidak membutuhkan izin Accessibility.",
      concept: "Dropper di Google Play",
      conceptNote:
        "Aplikasi bisa 'berubah' setelah dipasang; curigai permintaan update dan Accessibility (lihat Topik 05 · studi kasus Anatsa).",
    },
    {
      id: "mb-20",
      type: "multi_select",
      prompt: "Langkah mana saja yang TEPAT untuk melawan banking trojan di Android? Pilih semua yang benar.",
      options: [
        "Mengaktifkan Google Play Protect",
        "Meninjau secara berkala izin Accessibility, SMS, dan akses notifikasi, lalu mencabut yang tidak dikenal",
        "Memberikan izin Accessibility ke semua aplikasi agar berjalan lancar",
        "Mengganti password perbankan dari perangkat lain jika ponsel diduga terinfeksi",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Play Protect memindai aplikasi yang terpasang.",
        "Benar. Izin-izin ini adalah yang paling sering disalahgunakan malware perbankan.",
        "Salah. Justru izin Accessibility harus diberikan sangat selektif.",
        "Benar. Jika ponsel terinfeksi, password baru yang diketik di ponsel itu bisa ikut tercuri.",
      ],
      concept: "Pertahanan Banking Trojan",
      conceptNote:
        "Play Protect, tinjau izin, dan ganti password dari perangkat lain (lihat Topik 05 · Pertahanan Komprehensif Melawan Banking Trojan).",
    },
  ],
};