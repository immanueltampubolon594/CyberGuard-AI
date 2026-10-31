import type { ModuleQuiz } from "./types";

// Soal materi Password Attack (slug: password-attack).
// Semua soal bersumber dari isi password.json (topik 00 sampai 06).
// Prototype: kunci jawaban ada di frontend.
export const passwordQuiz: ModuleQuiz = {
  latihan: [
    {
      id: "lat-1",
      type: "multi_select",
      prompt:
        "Pilih semua password yang rentan terhadap dictionary attack.",
      options: [
        "password123",
        "p@ssw0rd",
        "qwerty",
        "xT7#kQ9!vL2$mR4p",
      ],
      correct: [0, 1, 2],
      explanation: [
        "password123 hanya menambah angka di akhir kata umum. Penyerang sudah memprediksi variasi seperti ini.",
        "p@ssw0rd mengganti huruf dengan simbol atau angka yang mirip. Substitusi ini juga sudah masuk dalam dictionary file.",
        "qwerty adalah pola keyboard yang sangat umum dan selalu ada di dictionary file mana pun.",
      ],
    },
    {
      id: "lat-2",
      type: "multi_select",
      prompt:
        "Pilih semua langkah yang efektif untuk melawan password spraying.",
      options: [
        "Memantau percobaan login gagal secara global di semua akun",
        "Hanya mengunci akun setelah 5 kali gagal login",
        "Membatasi percobaan login per alamat IP (rate limiting)",
        "Mengaktifkan Two-Factor Authentication (2FA)",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Password spraying tersebar di banyak akun, jadi pola baru terlihat bila percobaan gagal dipantau secara global, bukan per akun.",
        "Lockout per akun saja tidak cukup. Spraying hanya mencoba satu password per akun, sehingga batas lockout tidak pernah tercapai.",
        "Rate limiting per IP memperlambat serangan sehingga tidak lagi praktis dilakukan.",
        "Dengan 2FA, password yang berhasil ditebak tetap tidak bisa dipakai login tanpa kode dari perangkatmu.",
      ],
    },
  ],

  simulasi: [
    {
      id: "sim-1",
      type: "scenario",
      prompt:
        "Kamu menerima pesan berikut di kantor. Apa yang akan kamu lakukan?",
      message: {
        sender: "IT Support (it-helpdesk@mail-example.com)",
        time: "Hari ini, 10.05",
        lines: [
          "Yth. Karyawan,",
          "Kami menemukan celah keamanan pada komputer Anda.",
          "Segera pasang security patch berikut agar akun tidak diblokir:",
          "security-patch-update.exe",
          "Terima kasih.",
        ],
      },
      options: [
        "Pasang patch tersebut secepatnya agar akun tidak diblokir",
        "Pasang patch, lalu ganti password sesudahnya",
        "Jangan pasang. Verifikasi ke tim IT lewat saluran resmi yang kamu kenal sebelum melakukan apa pun",
        "Teruskan file ke rekan kerja agar mereka juga aman",
      ],
      correct: 2,
      explanation:
        "Ini pola social engineering: penyerang mengaku IT support dan meminta kamu memasang 'security patch' yang sebenarnya keylogger. Verifikasi dulu lewat saluran lain sebelum memasang apa pun.",
    },
    {
      id: "sim-2",
      type: "scenario",
      prompt:
        "Kamu mengetahui sebuah forum yang pernah kamu daftari mengalami kebocoran data. Password forum itu sama dengan password email dan akun e-commerce-mu. Apa tindakan terbaik?",
      message: {
        sender: "Pengumuman Forum",
        time: "Hari ini, 08.20",
        lines: [
          "Kami mengonfirmasi adanya kebocoran data pada sistem kami.",
          "Email dan password sebagian pengguna kemungkinan ikut terdampak.",
        ],
      },
      options: [
        "Tunggu dulu, selama belum ada aktivitas aneh di akunmu",
        "Ganti password forum saja karena hanya situs itu yang bocor",
        "Ganti password di semua akun yang memakai password sama dengan password unik, lalu aktifkan 2FA",
        "Tambahkan angka di akhir password lama agar berbeda",
      ],
      correct: 2,
      explanation:
        "Password yang bocor dipakai penyerang untuk credential stuffing ke situs lain. Semua akun dengan password yang sama ikut terancam, jadi ganti semuanya dengan password unik (password manager membantu) dan aktifkan 2FA.",
    },
  ],

  quiz: [
    {
      id: "q-1",
      type: "single",
      prompt:
        "Apa perbedaan utama dictionary attack dengan brute force attack?",
      options: [
        "Dictionary attack hanya bisa dilakukan secara offline",
        "Dictionary attack mencoba kata dan password umum, brute force mencoba semua kemungkinan kombinasi karakter",
        "Brute force attack hanya mencoba kata dari kamus",
        "Keduanya sama persis dan hanya berbeda nama",
      ],
      correct: 1,
      explanation:
        "Dictionary attack memakai daftar kata dan password populer. Brute force mencoba setiap kombinasi karakter secara sistematis sehingga pada akhirnya pasti berhasil, hanya soal waktu.",
      concept: "Dictionary vs Brute Force",
      conceptNote:
        "Dictionary attack menebak dari daftar kata umum, sedangkan brute force mencoba semua kombinasi karakter.",
    },
    {
      id: "q-2",
      type: "single",
      prompt:
        "Menurut materi, password manakah yang paling sulit di-brute force?",
      options: [
        "6 karakter, huruf kecil saja",
        "8 karakter, huruf kecil dan angka",
        "10 karakter, huruf, angka, dan simbol",
        "16 karakter, huruf, angka, dan simbol",
      ],
      correct: 3,
      explanation:
        "Setiap karakter tambahan meningkatkan waktu brute force secara eksponensial. Password 16 karakter dengan semua jenis karakter praktis tidak bisa di-brute force dengan teknologi saat ini.",
      concept: "Brute Force dan Panjang Password",
      conceptNote:
        "Panjang password sangat menentukan. Semakin panjang dan beragam karakternya, semakin lama waktu brute force.",
    },
    {
      id: "q-3",
      type: "single",
      prompt:
        "Mengapa password spraying sulit terdeteksi dan lolos dari account lockout?",
      options: [
        "Karena mencoba banyak password ke satu akun dengan sangat cepat",
        "Karena hanya mencoba satu password umum ke banyak akun, sehingga tiap akun hanya punya 1-2 percobaan gagal",
        "Karena memakai hash yang sudah dihitung sebelumnya",
        "Karena merekam ketikan keyboard korban",
      ],
      correct: 1,
      explanation:
        "Spraying membalik pola brute force: satu password ke banyak akun. Jumlah gagal login per akun kecil sehingga tidak memicu lockout.",
      concept: "Password Spraying",
      conceptNote:
        "Password spraying mencoba satu password umum ke banyak akun. Pantau percobaan gagal secara global, bukan hanya per akun.",
    },
    {
      id: "q-4",
      type: "single",
      prompt:
        "Credential stuffing berhasil terutama karena kebiasaan pengguna yang mana?",
      options: [
        "Memakai password yang terlalu pendek",
        "Tidak pernah membuka email",
        "Memakai password yang sama di banyak website (password reuse)",
        "Memakai komputer yang terlalu lama",
      ],
      correct: 2,
      explanation:
        "Penyerang memakai kredensial valid dari breach lain. Bila password dipakai ulang, satu kebocoran membuka akun-akun lainnya. Pertahanan utamanya adalah password unik di tiap akun dan 2FA.",
      concept: "Credential Stuffing",
      conceptNote:
        "Credential stuffing memakai password dari data breach. Gunakan password unik di setiap akun dan aktifkan 2FA.",
    },
    {
      id: "q-5",
      type: "single",
      prompt:
        "Apa yang sebaiknya dilakukan website agar rainbow table attack tidak efektif?",
      options: [
        "Menyimpan password dalam plain text agar mudah dicek",
        "Memakai MD5 tanpa salt karena cepat",
        "Memakai salt dan algoritma hash yang kuat dan lambat seperti bcrypt atau Argon2",
        "Membatasi password maksimal 8 karakter",
      ],
      correct: 2,
      explanation:
        "Salt membuat setiap hash unik sehingga penyerang harus membuat rainbow table terpisah untuk tiap salt. Algoritma lambat seperti bcrypt atau Argon2 juga memperberat brute force. MD5 tanpa salt adalah praktik yang sangat buruk.",
      concept: "Rainbow Table dan Salt",
      conceptNote:
        "Rainbow table dilemahkan oleh salt dan algoritma hash yang kuat dan lambat (bcrypt, Argon2, PBKDF2).",
    },
    {
      id: "q-6",
      type: "single",
      prompt:
        "Hardware keylogger tidak bisa dideteksi antivirus. Cara apa yang tepat untuk mengantisipasinya di komputer publik?",
      options: [
        "Cukup scan dengan antivirus terbaru",
        "Periksa secara fisik apakah ada perangkat tambahan di antara keyboard dan komputer, dan aktifkan 2FA",
        "Ketik password lebih cepat",
        "Gunakan mode incognito di browser",
      ],
      correct: 1,
      explanation:
        "Hardware keylogger adalah perangkat fisik, jadi harus diperiksa secara fisik. Dengan 2FA, password yang terekam tetap tidak cukup untuk login. Lebih baik hindari komputer publik untuk akun sensitif.",
      concept: "Keylogging",
      conceptNote:
        "Keylogger merekam ketikan keyboard. Waspadai lampiran dan software tak tepercaya, periksa perangkat fisik, dan gunakan 2FA.",
    },
  ],
};