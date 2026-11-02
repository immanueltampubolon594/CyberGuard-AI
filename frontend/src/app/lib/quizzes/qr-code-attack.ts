import type { ModuleQuiz } from "./types";

// Soal materi QR Code Attack (slug: qr-code-attack).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada qr-code-attack.json (Topik 00 sampai 05).
export const qrCodeAttackQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "qr-1",
      type: "single",
      prompt: "Apa kelemahan utama QR Code dibandingkan tautan (link) teks biasa?",
      options: [
        "QR Code tidak bisa dipindai oleh ponsel lama",
        "Manusia tidak bisa membaca ke mana QR Code akan mengarah sebelum memindainya",
        "QR Code selalu berisi virus",
        "QR Code hanya bisa dipakai untuk pembayaran",
      ],
      correct: 1,
      explanation:
        "Tautan teks bisa dibaca dan diperiksa sebelum diklik, sedangkan QR Code hanyalah pola kotak yang isinya baru terlihat setelah dipindai. Karena itu, periksa alamat yang ditampilkan kamera sebelum membukanya.",
      concept: "Kelemahan QR Code",
      conceptNote:
        "QR Code bersifat 'tertutup': isinya tidak terlihat oleh mata (lihat Topik 00 · Mengapa QR Code Menjadi Vektor Serangan yang Sempurna?).",
    },
    {
      id: "qr-2",
      type: "multi_select",
      prompt: "Mana saja pernyataan yang BENAR tentang QRIS menurut Bank Indonesia? Pilih semua yang benar.",
      options: [
        "QRIS statis berupa stiker atau cetakan, dan pembeli mengetik nominal sendiri",
        "QRIS dinamis dibuat baru untuk setiap transaksi dan nominalnya sudah tercantum",
        "QRIS dinamis lebih mudah ditimpa stiker palsu daripada QRIS statis",
        "Semua QR pembayaran wajib menggunakan QRIS sejak 1 Januari 2020",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. QRIS statis cocok untuk usaha mikro, tetapi pembeli harus mengetik nominal sendiri.",
        "Benar. QRIS dinamis dibuat oleh EDC atau aplikasi kasir untuk setiap transaksi.",
        "Salah. Justru QRIS statis yang berupa stiker lebih mudah ditimpa; QRIS dinamis tampil di layar dan berganti setiap transaksi.",
        "Benar. QRIS diatur dalam PADG No. 21/18/PADG/2019 dan wajib dipakai sejak 1 Januari 2020.",
      ],
      concept: "QRIS Statis vs Dinamis",
      conceptNote:
        "QRIS statis = stiker (rawan ditimpa), QRIS dinamis = dibuat per transaksi (lihat Topik 00 · QRIS di Indonesia: Aturan Dasar dan Tantangannya).",
    },
    {
      id: "qr-3",
      type: "scenario",
      prompt: "Studi kasus: Kamu menemukan kertas berikut terselip di kaca mobil. Apa yang paling tepat dilakukan?",
      message: {
        sender: "SURAT TILANG PARKIR",
        lines: [
          "Kendaraan Anda melanggar aturan parkir.",
          "Bayar denda Rp150.000 dalam 24 jam untuk menghindari derek.",
          "Pindai QR Code ini untuk membayar.",
        ],
      },
      options: [
        "Langsung pindai dan bayar agar mobil tidak diderek",
        "Bagikan foto QR-nya ke grup agar orang lain bisa membayar juga",
        "Jangan bayar lewat QR itu; cek kebenarannya lewat situs atau kantor resmi instansi terkait yang Anda cari sendiri",
        "Pindai QR-nya lalu bayar setengahnya dulu",
      ],
      correct: 2,
      explanation:
        "Pada Mei 2023, surat tilang parkir palsu ber-QR Code di San Francisco mengarahkan korban ke situs palsu yang meniru dinas transportasi. Untuk membayar denda atau tagihan, buka situs atau aplikasi resmi secara langsung, bukan lewat QR Code yang ditemukan di jalan.",
      concept: "QR Code di Tempat Fisik",
      conceptNote:
        "QR fisik bisa dibuat siapa saja; verifikasi lewat kanal resmi (lihat Topik 00 · studi kasus tilang parkir palsu).",
    },
    {
      id: "qr-4",
      type: "single",
      prompt: "Menurut tips Bank Indonesia, apa yang perlu dilakukan setelah memindai QRIS dan SEBELUM memasukkan PIN?",
      options: [
        "Memastikan nama merchant yang muncul di aplikasi cocok dengan nama pada label QRIS atau toko",
        "Memotret QRIS untuk dipakai lagi lain kali",
        "Menaikkan kecerahan layar",
        "Langsung memasukkan PIN agar antrean tidak panjang",
      ],
      correct: 0,
      explanation:
        "Bank Indonesia menyarankan konsumen memastikan nama merchant di aplikasi cocok dengan nama pada label QRIS, serta memastikan notifikasi pembayaran diterima. Langkah sederhana ini bisa menggagalkan QRIS palsu.",
      concept: "Tips Aman QRIS",
      conceptNote:
        "Cocokkan nama merchant dan nominal sebelum memasukkan PIN (lihat Topik 00 · QRIS di Indonesia: Aturan Dasar dan Tantangannya).",
    },
    {
      id: "qr-5",
      type: "single",
      prompt: "Mengapa email quishing (QR phishing) sering lolos dari filter email?",
      options: [
        "Karena email dikirim pada malam hari",
        "Karena QR Code disisipkan sebagai gambar, sehingga tidak ada tautan teks yang bisa langsung diperiksa filter",
        "Karena QR Code selalu dikirim dari alamat resmi",
        "Karena filter email tidak bisa membaca bahasa Indonesia",
      ],
      correct: 1,
      explanation:
        "Filter email terbiasa memeriksa tautan berupa teks. QR Code dalam gambar atau PDF hanyalah kumpulan pixel bagi sistem yang tidak memiliki fitur khusus pembaca QR. Penyerang juga memakai trik seperti gambar beresolusi rendah agar lebih sulit dibaca otomatis.",
      concept: "Cara Kerja Quishing",
      conceptNote:
        "QR dalam gambar menyembunyikan tautan dari filter email (lihat Topik 01 · Mekanisme Quishing dan Mengapa Ia Bypass Filter Email).",
    },
    {
      id: "qr-6",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima email kantor berikut. Apa tindakan paling tepat?",
      message: {
        sender: "Microsoft 365 Security <no-reply@m365-secure-update.com>",
        time: "Hari ini, 09.02",
        lines: [
          "Pengaturan keamanan akun Anda harus diperbarui dalam 48 jam.",
          "Pindai QR Code pada lampiran PDF untuk memverifikasi akun.",
          "Akun yang tidak diverifikasi akan dinonaktifkan.",
        ],
      },
      options: [
        "Pindai QR dengan ponsel pribadi agar laptop kantor tetap aman",
        "Teruskan email ke semua rekan agar mereka juga memverifikasi",
        "Balas email untuk meminta perpanjangan waktu",
        "Jangan pindai; buka sendiri situs resmi Microsoft 365 jika perlu memeriksa akun, lalu laporkan email ke tim IT",
      ],
      correct: 3,
      explanation:
        "Ini pola yang sama dengan kampanye quishing yang dilaporkan Cofense (2023): pembaruan akun Microsoft 365, QR di lampiran, dan tenggat waktu. Memindai dengan ponsel pribadi justru berisiko karena ponsel sering tidak memiliki perlindungan kantor.",
      concept: "Respons terhadap Quishing",
      conceptNote:
        "Jangan pindai QR dari email yang mendesak; buka situs resmi langsung dan laporkan (lihat Topik 01 · Strategi Pertahanan Komprehensif terhadap Quishing).",
    },
    {
      id: "qr-7",
      type: "multi_select",
      prompt: "Mana saja ciri kampanye quishing terhadap perusahaan energi AS yang dilaporkan Cofense (2023)? Pilih semua yang benar.",
      options: [
        "QR Code disisipkan dalam lampiran gambar PNG atau PDF",
        "Korban diberi tenggat 2–3 hari agar terburu-buru",
        "Tautan dialihkan melalui layanan tepercaya seperti Bing sebelum sampai ke halaman palsu",
        "QR Code langsung mengarah ke situs resmi Microsoft",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. QR Code dalam gambar membantu lolos dari pemindai tautan di email.",
        "Benar. Tenggat waktu menciptakan urgensi agar korban tidak sempat memeriksa.",
        "Benar. Pengalihan lewat Bing dan domain terkait Salesforce membuat tautan awal tampak aman.",
        "Salah. Tujuan akhirnya adalah halaman login Microsoft 365 palsu.",
      ],
      concept: "Kasus Quishing Cofense",
      conceptNote:
        "QR dalam gambar + urgensi + pengalihan lewat domain tepercaya (lihat Topik 01 · studi kasus perusahaan energi AS).",
    },
    {
      id: "qr-8",
      type: "single",
      prompt: "Dalam struktur data QRIS (standar EMVCo), Tag 01 bernilai 12 menandakan bahwa QR tersebut adalah…",
      options: [
        "QRIS statis",
        "QR untuk menerima uang",
        "QRIS dinamis",
        "QR milik bank pemerintah",
      ],
      correct: 2,
      explanation:
        "Tag 01 menandai jenis QR: nilai 11 untuk QRIS statis dan 12 untuk QRIS dinamis. QRIS dinamis juga memuat Tag 54 (nominal), sehingga pembeli tidak perlu mengetik jumlah pembayaran.",
      concept: "Struktur Data QRIS",
      conceptNote:
        "Tag 01: 11 = statis, 12 = dinamis; Tag 59 = nama merchant; Tag 54 = nominal (lihat Topik 02 · Anatomi QRIS dan Titik Rentannya).",
    },
    {
      id: "qr-9",
      type: "scenario",
      prompt: "Studi kasus: Saat berinfak di sebuah masjid, kamu memindai QRIS di kotak amal dan aplikasi menampilkan hal berikut. Apa yang paling tepat?",
      message: {
        sender: "Aplikasi Pembayaran",
        lines: [
          "Nama penerima: BUDI S****** (perorangan)",
          "Masukkan nominal:",
          "Stiker QRIS tampak ditempel di atas stiker lain.",
        ],
      },
      options: [
        "Batalkan transaksi dan tanyakan langsung kepada pengurus masjid, karena nama penerima tidak cocok dengan nama masjid",
        "Lanjutkan saja karena niatnya untuk beramal",
        "Masukkan nominal kecil saja untuk mencoba",
        "Pindai stiker yang lain lalu bayar dua kali",
      ],
      correct: 0,
      explanation:
        "Pada April 2023, seorang pelaku menempelkan QRIS palsu di 38 lokasi termasuk Masjid Istiqlal, dan dana yang masuk dipakai untuk kepentingan pribadi. Nama perorangan yang tidak berkaitan dengan lembaga dan stiker yang ditempel di atas stiker lain adalah dua tanda bahaya.",
      concept: "Mengenali QRIS Palsu",
      conceptNote:
        "Cocokkan nama penerima dengan lembaga atau toko; curigai stiker yang ditumpuk (lihat Topik 02 · studi kasus QRIS Palsu di Masjid Istiqlal).",
    },
    {
      id: "qr-10",
      type: "multi_select",
      prompt: "Langkah mana saja yang TEPAT bagi pedagang untuk mencegah QRIS-nya ditimpa stiker palsu? Pilih semua yang benar.",
      options: [
        "Memeriksa stiker QRIS setiap hari sebelum buka dan sebelum tutup",
        "Mengaktifkan notifikasi setiap dana masuk dan mencocokkannya dengan pembayaran pelanggan",
        "Menempel QRIS di tempat tersembunyi agar tidak terlihat orang",
        "Mempertimbangkan QRIS dinamis untuk transaksi bernilai besar",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Pemeriksaan rutin membantu menemukan stiker palsu sebelum banyak transaksi terbelokkan.",
        "Benar. Jika pelanggan sudah membayar tetapi notifikasi tidak masuk, itu tanda ada yang salah.",
        "Salah. Tempat tersembunyi atau redup justru disukai pelaku karena penggantian stiker lebih sulit ketahuan.",
        "Benar. QRIS dinamis tampil di layar dan dibuat per transaksi, sehingga tidak bisa ditimpa stiker.",
      ],
      concept: "Pertahanan Merchant",
      conceptNote:
        "Cek stiker harian, aktifkan notifikasi, dan gunakan QRIS dinamis untuk transaksi besar (lihat Topik 02 · Pertahanan Berlapis: Dari Merchant hingga Regulator).",
    },
    {
      id: "qr-11",
      type: "single",
      prompt:
        "Benar atau salah: Dalam kasus QRIS palsu di Masjid Istiqlal (2023), pelaku meretas sistem bank untuk mengubah kode QRIS asli milik masjid.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Menurut polisi, pelaku membuat QRIS sendiri dengan aplikasi penyedia QRIS, mencetaknya sebagai stiker, lalu menempelkannya tanpa izin pengelola. Tidak ada sistem yang diretas; yang dimanfaatkan adalah kebiasaan orang yang langsung membayar tanpa memeriksa nama penerima.",
      concept: "Kasus QRIS Masjid",
      conceptNote:
        "QRIS palsu cukup dibuat dan ditempel, tanpa perlu meretas (lihat Topik 02 · Modus Operandi Penyerang QRIS Palsu).",
    },
    {
      id: "qr-12",
      type: "single",
      prompt: "Apa yang dimaksud dengan 'cloaking' pada QR redirect attack?",
      options: [
        "Menyembunyikan QR Code di balik stiker lain",
        "Mengenkripsi QR Code agar tidak bisa dipindai",
        "Membuat QR Code berwarna agar tampak menarik",
        "Menampilkan tujuan berbeda kepada pengunjung berbeda, misalnya halaman aman untuk pemeriksa keamanan dan halaman phishing untuk calon korban",
      ],
      correct: 3,
      explanation:
        "Server pengalih menganalisis perangkat, lokasi, dan jenis browser pengunjung. Pemeriksa keamanan diarahkan ke halaman yang bersih, sedangkan calon korban diarahkan ke halaman phishing atau unduhan malware.",
      concept: "Cloaking",
      conceptNote:
        "Cloaking = satu QR, banyak tujuan tergantung siapa yang memindai (lihat Topik 03 · Mekanisme Teknis Redirect Server dan Cloaking).",
    },
    {
      id: "qr-13",
      type: "scenario",
      prompt: "Studi kasus: Kamu staf IT kampus dan menerima laporan berikut. Apa langkah paling tepat?",
      message: {
        sender: "Laporan Mahasiswa",
        time: "Hari ini, 13.40",
        lines: [
          "Saya scan QR di poster 'Beasiswa Prestasi', lalu diminta login portal kampus.",
          "Sekarang akun saya tidak bisa dibuka.",
          "Catatan IT: saat dicek dari laptop kantor, QR itu membuka situs resmi kampus.",
        ],
      },
      options: [
        "Abaikan laporan karena hasil pemeriksaan dari laptop menunjukkan situs resmi",
        "Curigai cloaking: periksa QR dari berbagai perangkat (termasuk ponsel), turunkan poster, amankan akun mahasiswa yang terdampak, dan umumkan peringatan",
        "Minta mahasiswa membuat akun baru tanpa pemeriksaan lebih lanjut",
        "Pindai ulang dari laptop yang sama sampai hasilnya berubah",
      ],
      correct: 1,
      explanation:
        "Hasil berbeda antara laptop dan ponsel adalah tanda khas cloaking. Pemeriksaan harus dilakukan dari berbagai perangkat, lokasi, dan jenis browser. Akun yang terdampak perlu segera diamankan.",
      concept: "Mendeteksi Cloaking",
      conceptNote:
        "Periksa QR mencurigakan dari berbagai perangkat dan User-Agent (lihat Topik 03 · Deteksi dan Mitigasi QR Redirect Attack).",
    },
    {
      id: "qr-14",
      type: "single",
      prompt: "Mengapa penyerang sering mengalihkan tautan QR melalui layanan perusahaan tepercaya, misalnya tautan pengalihan mesin pencari?",
      options: [
        "Agar tautan awal terlihat aman dan lolos dari pemeriksaan",
        "Agar korban mendapatkan internet gratis",
        "Agar QR Code bisa dipindai lebih cepat",
        "Agar perusahaan tepercaya ikut bertanggung jawab",
      ],
      correct: 0,
      explanation:
        "Domain milik perusahaan besar memiliki reputasi baik, sehingga filter keamanan dan pengguna cenderung menganggapnya aman. Dalam kampanye yang dilaporkan Cofense, tautan dialihkan lewat Bing dan domain terkait Salesforce sebelum sampai ke halaman palsu.",
      concept: "Pengalihan Lewat Domain Tepercaya",
      conceptNote:
        "Periksa alamat AKHIR di browser, bukan hanya alamat awal (lihat Topik 03 · Mekanisme Teknis Redirect Server dan Cloaking).",
    },
    {
      id: "qr-15",
      type: "single",
      prompt: "Saat kamu memindai QR pembayaran (misalnya QRIS) dan memasukkan PIN, apa yang sebenarnya terjadi?",
      options: [
        "Kamu menerima uang dari pemilik QR",
        "Kamu mengirim uang kepada pemilik QR",
        "Kamu hanya memverifikasi akun",
        "Tidak terjadi apa-apa sampai pemilik QR menyetujui",
      ],
      correct: 1,
      explanation:
        "QR pembayaran selalu dipakai untuk mengirim uang kepada pemilik QR. Untuk menerima uang, Anda membuat QR atau memberikan nomor rekening dari aplikasi Anda sendiri. Siapa pun yang meminta Anda memindai QR 'untuk menerima dana' hampir pasti menipu.",
      concept: "Arah Pembayaran QR",
      conceptNote:
        "Scan QR = membayar ke pemilik QR, bukan menerima (lihat Topik 04 · Strategi Verifikasi dan Pencegahan).",
    },
    {
      id: "qr-16",
      type: "scenario",
      prompt: "Studi kasus: Kamu menjual laptop bekas dan calon pembeli mengirim pesan berikut. Apa respons terbaik?",
      message: {
        sender: "Calon Pembeli",
        time: "Hari ini, 16.20",
        lines: [
          "Kak, saya sudah transfer Rp4.000.000 lewat sistem ya.",
          "Scan QR ini di aplikasi bank kakak untuk menerima dananya.",
          "Cepat ya kak, kodenya hangus 15 menit.",
        ],
      },
      options: [
        "Scan segera sebelum kodenya hangus",
        "Scan lalu masukkan PIN karena nominalnya sesuai harga laptop",
        "Tolak; pembayaran tidak pernah diterima dengan memindai QR milik orang lain. Cek saldo di aplikasi bank sendiri dan tetap bertransaksi di dalam platform",
        "Minta pembeli mengirim QR yang lain",
      ],
      correct: 2,
      explanation:
        "Ini modus 'scan untuk terima uang'. Jika Anda memindai dan memasukkan PIN, Anda justru mengirim Rp4 juta kepada penipu. Batas waktu 15 menit sengaja dibuat agar Anda tidak sempat berpikir.",
      concept: "Modus Scan untuk Terima Uang",
      conceptNote:
        "Jangan pernah memindai QR dari orang lain dengan alasan menerima dana (lihat Topik 04 · Varian dan Modus Operandi Fake Payment QR).",
    },
    {
      id: "qr-17",
      type: "multi_select",
      prompt: "Bagian keuangan sebuah UMKM menerima invoice ber-QR dari 'supplier'. Prosedur mana saja yang TEPAT? Pilih semua yang benar.",
      options: [
        "Konfirmasi invoice dengan menelepon nomor resmi supplier yang sudah dimiliki, bukan nomor di invoice",
        "Mencocokkan rekening tujuan dengan data supplier yang sudah diverifikasi sebelumnya",
        "Segera membayar karena invoice tampak resmi dan ada kop suratnya",
        "Menerapkan persetujuan lebih dari satu orang untuk pembayaran bernilai besar",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Verifikasi lewat saluran kedua yang sudah Anda percaya.",
        "Benar. Rekening 'baru' yang tiba-tiba muncul adalah tanda bahaya.",
        "Salah. Kop surat dan template invoice mudah dipalsukan.",
        "Benar. Persetujuan berlapis mencegah satu orang tertipu lalu langsung membayar.",
      ],
      concept: "Verifikasi Invoice B2B",
      conceptNote:
        "Verifikasi lewat saluran kedua, cocokkan rekening, dan gunakan persetujuan berlapis (lihat Topik 04 · Strategi Verifikasi dan Pencegahan).",
    },
    {
      id: "qr-18",
      type: "single",
      prompt: "Menurut peringatan FBI tentang QR Code, aturan mana yang benar?",
      options: [
        "Boleh mengunduh aplikasi dari QR Code asalkan tampilannya profesional",
        "Gunakan aplikasi pemindai QR dari toko tidak resmi agar lebih lengkap",
        "Bayar tagihan lewat QR dari email yang tidak diminta agar lebih cepat",
        "Jangan pernah mengunduh aplikasi dari QR Code; pasang aplikasi hanya dari toko resmi",
      ],
      correct: 3,
      explanation:
        "FBI (2022) menyarankan agar tidak mengunduh aplikasi dari QR Code, memakai pemindai bawaan kamera, memeriksa alamat situs setelah memindai, dan tidak membayar lewat QR dari email yang tidak diminta.",
      concept: "Aturan Aman Memindai QR",
      conceptNote:
        "Jangan unduh aplikasi dari QR; pasang dari toko resmi (lihat Topik 05 · Pertahanan Komprehensif terhadap QR Malware Download).",
    },
    {
      id: "qr-19",
      type: "scenario",
      prompt: "Studi kasus: Di pintu sebuah kedai kopi ada stiker berikut. Setelah dipindai, kamu diminta memasang aplikasi. Apa yang paling tepat?",
      message: {
        sender: "Stiker di pintu kedai",
        lines: [
          "ISI SURVEI, DAPAT 1 KOPI GRATIS!",
          "Pindai QR → unduh aplikasi survei kami.",
          "Aplikasi meminta izin: Mikrofon, Kamera, Accessibility.",
        ],
      },
      options: [
        "Jangan pasang aplikasinya; survei tidak perlu aplikasi dengan izin Accessibility. Tanyakan langsung ke pemilik kedai apakah promo itu benar",
        "Pasang saja, lalu hapus setelah mendapatkan kopi",
        "Pasang dan berikan semua izin agar survei berjalan lancar",
        "Pasang di ponsel teman supaya ponsel sendiri aman",
      ],
      correct: 0,
      explanation:
        "Ini pola yang sama dengan kasus di Singapura (2023): korban memasang 'aplikasi survei' dari QR di pintu toko. Izin Accessibility membuat pelaku bisa melihat dan mengendalikan layar, lalu menguras rekening saat korban tidur.",
      concept: "QR Menuju Unduhan Aplikasi",
      conceptNote:
        "QR promo yang meminta pasang aplikasi dengan izin Accessibility adalah tanda bahaya (lihat Topik 05 · studi kasus bubble tea Singapura).",
    },
    {
      id: "qr-20",
      type: "single",
      prompt:
        "Benar atau salah: Dalam kasus 'bubble tea gratis' di Singapura, pelaku bisa menguras rekening korban karena aplikasi yang dipasang mendapat izin Accessibility Service, sehingga pelaku bisa melihat dan mengendalikan layar ponsel.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Aplikasi meminta akses mikrofon, kamera, dan Accessibility Service. Dengan itu, pelaku merekam kredensial mobile banking korban dan menguras rekening saat korban tidur.",
      concept: "Bahaya Izin Accessibility",
      conceptNote:
        "Izin Accessibility memberi kendali layar kepada aplikasi; jangan berikan sembarangan (lihat Topik 05 · Jenis Malware yang Didistribusikan via QR Code).",
    },
  ],
};