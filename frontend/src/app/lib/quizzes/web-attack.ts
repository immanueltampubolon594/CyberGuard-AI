import type { ModuleQuiz } from "./types";

// Soal materi Web Attack (slug: web-attack).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada web-attack.json (Topik 00 sampai 08).
export const webAttackQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "wa-1",
      type: "single",
      prompt: "Menurut materi, mengapa aplikasi web menjadi salah satu target utama penyerang?",
      options: [
        "Karena aplikasi web selalu dibuat tanpa password",
        "Karena aplikasi web hanya bisa diakses dari jaringan kantor",
        "Karena aplikasi web terekspos ke internet publik dan harus menerima input dari siapa saja",
        "Karena aplikasi web tidak pernah menyimpan data penting",
      ],
      correct: 2,
      explanation:
        "Berbeda dengan aplikasi desktop di lingkungan terkontrol, aplikasi web terbuka bagi siapa pun di internet dan harus memproses input dari pengguna yang tidak dikenal. Setiap input yang tidak divalidasi adalah calon celah.",
      concept: "Permukaan Serangan Web",
      conceptNote:
        "Aplikasi web terekspos publik dan menerima input siapa saja (lihat Topik 00 · Mengapa Aplikasi Web Menjadi Target Utama?).",
    },
    {
      id: "wa-2",
      type: "scenario",
      prompt: "Studi kasus: Tim IT sebuah perusahaan menerima email berikut. Apa tindakan yang paling tepat?",
      message: {
        sender: "Peneliti Keamanan (laporan bug)",
        time: "Senin, 09.15",
        lines: [
          "Endpoint api-lama.perusahaan.co.id/customer?id=1023 mengembalikan data pelanggan tanpa perlu login.",
          "Mengganti angka id menampilkan data pelanggan lain. Domain ini sepertinya sudah lama tidak dipakai.",
        ],
      },
      options: [
        "Segera tutup atau lindungi endpoint itu dengan autentikasi dan kontrol akses, inventaris semua domain/API yang menghadap internet, lalu periksa log akses",
        "Biarkan saja karena domain itu sudah tidak dipakai tim",
        "Hapus email laporan agar tidak tersebar",
        "Cukup ganti angka id menjadi huruf supaya sulit ditebak",
      ],
      correct: 0,
      explanation:
        "Pola ini mirip kasus Optus 2022: kontrol akses pada API tidak berfungsi, domainnya terlupakan selama sekitar dua tahun, dan penyerang cukup mengirim permintaan ke API untuk mendapatkan data sekitar 9,5 juta pelanggan. Domain yang 'tidak dipakai' tetap bisa diserang selama masih online.",
      concept: "Kontrol Akses API dan Inventaris Aset",
      conceptNote:
        "API tanpa kontrol akses yang efektif bisa membocorkan data jutaan pelanggan (lihat Topik 00 · studi kasus Optus 2022).",
    },
    {
      id: "wa-3",
      type: "single",
      prompt:
        "Benar atau salah: Pada 2015, penyerang membobol database pelanggan TalkTalk lewat celah SQL injection pada halaman web lama warisan akuisisi Tiscali.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Menurut ICO, penyerang memakai SQL injection pada tiga halaman web lama dari infrastruktur Tiscali yang tampaknya tidak disadari TalkTalk masih ada. Data lebih dari 156.000 pelanggan diakses dan TalkTalk didenda £400.000.",
      concept: "SQL Injection di Dunia Nyata",
      conceptNote:
        "Halaman lama yang terlupakan bisa menjadi pintu SQL injection (lihat Topik 01 · studi kasus TalkTalk 2015).",
    },
    {
      id: "wa-4",
      type: "single",
      prompt: "Apa pertahanan PALING mendasar terhadap SQL injection menurut materi?",
      options: [
        "Menyembunyikan nama tabel database",
        "Memblokir kata 'SELECT' dari semua input",
        "Memakai password database yang panjang",
        "Memakai prepared statements (parameterized queries) yang memisahkan struktur query dari data",
      ],
      correct: 3,
      explanation:
        "Prepared statements membuat database memperlakukan input pengguna sebagai data, bukan bagian dari perintah SQL. Menyaring kata kunci mudah diakali, dan password database yang kuat tidak mencegah injeksi lewat aplikasi.",
      concept: "Prepared Statements",
      conceptNote:
        "Pisahkan struktur query dari data pengguna (lihat Topik 01 · Pertahanan Komprehensif: Prepared Statements dan Beyond).",
    },
    {
      id: "wa-5",
      type: "multi_select",
      prompt: "Mana saja langkah yang membantu mencegah atau membatasi dampak XSS? Pilih semua yang benar.",
      options: [
        "Melakukan output encoding sebelum menampilkan input pengguna di halaman",
        "Menerapkan Content Security Policy (CSP)",
        "Menyimpan session ID di cookie tanpa flag HttpOnly agar mudah dibaca JavaScript",
        "Memberi flag HttpOnly pada cookie sesi",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Output encoding mengubah karakter khusus HTML menjadi entitas, sehingga skrip tampil sebagai teks dan tidak dijalankan.",
        "Benar. CSP membatasi sumber skrip yang boleh dimuat browser, sehingga skrip sisipan sulit berjalan.",
        "Salah. Tanpa HttpOnly, JavaScript (termasuk skrip penyerang) bisa membaca cookie sesi.",
        "Benar. HttpOnly mencegah JavaScript membaca cookie sesi, sehingga pencurian sesi lewat XSS lebih sulit.",
      ],
      concept: "Pertahanan Berlapis XSS",
      conceptNote:
        "Encoding, CSP, dan HttpOnly saling melengkapi (lihat Topik 02 · Pertahanan XSS: Output Encoding dan Content Security Policy).",
    },
    {
      id: "wa-6",
      type: "scenario",
      prompt:
        "Studi kasus: Kamu mengelola forum. Seorang anggota melaporkan bahwa membuka satu profil membuat profilnya sendiri ikut berubah dan menambahkan pengguna lain sebagai teman. Jenis masalah apa ini dan langkah apa yang tepat?",
      options: [
        "Masalah koneksi internet; minta anggota memakai WiFi lain",
        "Stored XSS: skrip tersimpan di profil dan berjalan di browser setiap pengunjung. Hapus konten berbahaya dan terapkan output encoding",
        "Server kehabisan memori; cukup restart server",
        "Clickjacking; cukup tambahkan tombol konfirmasi",
      ],
      correct: 1,
      explanation:
        "Polanya sama dengan worm Samy di MySpace (2005): skrip yang tersimpan di profil menyalin dirinya ke profil setiap pengunjung. Dalam sekitar 20 jam lebih dari satu juta pengguna terdampak. Konten pengguna harus di-encode saat ditampilkan.",
      concept: "Stored XSS",
      conceptNote:
        "Payload tersimpan di server dan menular ke setiap pengunjung (lihat Topik 02 · studi kasus worm Samy di MySpace).",
    },
    {
      id: "wa-7",
      type: "single",
      prompt: "Header HTTP mana yang dipakai untuk mencegah halaman Anda disematkan (di-embed) dalam iframe situs lain?",
      options: [
        "Content-Type: text/html",
        "Cache-Control: no-cache",
        "X-Frame-Options (atau directive CSP frame-ancestors)",
        "Accept-Language: id",
      ],
      correct: 2,
      explanation:
        "X-Frame-Options dengan nilai DENY atau SAMEORIGIN, atau directive CSP frame-ancestors, mencegah situs lain memuat halaman Anda di dalam iframe. Itulah syarat utama clickjacking.",
      concept: "Pencegahan Clickjacking",
      conceptNote:
        "Larang halaman Anda dimuat dalam iframe situs lain (lihat Topik 03 · Pertahanan Clickjacking: X-Frame-Options dan Frame-Busting).",
    },
    {
      id: "wa-8",
      type: "single",
      prompt: "Benar atau salah: Agar serangan CSRF berhasil, penyerang harus terlebih dahulu mencuri password korban.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. CSRF memanfaatkan browser yang otomatis mengirim cookie sesi korban yang sedang login. Penyerang cukup membuat korban mengirim permintaan yang sudah disiapkan, tanpa perlu tahu password-nya.",
      concept: "Cara Kerja CSRF",
      conceptNote:
        "CSRF menyalahgunakan kepercayaan situs pada browser korban (lihat Topik 04 · Mekanisme CSRF: Memanfaatkan Kepercayaan Browser).",
    },
    {
      id: "wa-9",
      type: "multi_select",
      prompt: "Mana saja langkah yang efektif untuk mencegah CSRF? Pilih semua yang benar.",
      options: [
        "Menyertakan token anti-CSRF acak pada setiap form atau permintaan sensitif",
        "Memberi atribut SameSite pada cookie sesi",
        "Mengizinkan transfer dana lewat permintaan GET sederhana",
        "Meminta konfirmasi tambahan untuk aksi sensitif",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Server menolak permintaan yang tidak membawa token valid, dan penyerang tidak bisa menebak token tersebut.",
        "Benar. SameSite membatasi pengiriman cookie pada permintaan lintas situs.",
        "Salah. Aksi yang mengubah data lewat GET sangat mudah dipicu dari situs lain, misalnya lewat tag gambar.",
        "Benar. Konfirmasi ulang, seperti memasukkan password atau OTP, menyulitkan aksi yang dipicu diam-diam.",
      ],
      concept: "Pertahanan CSRF",
      conceptNote:
        "Token anti-CSRF dan SameSite adalah pertahanan utama (lihat Topik 04 · Pertahanan CSRF: Token Anti-CSRF dan SameSite Cookies).",
    },
    {
      id: "wa-10",
      type: "scenario",
      prompt:
        "Studi kasus: Aplikasi kampusmu punya fitur unduh dokumen dengan alamat seperti '/download?file=laporan.pdf'. Auditor memperingatkan bahwa nama file diambil langsung dari input pengguna. Perbaikan apa yang paling tepat?",
      options: [
        "Mengganti nama parameter 'file' menjadi 'doc'",
        "Menambahkan teks peringatan di halaman unduhan",
        "Mempercepat server agar unduhan lebih cepat",
        "Memakai ID dokumen (referensi tak langsung) yang dipetakan di server, plus canonicalization dan pembatasan direktori",
      ],
      correct: 3,
      explanation:
        "Jika path file dibangun dari input pengguna, urutan traversal bisa dipakai untuk keluar dari direktori yang diizinkan. Referensi tak langsung (ID yang dipetakan server) dan canonicalization dengan realpath mencegah hal itu.",
      concept: "Mencegah Path Traversal",
      conceptNote:
        "Jangan bangun path file langsung dari input (lihat Topik 05 · Pertahanan: Referensi Tak Langsung dan Canonicalization).",
    },
    {
      id: "wa-11",
      type: "single",
      prompt:
        "Kerentanan path traversal CVE-2021-41773 menyerang Apache HTTP Server 2.4.49 dan sudah dieksploitasi aktif. Apa langkah mitigasi utama menurut advisori Apache?",
      options: [
        "Memperbarui ke versi yang sudah diperbaiki (2.4.50 atau lebih baru) dan memastikan konfigurasi 'deny by default'",
        "Mengganti nama domain situs",
        "Menonaktifkan HTTPS",
        "Menambah kapasitas penyimpanan server",
      ],
      correct: 0,
      explanation:
        "Apache merilis perbaikan di 2.4.50. Konfigurasi default 'require all denied' juga membatasi berkas mana yang bisa dijangkau. Karena eksploitasi sudah terjadi, patch harus dipasang secepatnya.",
      concept: "Patch Path Traversal",
      conceptNote:
        "Celah traversal di 2.4.49 diperbaiki di 2.4.50 (lihat Topik 05 · studi kasus Apache HTTP Server 2.4.49).",
    },
    {
      id: "wa-12",
      type: "single",
      prompt: "Apa perbedaan utama Local File Inclusion (LFI) dan Remote File Inclusion (RFI)?",
      options: [
        "LFI hanya terjadi di Windows, RFI hanya di Linux",
        "LFI memuat file yang sudah ada di server, sedangkan RFI memuat file dari URL eksternal yang dikendalikan penyerang",
        "LFI dan RFI sama persis, hanya beda nama",
        "RFI hanya bisa membaca file, sedangkan LFI selalu menjalankan kode",
      ],
      correct: 1,
      explanation:
        "LFI memaksa aplikasi memuat file lokal di server. RFI memaksa aplikasi mengambil dan menjalankan file dari server luar. RFI biasanya lebih berbahaya, tetapi dapat dicegah dengan mematikan include dari URL remote.",
      concept: "LFI vs RFI",
      conceptNote:
        "Lokal versus remote menentukan sumber file yang dimuat (lihat Topik 06 · Perbedaan Krusial Antara LFI dan RFI).",
    },
    {
      id: "wa-13",
      type: "scenario",
      prompt:
        "Studi kasus: Sebuah situs WordPress UMKM memakai tema lama yang di dalamnya terdapat skrip pengubah ukuran gambar dari pihak ketiga. Pemilik situs tidak pernah memperbarui tema itu. Apa risiko dan tindakan yang paling tepat?",
      options: [
        "Tidak ada risiko karena WordPress sudah aman secara bawaan",
        "Cukup ganti warna tema agar terlihat baru",
        "Komponen pihak ketiga yang usang bisa memiliki celah file inclusion. Inventaris dan perbarui tema/plugin, atau ganti komponen yang tidak dirawat",
        "Matikan fitur komentar saja",
      ],
      correct: 2,
      explanation:
        "Kasus TimThumb (2011) menunjukkan satu skrip PHP kecil di dalam banyak tema membuat sekitar 1,2 juta situs berisiko. Infeksinya bertahan bertahun-tahun karena banyak pemilik situs tidak pernah memperbarui temanya.",
      concept: "Risiko Komponen Pihak Ketiga",
      conceptNote:
        "Celah di satu skrip kecil bisa berdampak masif (lihat Topik 06 · studi kasus TimThumb 2011).",
    },
    {
      id: "wa-14",
      type: "multi_select",
      prompt: "Mana saja praktik yang membantu mencegah atau membatasi Remote Code Execution (RCE)? Pilih semua yang benar.",
      options: [
        "Tidak pernah meneruskan input pengguna ke fungsi shell sistem",
        "Men-deserialize data apa pun yang dikirim klien demi kemudahan",
        "Menjalankan aplikasi dengan hak akses minimal di dalam container yang terisolasi",
        "Memantau dan memperbarui library pihak ketiga secara rutin",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Gunakan API bahasa pemrograman yang aman, bukan memanggil shell dengan input pengguna.",
        "Salah. Men-deserialize data tidak tepercaya adalah salah satu vektor RCE utama.",
        "Benar. Isolasi dan least privilege membatasi kerusakan jika eksekusi kode berhasil.",
        "Benar. Kasus Log4Shell menunjukkan bahwa library yang tidak terpantau bisa menjadi pintu masuk RCE.",
      ],
      concept: "Pertahanan RCE",
      conceptNote:
        "Hindari eksekusi langsung dan terapkan isolasi (lihat Topik 07 · Pertahanan: Menghindari Eksekusi Langsung dan Zero Trust).",
    },
    {
      id: "wa-15",
      type: "single",
      prompt: "Mengapa Log4Shell (CVE-2021-44228) dianggap salah satu kerentanan paling serius?",
      options: [
        "Karena hanya berdampak pada satu situs kecil",
        "Karena membutuhkan akses fisik ke server",
        "Karena hanya bisa dipakai untuk mengubah tampilan situs",
        "Karena memungkinkan eksekusi kode jarak jauh lewat library logging yang dipakai sangat luas, dengan skor CVSS 10.0",
      ],
      correct: 3,
      explanation:
        "Log4j dipakai oleh jutaan aplikasi Java. Cukup dengan membuat aplikasi mencatat string tertentu, penyerang dapat menjalankan kode di server. Apache memberinya skor CVSS 10.0, nilai tertinggi.",
      concept: "Log4Shell",
      conceptNote:
        "Komponen tersembunyi bisa menjadi titik kegagalan berskala internet (lihat Topik 07 · studi kasus Log4Shell).",
    },
    {
      id: "wa-16",
      type: "scenario",
      prompt:
        "Studi kasus: Startup tempatmu magang menambahkan fitur 'Tambah Webhook'. Pengguna memasukkan URL apa saja, lalu server mengirim permintaan ke URL itu. Aplikasi berjalan di cloud. Apa saran keamanan yang paling tepat?",
      options: [
        "Batasi URL dengan allowlist domain dan skema, tolak alamat internal, dan cegah server menjangkau endpoint metadata cloud",
        "Biarkan saja karena fitur ini hanya untuk pengguna terdaftar",
        "Blokir hanya alamat 127.0.0.1",
        "Tampilkan respons URL secara lengkap kepada pengguna agar transparan",
      ],
      correct: 0,
      explanation:
        "Fitur yang membuat server mengambil URL rawan SSRF. Blacklist mudah diakali, jadi pakai allowlist. Server aplikasi juga tidak boleh bisa menjangkau metadata cloud, misalnya dengan IMDSv2 dan segmentasi jaringan.",
      concept: "Mencegah SSRF",
      conceptNote:
        "Gunakan allowlist dan lindungi metadata cloud (lihat Topik 08 · Pertahanan: Allowlist, Segmentasi Jaringan, dan Metadata Hardening).",
    },
    {
      id: "wa-17",
      type: "single",
      prompt: "Dalam kasus Capital One (2019), apa yang diperoleh pelaku melalui SSRF sehingga bisa mengakses data nasabah?",
      options: [
        "Kode OTP nasabah",
        "Password Wi-Fi kantor",
        "Kredensial IAM role dari layanan metadata cloud",
        "Nomor PIN ATM",
      ],
      correct: 2,
      explanation:
        "Server dipaksa meminta data ke endpoint metadata instance dan mengembalikan kredensial IAM role. Kredensial itu dipakai untuk mengakses penyimpanan data. Lebih dari 100 juta nasabah di AS terdampak.",
      concept: "SSRF dan Metadata Cloud",
      conceptNote:
        "SSRF di cloud bisa berujung pencurian kredensial (lihat Topik 08 · studi kasus Capital One 2019).",
    },
    {
      id: "wa-18",
      type: "multi_select",
      prompt: "Mana saja yang merupakan standar atau rujukan resmi keamanan aplikasi web menurut materi? Pilih semua yang benar.",
      options: [
        "OWASP Top 10",
        "OWASP ASVS (Application Security Verification Standard)",
        "Postingan anonim di forum tanpa sumber",
        "MITRE ATT&CK",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. OWASP Top 10 adalah daftar risiko keamanan aplikasi web paling kritis yang menjadi acuan industri.",
        "Benar. ASVS menyediakan checklist verifikasi keamanan yang lebih rinci.",
        "Salah. Klaim tanpa sumber yang dapat diperiksa bukan rujukan yang andal.",
        "Benar. MITRE ATT&CK memetakan teknik yang dipakai penyerang.",
      ],
      concept: "Standar Industri",
      conceptNote:
        "Belajar keamanan web berpijak pada standar terbuka (lihat Topik 00 · Rujukan Resmi dan Standar Industri).",
    },
    {
      id: "wa-19",
      type: "scenario",
      prompt: "Studi kasus: Temanmu mengirim tautan berikut di media sosial. Apa yang sebaiknya kamu lakukan?",
      message: {
        sender: "Teman di media sosial",
        time: "Kemarin, 21.40",
        lines: [
          "WAJIB TONTON!! Video paling viral minggu ini 😱",
          "Klik tombol play di tengah halaman ya",
        ],
      },
      options: [
        "Langsung klik tombol play karena dikirim oleh teman",
        "Bagikan ke semua kontak agar mereka juga menonton",
        "Login ulang ke media sosial lewat halaman tersebut",
        "Jangan klik; tautan sensasional yang meminta klik di area tertentu bisa jadi jebakan clickjacking/likejacking. Beri tahu temanmu",
      ],
      correct: 3,
      explanation:
        "Pada kampanye 'likejacking' di Facebook (2010), tombol Like disembunyikan di atas tombol play palsu. Korban tanpa sadar menyukai dan menyebarkan tautan itu. Pesan yang tampak berasal dari teman bisa jadi akibat akunnya terjebak.",
      concept: "Likejacking",
      conceptNote:
        "Klik yang Anda lihat bisa berbeda dengan aksi yang terjadi (lihat Topik 03 · studi kasus likejacking di Facebook).",
    },
    {
      id: "wa-20",
      type: "single",
      prompt: "Pada aplikasi PHP, pengaturan apa yang secara efektif mematikan kemampuan memuat file dari URL remote (pencegahan RFI)?",
      options: [
        "display_errors = On",
        "allow_url_include = Off",
        "memory_limit = 512M",
        "max_execution_time = 0",
      ],
      correct: 1,
      explanation:
        "allow_url_include = Off mencegah fungsi include/require memuat file dari URL eksternal. Gabungkan dengan whitelist file yang boleh dimuat. Pengaturan lain tidak berkaitan dengan pencegahan RFI.",
      concept: "Hardening PHP",
      conceptNote:
        "Matikan include dari URL remote (lihat Topik 06 · Strategi Mitigasi dan Hardening Server).",
    },
  ],
};