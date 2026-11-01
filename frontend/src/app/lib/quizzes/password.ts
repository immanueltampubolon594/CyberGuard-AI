import type { ModuleQuiz } from "./types";

// Soal materi Password Attack (slug: password-attack).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada password.json (Topik 00 sampai 06).
export const passwordQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "pw-1",
      type: "single",
      prompt: "Kapan sebuah password attack disebut serangan OFFLINE?",
      options: [
        "Ketika penyerang mencoba login berulang kali ke halaman login asli sebuah website",
        "Ketika penyerang menelepon korban dan meminta password secara langsung",
        "Ketika penyerang sudah mencuri database hash password lalu menebaknya di komputernya sendiri",
        "Ketika korban sedang tidak terhubung ke internet",
      ],
      correct: 2,
      explanation:
        "Serangan offline terjadi setelah database hash dicuri. Penyerang menebak di komputernya sendiri tanpa batasan dari website, sehingga rate limiting, CAPTCHA, dan penguncian akun tidak berpengaruh. Yang menghambat hanya kekuatan password dan lambatnya algoritma hash.",
      concept: "Serangan Online vs Offline",
      conceptNote:
        "Online = menebak lewat halaman login asli; offline = menebak hash curian di komputer penyerang (lihat Topik 00 · Serangan Online vs Offline: Apa Bedanya?).",
    },
    {
      id: "pw-2",
      type: "single",
      prompt:
        "Benar atau salah: Menurut pedoman NIST 2025, password cukup diganti jika ada bukti bahwa password tersebut bocor, bukan diganti rutin setiap 90 hari.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. NIST SP 800-63B-4 menyatakan website tidak boleh mewajibkan penggantian password secara berkala. Penggantian wajib hanya jika ada bukti kebocoran. Kewajiban ganti rutin terbukti membuat orang hanya mengubah satu angka di belakang password lama.",
      concept: "Aturan Password NIST 2025",
      conceptNote:
        "NIST 2025: panjang minimal 15, tanpa aturan komposisi wajib, tanpa ganti berkala, wajib cek blocklist (lihat Topik 00 · Aturan Password Terbaru menurut NIST (2025)).",
    },
    {
      id: "pw-3",
      type: "multi_select",
      prompt: "Mana saja yang SESUAI dengan pedoman password NIST SP 800-63-4 (2025)? Pilih semua yang benar.",
      options: [
        "Password yang dipakai tanpa MFA minimal 15 karakter",
        "Website wajib memaksa pengguna memakai huruf besar, angka, dan simbol",
        "Password baru harus dicek terhadap daftar password umum atau yang pernah bocor (blocklist)",
        "Website harus mengizinkan password manager dan fitur isi-otomatis",
        "Website sebaiknya memakai pertanyaan keamanan seperti 'nama ibu kandung'",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Untuk password yang dipakai sendirian, NIST menetapkan minimal 15 karakter (minimal 8 jika dipakai bersama MFA).",
        "Salah. NIST justru melarang aturan komposisi wajib karena mendorong pola mudah ditebak seperti 'Password1!'.",
        "Benar. Password baru wajib dibandingkan dengan blocklist berisi password umum, mudah ditebak, atau yang pernah bocor.",
        "Benar. Website wajib mengizinkan password manager dan autofill, dan sebaiknya mengizinkan paste.",
        "Salah. NIST melarang pertanyaan keamanan (knowledge-based authentication) karena jawabannya mudah dicari atau ditebak.",
      ],
      concept: "Aturan Password NIST 2025",
      conceptNote:
        "NIST 2025: panjang minimal 15, tanpa aturan komposisi wajib, tanpa ganti berkala, wajib cek blocklist (lihat Topik 00 · Aturan Password Terbaru menurut NIST (2025)).",
    },
    {
      id: "pw-4",
      type: "single",
      prompt: "Password mana yang PALING tahan terhadap dictionary attack?",
      options: [
        "Bismillah2024!",
        "Qwerty123!",
        "p@ssw0rd123",
        "kopi-jendela-sepatu-awan-biru",
      ],
      correct: 3,
      explanation:
        "Passphrase dari lima kata acak sangat panjang dan tidak membentuk frasa umum. Tiga pilihan lain adalah kata atau pola populer ('bismillah', 'qwerty', 'password') yang hanya diberi tambahan angka atau substitusi simbol. Variasi seperti itu sudah diprediksi oleh aturan (rules) di alat penebak password.",
      concept: "Passphrase vs Password Umum",
      conceptNote:
        "Panjang dan keacakan lebih penting daripada simbol; kata populer + angka tetap mudah ditebak (lihat Topik 01 · Cara Melindungi Diri dari Dictionary Attack).",
    },
    {
      id: "pw-5",
      type: "scenario",
      prompt: "Studi kasus: Rekan kerjamu mengirim pesan berikut. Tanggapan apa yang paling tepat?",
      message: {
        sender: "Dimas (Rekan Kerja)",
        time: "Hari ini, 09.12",
        lines: [
          "Bro, sistem minta ganti password. Aku pakai: NamaKantor2025!",
          "Sudah ada huruf besar, angka, sama simbol. Aman banget kan?",
        ],
      },
      options: [
        "Aman, karena sudah memenuhi semua jenis karakter",
        "Aman asal tidak diberitahu ke orang lain",
        "Kurang aman, tapi cukup diganti jadi NamaKantor2026! tahun depan",
        "Belum aman: nama kantor + tahun + tanda seru adalah pola yang sudah diprediksi penyerang; lebih baik passphrase acak yang panjang dan aktifkan MFA",
      ],
      correct: 3,
      explanation:
        "Nama perusahaan ditambah tahun adalah salah satu pola favorit dalam dictionary attack dan password spraying. Memenuhi semua jenis karakter tidak berarti kuat. Mengganti angka tahun setiap tahun juga pola yang mudah ditebak. Solusinya: passphrase acak yang panjang, unik, dan dilindungi MFA.",
      concept: "Pola Password yang Mudah Ditebak",
      conceptNote:
        "Nama kantor, kota, bulan, atau tahun + simbol adalah pola yang ada di setiap daftar tebakan (lihat Topik 01 · Contoh Password yang Rentan terhadap Dictionary Attack).",
    },
    {
      id: "pw-6",
      type: "single",
      prompt: "Pasangan alat dan jenis serangan mana yang TEPAT?",
      options: [
        "Hashcat untuk menebak login online, Hydra untuk memecahkan hash offline",
        "Hydra untuk menebak login online, Hashcat untuk memecahkan hash offline",
        "Keduanya hanya bisa dipakai untuk serangan online",
        "Keduanya adalah antivirus untuk mendeteksi keylogger",
      ],
      correct: 1,
      explanation:
        "Hydra mengirim tebakan login satu per satu ke server (online). Hashcat dan John the Ripper bekerja di komputer penyerang untuk memecahkan hash yang sudah dicuri (offline), dengan kecepatan jauh lebih tinggi.",
      concept: "Alat Dictionary Attack",
      conceptNote:
        "Hydra = online ke halaman login; Hashcat/John the Ripper = offline terhadap hash curian (lihat Topik 01 · Bagaimana Dictionary Attack Bekerja?).",
    },
    {
      id: "pw-7",
      type: "single",
      prompt:
        "Password 8 karakter yang hanya berisi huruf kecil (a–z) dan angka (0–9) memiliki berapa kemungkinan kombinasi?",
      options: [
        "Sekitar 2,8 triliun (36 pangkat 8)",
        "Sekitar 218 triliun (62 pangkat 8)",
        "Sekitar 309 juta (26 pangkat 6)",
        "Tak terhingga, sehingga tidak mungkin di-brute force",
      ],
      correct: 0,
      explanation:
        "Huruf kecil (26) + angka (10) = 36 karakter. Untuk 8 posisi: 36^8 ≈ 2,8 triliun. Angka 218 triliun adalah untuk 62 karakter (huruf besar + kecil + angka). Jika disimpan dengan MD5, 2,8 triliun kombinasi bisa dicoba semua oleh satu GPU modern dalam sekitar 17 detik.",
      concept: "Menghitung Kombinasi Brute Force",
      conceptNote:
        "Jumlah kombinasi = (jumlah jenis karakter) pangkat (panjang password) (lihat Topik 02 · Berapa Lama Waktu untuk Brute Force Password?).",
    },
    {
      id: "pw-8",
      type: "scenario",
      prompt: "Studi kasus: Baca berita berikut. Kesimpulan mana yang paling tepat?",
      message: {
        sender: "Berita Teknologi",
        time: "Hari ini",
        lines: [
          "Dua aplikasi, A dan B, sama-sama kebocoran database hash password.",
          "Aplikasi A menyimpan password dengan MD5. Aplikasi B memakai bcrypt.",
          "Rina memakai password acak 8 karakter (huruf besar, kecil, angka) yang sama di kedua aplikasi.",
        ],
      },
      options: [
        "Password Rina sama kuatnya di kedua aplikasi karena password-nya sama",
        "Password Rina lebih cepat terbongkar dari aplikasi B karena bcrypt sudah usang",
        "Dari aplikasi A, password Rina bisa terbongkar dalam hitungan menit; dari aplikasi B butuh puluhan tahun dengan satu GPU — tapi Rina tetap harus segera mengganti password di semua akun",
        "Rina tidak perlu khawatir karena password-nya acak",
      ],
      correct: 2,
      explanation:
        "Dengan satu RTX 4090, MD5 bisa dicoba sekitar 164 miliar kali per detik, sedangkan bcrypt hanya sekitar 184 ribu. Untuk 218 triliun kombinasi, itu berarti sekitar 22 menit (MD5) dibanding sekitar 38 tahun (bcrypt). Karena password yang sama dipakai di dua tempat, kebocoran dari aplikasi A sudah cukup untuk membahayakan akun lain. Rina harus segera mengganti password dan membuat password berbeda untuk setiap akun.",
      concept: "Pengaruh Algoritma Hash",
      conceptNote:
        "Cara website menyimpan password (MD5 vs bcrypt/Argon2id) mengubah waktu brute force hingga jutaan kali (lihat Topik 02 · Berapa Lama Waktu untuk Brute Force Password?).",
    },
    {
      id: "pw-9",
      type: "single",
      prompt:
        "Benar atau salah: Menambahkan satu tanda seru di akhir kata umum (misalnya 'Password1!') membuat password menjadi jauh lebih kuat.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Menambahkan simbol atau angka di akhir kata umum adalah pola yang sudah diprediksi oleh aturan (rules) di alat penebak password. Yang benar-benar menambah kekuatan adalah panjang dan keacakan.",
      concept: "Panjang Lebih Penting daripada Simbol",
      conceptNote:
        "Satu simbol di akhir kata umum hampir tidak menambah kekuatan; tambahkan panjang dan keacakan (lihat Topik 02 · Cara Melindungi Diri dari Brute Force Attack).",
    },
    {
      id: "pw-10",
      type: "scenario",
      prompt: "Studi kasus: Kamu staf IT dan menerima peringatan berikut. Tindakan mana yang PALING tepat?",
      message: {
        sender: "Sistem Monitoring Server",
        time: "Hari ini, 02.47",
        lines: [
          "PERINGATAN: 18.420 percobaan login gagal ke Remote Desktop (RDP)",
          "Akun target: Administrator",
          "Sumber: ratusan alamat IP dari berbagai negara",
          "Status layanan RDP: terbuka ke internet, tanpa MFA",
        ],
      },
      options: [
        "Biarkan saja, karena login masih gagal semua",
        "Tutup akses RDP dari internet, alihkan akses jarak jauh lewat VPN dengan MFA, ganti password admin menjadi panjang dan unik, serta aktifkan penguncian akun",
        "Blokir satu alamat IP yang paling sering mencoba, lalu lanjut bekerja",
        "Ganti nama akun Administrator saja tanpa perubahan lain",
      ],
      correct: 1,
      explanation:
        "Ini brute force online terhadap layanan RDP yang terbuka ke internet, salah satu pintu masuk ransomware yang paling sering dimanfaatkan. Karena serangan datang dari ratusan IP, memblokir satu IP tidak cukup. Langkah paling efektif adalah menutup RDP dari internet, memakai VPN + MFA, memperkuat password admin, dan menerapkan penguncian akun.",
      concept: "Mengamankan Layanan Remote",
      conceptNote:
        "Jangan buka RDP/SSH langsung ke internet; pakai VPN, MFA, password panjang, dan penguncian akun (lihat Topik 02 · Cara Melindungi Diri dari Brute Force Attack).",
    },
    {
      id: "pw-11",
      type: "single",
      prompt: "Apa ciri utama password spraying dibandingkan brute force biasa?",
      options: [
        "Mencoba ribuan password ke satu akun secepat mungkin",
        "Mencuri password dengan merekam ketikan keyboard",
        "Memakai pasangan email dan password dari kebocoran situs lain",
        "Mencoba satu atau sedikit password umum ke banyak akun secara perlahan agar tidak memicu penguncian akun",
      ],
      correct: 3,
      explanation:
        "Password spraying membalik cara brute force: bukan banyak password ke satu akun, melainkan satu password umum ke banyak akun. Karena setiap akun hanya mendapat sedikit percobaan, penguncian akun tidak terpicu. CISA menyebutnya metode 'low-and-slow'.",
      concept: "Definisi Password Spraying",
      conceptNote:
        "Spraying = satu password umum ke banyak akun, pelan-pelan, untuk menghindari lockout (lihat Topik 03 · Bagaimana Password Spraying Bekerja?).",
    },
    {
      id: "pw-12",
      type: "scenario",
      prompt: "Studi kasus: Kamu melihat ringkasan log login kantor berikut. Apa yang sedang terjadi dan apa respons terbaiknya?",
      message: {
        sender: "Log Login Email Kantor",
        time: "Senin, 01.00–05.00",
        lines: [
          "800 akun berbeda masing-masing mendapat 1 percobaan login gagal",
          "Password yang dicoba di semua akun: Welcome2025",
          "Percobaan datang dari 300 alamat IP berbeda",
          "2 akun berhasil login, keduanya tidak memakai MFA",
        ],
      },
      options: [
        "Password spraying; segera reset password 2 akun yang jebol, keluarkan sesinya, wajibkan MFA untuk semua akun, dan tambahkan password umum ke blocklist",
        "Gangguan server biasa; tidak perlu tindakan",
        "Brute force ke satu akun; cukup kunci akun yang paling sering gagal",
        "Credential stuffing; cukup minta semua karyawan memakai antivirus",
      ],
      correct: 0,
      explanation:
        "Satu password yang sama dicoba ke ratusan akun, masing-masing hanya sekali, dari banyak IP adalah pola khas password spraying. Pola ini hanya terlihat jika login gagal dipantau secara global. Respons yang tepat: amankan akun yang jebol, wajibkan MFA tanpa pengecualian, dan blokir password umum lewat blocklist.",
      concept: "Mendeteksi Password Spraying",
      conceptNote:
        "Spraying terlihat dari pola global: password sama, banyak akun, banyak IP, sedikit percobaan per akun (lihat Topik 03 · Cara Melindungi Diri dari Password Spraying).",
    },
    {
      id: "pw-13",
      type: "multi_select",
      prompt: "Pelajaran apa saja yang bisa diambil dari kasus Microsoft vs Midnight Blizzard (2024)? Pilih semua yang benar.",
      options: [
        "MFA harus diwajibkan tanpa pengecualian, termasuk untuk akun uji coba",
        "Membatasi percobaan login per alamat IP saja sudah cukup",
        "Akun lama dan akun uji yang tidak dipakai perlu didata dan dihapus",
        "Hak akses aplikasi dan akun perlu dibatasi agar satu akun jebol tidak membuka seluruh sistem",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Pintu masuknya adalah akun uji lama yang tidak memakai MFA.",
        "Salah. Penyerang menyebar percobaan lewat jaringan proxy rumahan dengan banyak IP, sehingga pembatasan per IP saja tidak cukup.",
        "Benar. Akun lama yang terlupakan menjadi celah karena tidak diawasi dan tidak dilindungi.",
        "Benar. Dari akun uji, penyerang menemukan aplikasi lama dengan akses tinggi lalu memakainya untuk membaca email korporat.",
      ],
      concept: "Kasus Microsoft (2024)",
      conceptNote:
        "Satu akun uji lama tanpa MFA cukup untuk membuka email korporat (lihat Topik 03 · studi kasus Microsoft).",
    },
    {
      id: "pw-14",
      type: "single",
      prompt: "Mengapa credential stuffing sangat efektif?",
      options: [
        "Karena penyerang bisa menebak semua password dengan GPU",
        "Karena website selalu menyimpan password tanpa hash",
        "Karena banyak orang memakai ulang password yang sama di banyak akun",
        "Karena credential stuffing hanya menyerang akun tanpa password",
      ],
      correct: 2,
      explanation:
        "Credential stuffing memakai pasangan email dan password yang benar dari kebocoran situs lain. Survei Google/Harris Poll (2019) menemukan sekitar dua dari tiga orang memakai ulang password. Tingkat keberhasilannya 0,1–2%, tetapi dari jutaan kredensial hasilnya ribuan akun.",
      concept: "Password Reuse",
      conceptNote:
        "Satu password dipakai di banyak akun = satu kebocoran membuka semuanya (lihat Topik 04 · Bagaimana Credential Stuffing Bekerja?).",
    },
    {
      id: "pw-15",
      type: "scenario",
      prompt: "Studi kasus: Temanmu mengirim pesan berikut. Saran mana yang paling tepat?",
      message: {
        sender: "Sari",
        time: "Hari ini, 19.40",
        lines: [
          "Akun belanja online-ku tiba-tiba dipakai orang buat beli voucher game!",
          "Padahal password-ku panjang lho, 14 karakter.",
          "Password itu juga kupakai di Gmail sama Instagram sih...",
        ],
      },
      options: [
        "Kemungkinan besar bukan peretasan; cukup hubungi toko online",
        "Kemungkinan credential stuffing: segera ganti password Gmail lebih dulu, lalu buat password unik untuk setiap akun, aktifkan MFA, dan cek kebocoran di Have I Been Pwned",
        "Cukup ganti password akun belanja online saja",
        "Tambahkan simbol di akhir password lama lalu pakai lagi di semua akun",
      ],
      correct: 1,
      explanation:
        "Password panjang tidak membantu jika dipakai di banyak tempat dan salah satunya bocor. Email harus diamankan lebih dulu karena dipakai untuk reset password akun lain. Setelah itu, buat password unik per akun (idealnya dengan password manager), aktifkan MFA, dan cek kebocoran.",
      concept: "Respons Credential Stuffing",
      conceptNote:
        "Amankan email dulu, lalu password unik per akun + MFA (lihat Topik 04 · Cara Melindungi Diri dari Credential Stuffing).",
    },
    {
      id: "pw-16",
      type: "multi_select",
      prompt: "Mana saja pernyataan yang BENAR tentang kasus 23andMe (2023)? Pilih semua yang benar.",
      options: [
        "Sekitar 14.000 akun dibobol dengan credential stuffing",
        "Penyerang memecahkan seluruh database hash 23andMe dengan rainbow table",
        "Lewat fitur DNA Relatives, data sekitar 6,9 juta orang ikut terekspos",
        "Setelah kejadian ini, 23andMe mewajibkan verifikasi dua langkah",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Sekitar 14.000 akun dibobol karena pemiliknya memakai ulang password yang bocor dari situs lain.",
        "Salah. Tidak ada database hash yang dipecahkan; penyerang login dengan password yang benar dari kebocoran lain.",
        "Benar. Fitur berbagi kerabat membuat data jutaan orang lain bisa dilihat dari akun yang jebol.",
        "Benar. 23andMe mewajibkan verifikasi dua langkah setelah kebocoran terungkap.",
      ],
      concept: "Kasus 23andMe (2023)",
      conceptNote:
        "Password yang dipakai ulang oleh sebagian kecil pengguna bisa membuka data jutaan orang (lihat Topik 04 · studi kasus 23andMe).",
    },
    {
      id: "pw-17",
      type: "single",
      prompt: "Apa fungsi utama salt dalam penyimpanan password?",
      options: [
        "Membuat hash setiap pengguna unik walaupun password-nya sama, sehingga rainbow table siap pakai tidak berguna",
        "Mengenkripsi password agar bisa dibuka kembali oleh admin",
        "Menyembunyikan password dengan mengubahnya menjadi tanda bintang",
        "Membuat password lebih mudah diingat pengguna",
      ],
      correct: 0,
      explanation:
        "Salt adalah data acak yang unik untuk setiap password dan ditambahkan sebelum di-hash. Dua pengguna dengan password '123456' akan punya hash berbeda, sehingga tabel yang dihitung sebelumnya tidak bisa dipakai. Salt tidak perlu dirahasiakan dan disimpan di samping hash. NIST mensyaratkan salt minimal 32 bit.",
      concept: "Fungsi Salt",
      conceptNote:
        "Salt = data acak unik per password agar hash berbeda dan rainbow table tidak efektif (lihat Topik 05 · Hash, Salt, dan Rainbow Table: Contoh Sederhana).",
    },
    {
      id: "pw-18",
      type: "single",
      prompt: "Menurut OWASP, algoritma mana yang menjadi pilihan utama untuk menyimpan password saat ini?",
      options: ["MD5", "SHA-1", "Argon2id", "Base64"],
      correct: 2,
      explanation:
        "OWASP merekomendasikan Argon2id (memori minimal 19 MiB, 2 iterasi) sebagai pilihan utama, lalu scrypt, bcrypt untuk sistem lama, dan PBKDF2 dengan 600.000 iterasi jika diwajibkan standar FIPS. MD5 dan SHA-1 terlalu cepat sehingga mudah di-brute force, sedangkan Base64 bukan hash sama sekali: hanya pengodean yang bisa dibalik.",
      concept: "Algoritma Penyimpanan Password",
      conceptNote:
        "Pakai algoritma lambat: Argon2id > scrypt > bcrypt; jangan MD5/SHA-1 (lihat Topik 05 · Cara Melindungi Diri dari Rainbow Table Attack).",
    },
    {
      id: "pw-19",
      type: "multi_select",
      prompt: "Kamu curiga laptopmu terkena keylogger. Langkah mana saja yang TEPAT? Pilih semua yang benar.",
      options: [
        "Putuskan koneksi internet laptop itu lalu pindai dengan antivirus yang diperbarui",
        "Segera ganti semua password penting dari laptop yang dicurigai itu juga",
        "Ganti password akun penting dari perangkat lain yang bersih",
        "Aktifkan MFA dan keluarkan semua sesi login yang aktif di setiap akun",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Memutus internet menghentikan pengiriman data ke penyerang, lalu pemindaian membantu menemukan program jahat.",
        "Salah. Jika laptop masih terinfeksi, password baru yang kamu ketik juga akan terekam.",
        "Benar. Ganti password dari perangkat lain yang bersih agar password baru tidak ikut tercuri.",
        "Benar. MFA membuat password curian saja tidak cukup, dan mengeluarkan sesi aktif mengusir penyerang yang sudah masuk.",
      ],
      concept: "Respons Insiden Keylogger",
      conceptNote:
        "Putus internet, pindai, lalu ganti password dari perangkat LAIN yang bersih (lihat Topik 06 · Jika Curiga Perangkat Terkena Keylogger).",
    },
    {
      id: "pw-20",
      type: "scenario",
      prompt: "Studi kasus: Kamu sedang di lab komputer umum dan perlu mengecek mobile banking lewat browser. Kamu melihat hal berikut. Apa tindakan paling tepat?",
      message: {
        sender: "Pengamatanmu",
        lines: [
          "Ada colokan kecil tambahan di antara kabel keyboard dan port komputer.",
          "Komputer lain di ruangan itu tidak memakai colokan seperti itu.",
        ],
      },
      options: [
        "Login saja memakai keyboard virtual agar aman",
        "Cabut colokannya lalu login seperti biasa",
        "Login lalu langsung ganti password setelahnya dari komputer yang sama",
        "Jangan login di komputer itu; laporkan ke pengelola, dan gunakan ponsel pribadi dengan data seluler untuk mengakses akun",
      ],
      correct: 3,
      explanation:
        "Colokan asing di antara keyboard dan komputer bisa berupa hardware keylogger, yang tidak terdeteksi antivirus. Keyboard virtual tidak menjamin aman karena perangkat itu mungkin bukan satu-satunya alat perekam. Mengganti password dari komputer yang sama juga akan terekam. Pilihan paling aman adalah tidak login, melapor, dan memakai perangkat pribadi.",
      concept: "Hardware Keylogger",
      conceptNote:
        "Hindari login akun sensitif di komputer umum; waspadai perangkat asing di antara keyboard dan komputer (lihat Topik 06 · Jenis-jenis Keylogger).",
    },
  ],
};