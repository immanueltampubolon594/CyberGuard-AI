import type { ModuleQuiz } from "./types";

// Soal materi Account Takeover (slug: account-takeover).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada account-takeover.json (Topik 00 sampai 05).
export const accountTakeoverQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "at-1",
      type: "single",
      prompt: "Apa perbedaan utama account takeover (ATO) dengan phishing menurut materi?",
      options: [
        "ATO hanya terjadi pada akun bank, sedangkan phishing hanya pada email",
        "Phishing mencuri kredensial, sedangkan ATO adalah tahap lanjutan ketika penyerang sudah masuk dan mengendalikan akun",
        "ATO selalu memerlukan malware, sedangkan phishing tidak",
        "Tidak ada perbedaan; keduanya istilah yang sama",
      ],
      correct: 1,
      explanation:
        "Phishing adalah salah satu cara mencuri kredensial. Account takeover terjadi ketika penyerang benar-benar masuk, mengganti pengaturan, dan memakai akun itu untuk tujuan jahat.",
      concept: "Definisi Account Takeover",
      conceptNote:
        "ATO = penyerang sudah masuk dan mengambil alih kendali akun (lihat Topik 00 · Apa itu Account Takeover?).",
    },
    {
      id: "at-2",
      type: "single",
      prompt: "Menurut Verizon DBIR 2025 yang dikutip materi, penyalahgunaan kredensial (credential abuse) menjadi pintu masuk awal pada berapa persen kebocoran data?",
      options: ["2%", "5%", "50%", "22%"],
      correct: 3,
      explanation:
        "DBIR 2025 menganalisis 12.195 kebocoran terkonfirmasi dan mencatat credential abuse sebagai vektor awal pada 22% kebocoran, vektor awal yang paling sering.",
      concept: "Skala Account Takeover",
      conceptNote:
        "Banyak serangan besar berawal dari satu akun yang diambil alih (lihat Topik 00 · Apa itu Account Takeover?).",
    },
    {
      id: "at-3",
      type: "scenario",
      prompt: "Studi kasus: Kampanye UNC5537 (2024) masuk ke akun pelanggan Snowflake memakai username dan password curian hasil infostealer. Kontrol mana yang PALING mungkin menghentikan login tersebut?",
      options: [
        "Mewajibkan MFA pada semua akun, sehingga password curian saja tidak cukup untuk masuk",
        "Mengganti logo perusahaan secara berkala",
        "Menambah kapasitas server penyimpanan",
        "Mengirim newsletter keamanan sebulan sekali",
      ],
      correct: 0,
      explanation:
        "Mandiant mencatat akun-akun yang dibobol tidak dilindungi MFA, sehingga username dan password saja sudah cukup untuk masuk. MFA, terutama yang tahan phishing, membuat kredensial curian tidak berguna sendirian.",
      concept: "MFA Melawan Kredensial Curian",
      conceptNote:
        "Snowflake 2024: 165 organisasi diberi tahu, akun tanpa MFA, kredensial lama tidak diganti (lihat Topik 00 · studi kasus Snowflake).",
    },
    {
      id: "at-4",
      type: "multi_select",
      prompt: "Mana saja pernyataan yang sesuai dengan NIST SP 800-63-4 (2025) menurut materi? Pilih semua yang benar.",
      options: [
        "Password yang menjadi satu-satunya faktor login minimal 15 karakter",
        "Pengguna wajib mengganti password setiap 90 hari",
        "Password baru wajib dicek terhadap daftar password umum dan password yang sudah bocor",
        "Pengiriman kode lewat SMS atau panggilan telepon berstatus 'restricted' (dibatasi)",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Minimal 15 karakter jika password menjadi satu-satunya faktor (minimal 8 jika dipakai bersama faktor lain).",
        "Salah. NIST justru melarang memaksa penggantian password berkala; penggantian hanya wajib jika ada indikasi bocor.",
        "Benar. Setiap password baru harus dicek terhadap blocklist password umum dan password bocor.",
        "Benar. Verifikasi lewat jaringan telepon dibatasi karena rentan SIM swap dan pencurian kode.",
      ],
      concept: "Standar Autentikasi Modern",
      conceptNote:
        "Panjang > rumit, cek password bocor, SMS dibatasi, tawarkan opsi tahan phishing (lihat Topik 00 · Standar Autentikasi Modern (NIST SP 800-63-4)).",
    },
    {
      id: "at-5",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima pesan berikut dari nomor yang tidak tersimpan. Apa respons yang paling tepat?",
      message: {
        sender: "+62 812-xxxx-4471",
        time: "Hari ini, 15.58",
        lines: [
          "Halo, ini aku, teman SMA kamu. Ganti nomor nih 🙏",
          "Tadi aku nggak sengaja kirim kode 6 digit ke nomor kamu.",
          "Tolong fotoin/kirim kodenya ya, buru-buru banget!",
        ],
      },
      options: [
        "Kirim kodenya karena dia teman lama",
        "Kirim sebagian kode saja untuk berjaga-jaga",
        "Jangan kirim kode apa pun; kode itu adalah kunci WhatsApp-mu. Abaikan, verifikasi lewat kontak yang kamu kenal, dan aktifkan verifikasi dua langkah",
        "Minta dia mengirim kode yang sama ke nomor lain",
      ],
      correct: 2,
      explanation:
        "Skenario 'kesalahan kirim kode' dan 'teman butuh bantuan' adalah modus klasik. Kode yang masuk ke ponselmu adalah kode untuk mendaftarkan akun WhatsApp-mu di perangkat pelaku.",
      concept: "Modus Pencurian OTP WhatsApp",
      conceptNote:
        "Tidak ada situasi sah yang mengharuskan kamu membagikan kode verifikasi (lihat Topik 01 · Teknik Social Engineering untuk Mencuri OTP WhatsApp).",
    },
    {
      id: "at-6",
      type: "single",
      prompt:
        "Benar atau salah: Jika verifikasi dua langkah WhatsApp aktif, penyerang yang berhasil mendapatkan kode OTP tetap tidak bisa mendaftarkan akun tanpa PIN 6 digit milik pemilik akun.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. PIN verifikasi dua langkah menjadi lapisan tambahan setelah kode OTP. Tambahkan juga email agar PIN bisa di-reset; tanpa email, pemilik harus menunggu 7 hari jika lupa PIN.",
      concept: "Verifikasi Dua Langkah WhatsApp",
      conceptNote:
        "OTP + PIN 6 digit + email pemulihan (lihat Topik 01 · Cara Melindungi Diri dari WhatsApp Hijacking).",
    },
    {
      id: "at-7",
      type: "multi_select",
      prompt: "Menurut pemberitaan Republika (2019), apa saja yang terjadi pada kasus pembajakan WhatsApp Dirut Tempo? Pilih semua yang benar.",
      options: [
        "Pelaku membobol server WhatsApp untuk mengambil alih akun",
        "Pelaku mengaku sebagai teman kuliah korban",
        "Pelaku meminta korban membagikan 'kode masuk' yang diterima di ponselnya",
        "Setelah akun dikuasai, pelaku meminjam uang Rp5 juta kepada kenalan korban",
      ],
      correct: [1, 2, 3],
      explanation: [
        "Salah. Tidak ada peretasan server; pelaku cukup menipu korban agar menyerahkan kode verifikasi.",
        "Benar. Pelaku memakai nama 'Dodon' dan mengaku teman kuliah korban.",
        "Benar. Korban membagikan 'kode masuk' itu, dan akunnya berpindah ke tangan pelaku.",
        "Benar. Seorang kenalan mentransfer Rp5 juta ke rekening atas nama orang lain.",
      ],
      concept: "Alur WhatsApp Hijacking",
      conceptNote:
        "Menyamar teman → minta kode → kuasai akun → pinjam uang ke kontak (lihat Topik 01 · studi kasus WhatsApp Dirut Tempo).",
    },
    {
      id: "at-8",
      type: "scenario",
      prompt: "Studi kasus: Akun WhatsApp tantemu mengirim pesan berikut. Apa langkah yang paling tepat?",
      message: {
        sender: "Tante Rina",
        time: "Hari ini, 10.12",
        lines: [
          "Dek, tante lagi di rumah sakit, butuh bayar obat sekarang 😢",
          "Tolong transfer Rp3 juta ke rekening a.n. BUDI SANTOSO ya, nanti tante ganti.",
          "Jangan telepon dulu, HP tante lagi rusak, cuma bisa chat.",
        ],
      },
      options: [
        "Langsung transfer karena pesannya dari akun tante sendiri",
        "Jangan transfer dulu; telepon tante atau keluarga lain ke nomor yang kamu simpan untuk memastikan, karena nama rekening berbeda dan alasan 'tidak bisa ditelepon' adalah tanda bahaya",
        "Transfer setengahnya dulu sambil menunggu kabar",
        "Balas dengan meminta foto KTP tante",
      ],
      correct: 1,
      explanation:
        "Pesan dari akun orang yang kamu kenal belum tentu dikirim oleh orangnya. Rekening atas nama orang lain dan penolakan untuk ditelepon adalah ciri khas akun yang dibajak.",
      concept: "Verifikasi Lewat Saluran Lain",
      conceptNote:
        "Telepon langsung ke nomor tersimpan dan cek nama pemilik rekening (lihat Topik 01 · Langkah Cepat Jika Kontak Anda yang Dibajak).",
    },
    {
      id: "at-9",
      type: "single",
      prompt: "Mengapa akun email disebut sebagai akun paling kritis?",
      options: [
        "Karena email selalu berisi foto pribadi",
        "Karena email tidak bisa diberi password",
        "Karena hampir semua layanan memakai email untuk reset password, sehingga penguasa email bisa mengambil alih akun-akun lain",
        "Karena email hanya dipakai untuk urusan kantor",
      ],
      correct: 2,
      explanation:
        "Dengan menguasai email, penyerang bisa memakai fitur 'lupa password' di media sosial, e-commerce, hingga perbankan. Dampaknya berantai ke seluruh ekosistem digital korban.",
      concept: "Email sebagai Pusat Identitas",
      conceptNote:
        "Satu email diretas → reset password di banyak layanan (lihat Topik 02 · Dampak Email Takeover yang Merusak).",
    },
    {
      id: "at-10",
      type: "single",
      prompt: "Tanda mana yang menunjukkan penyerang bisa terus memantau email korban bahkan setelah korban mengganti password?",
      options: [
        "Kotak masuk berisi banyak email promosi",
        "Ukuran lampiran email menjadi lebih kecil",
        "Tema tampilan email berubah menjadi gelap",
        "Ada aturan forwarding baru yang mengirim salinan email ke alamat yang tidak dikenal",
      ],
      correct: 3,
      explanation:
        "Aturan forwarding atau filter yang dibuat penyerang tetap bekerja meskipun password diganti. Karena itu, periksa dan hapus aturan yang tidak dikenal saat memulihkan akun.",
      concept: "Tanda Email Diretas",
      conceptNote:
        "Periksa folder Terkirim, aturan forwarding/filter, dan notifikasi login baru (lihat Topik 02 · Tanda-tanda Akun Email Anda Sudah Diretas).",
    },
    {
      id: "at-11",
      type: "scenario",
      prompt: "Studi kasus: Kamu staf keuangan dan menerima email berikut dari alamat asli direktur keuangan. Apa yang sebaiknya dilakukan?",
      message: {
        sender: "Direktur Keuangan <cfo@perusahaan.co.id>",
        time: "Hari ini, 16.45",
        lines: [
          "Vendor kita baru ganti rekening. Mulai hari ini pembayaran dikirim ke rekening baru di bawah ini.",
          "Tolong proses sebelum jam 17.00, saya sedang rapat jadi cukup balas email ini saja.",
        ],
      },
      options: [
        "Tunda pembayaran dan konfirmasi perubahan rekening lewat telepon ke nomor direktur dan vendor yang sudah tercatat, lalu ikuti prosedur persetujuan dua orang",
        "Langsung proses karena email berasal dari alamat asli direktur",
        "Balas email untuk menanyakan apakah benar, lalu proses jika dijawab 'ya'",
        "Teruskan email ke seluruh kantor agar semua tahu",
      ],
      correct: 0,
      explanation:
        "Pada Business Email Compromise, email bisa dikirim dari akun asli yang sudah diambil alih, sehingga membalas email yang sama tidak membuktikan apa pun. Konfirmasi wajib lewat saluran lain yang sudah tercatat.",
      concept: "Business Email Compromise",
      conceptNote:
        "Perubahan rekening = konfirmasi via telepon tercatat + dual approval (lihat Topik 02 · Email Takeover di Lingkungan Kerja (Business Email Compromise)).",
    },
    {
      id: "at-12",
      type: "single",
      prompt: "Menurut laporan Cyber Safety Review Board, bagaimana Storm-0558 masuk ke kotak surat pejabat AS pada 2023?",
      options: [
        "Menebak password para pejabat satu per satu",
        "Memalsukan token login memakai kunci penandatanganan Microsoft tahun 2016 yang seharusnya sudah dipensiunkan",
        "Mencuri ponsel para pejabat secara fisik",
        "Menyuap staf IT Departemen Luar Negeri AS",
      ],
      correct: 1,
      explanation:
        "Pelaku memakai signing key akun konsumen Microsoft untuk membuat token palsu yang diterima sistem email korporat. Dampaknya 22 organisasi dan 503 akun pribadi; CSRB menyebut penyusupan ini 'dapat dicegah'.",
      concept: "Takeover Tanpa Password",
      conceptNote:
        "Token palsu dari kunci curian, terdeteksi lewat log MailItemsAccessed (lihat Topik 02 · studi kasus Storm-0558).",
    },
    {
      id: "at-13",
      type: "single",
      prompt: "Mengapa session theft (pencurian cookie) bisa melewati password yang kuat dan verifikasi dua langkah?",
      options: [
        "Karena cookie berisi salinan password dalam bentuk teks biasa",
        "Karena verifikasi dua langkah otomatis mati saat browser ditutup",
        "Karena penyerang memakai session yang sudah terautentikasi, sehingga tidak perlu melewati proses login sama sekali",
        "Karena semua website tidak memakai HTTPS",
      ],
      correct: 2,
      explanation:
        "Cookie session berfungsi seperti tiket masuk yang sudah divalidasi. Siapa pun yang memegangnya dianggap sudah login, sehingga password dan kode 2FA tidak diminta lagi.",
      concept: "Cara Kerja Session Theft",
      conceptNote:
        "Mencuri 'kunci mobil yang sudah menyala' (lihat Topik 03 · Session Theft (Cookie Stealing)).",
    },
    {
      id: "at-14",
      type: "scenario",
      prompt: "Studi kasus: Kamu mengelola channel YouTube dan menerima email berikut. Apa respons yang paling tepat?",
      message: {
        sender: "partnership@vpn-promo-global.com",
        time: "Kemarin, 21.03",
        lines: [
          "Halo kreator! Kami ingin mensponsori video Anda senilai $1.500.",
          "Silakan unduh dan coba aplikasi demo kami terlebih dahulu:",
          "📎 Demo_Setup.zip (berpassword: 2024)",
        ],
      },
      options: [
        "Unduh dan jalankan demonya agar kerja samanya cepat disetujui",
        "Matikan antivirus sementara agar file bisa dibuka",
        "Teruskan file itu ke tim editor untuk dicoba",
        "Jangan jalankan file itu; verifikasi perusahaan lewat situs resminya, pindai file dengan antivirus, dan waspadai arsip berpassword yang bisa lolos pemindaian",
      ],
      correct: 3,
      explanation:
        "Modus ini sama dengan kampanye yang dilaporkan Google TAG (2021): tawaran sponsor palsu berisi 'software demo' yang ternyata malware pencuri cookie seperti RedLine dan Vidar.",
      concept: "Infostealer dan Pass-the-Cookie",
      conceptNote:
        "Tawaran sponsor → software demo → cookie dicuri → channel dibajak (lihat Topik 03 · studi kasus kreator YouTube Google TAG).",
    },
    {
      id: "at-15",
      type: "multi_select",
      prompt: "Mana saja praktik pengelolaan session yang direkomendasikan OWASP menurut materi? Pilih semua yang benar.",
      options: [
        "Memberi atribut Secure, HttpOnly, dan SameSite pada cookie session",
        "Mengganti session ID dengan yang baru setiap kali pengguna berhasil login",
        "Membiarkan session aktif tanpa batas waktu agar pengguna nyaman",
        "Menerapkan idle timeout dan absolute timeout",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Ketiga atribut ini membatasi pengiriman dan pembacaan cookie oleh pihak yang tidak berhak.",
        "Benar. Langkah ini menutup celah session fixation.",
        "Salah. Session tanpa batas waktu memperbesar peluang cookie curian dipakai penyerang.",
        "Benar. Setiap session perlu batas waktu tidak aktif dan batas waktu mutlak.",
      ],
      concept: "Pertahanan Session untuk Pengembang",
      conceptNote:
        "Atribut cookie, regenerasi session ID, timeout, autentikasi ulang untuk aksi berisiko (lihat Topik 03 · Pertahanan Session dari Sisi Website (Untuk Pengembang)).",
    },
    {
      id: "at-16",
      type: "scenario",
      prompt: "Studi kasus: Saat makan siang, ponselmu tiba-tiba menampilkan 'No Service' meskipun sinyal biasanya penuh. Sepuluh menit kemudian kamu melihat di laptop email notifikasi 'Permintaan reset password berhasil'. Apa yang sebaiknya segera dilakukan?",
      options: [
        "Segera hubungi operator seluler lewat kanal lain untuk memastikan tidak ada penggantian SIM, lalu amankan email dan akun penting dari perangkat lain",
        "Restart ponsel lalu tunggu sampai besok",
        "Abaikan karena mungkin hanya gangguan sinyal",
        "Hapus email notifikasi tersebut agar tidak mengganggu",
      ],
      correct: 0,
      explanation:
        "SIM tiba-tiba tidak aktif yang diikuti notifikasi reset password adalah tanda kuat SIM swapping. Makin cepat bertindak, makin kecil waktu penyerang untuk mengambil alih akun-akun lain.",
      concept: "Tanda SIM Swapping",
      conceptNote:
        "SIM mati mendadak + OTP tidak masuk + notifikasi reset password (lihat Topik 04 · Tanda-tanda Anda Menjadi Target SIM Swapping).",
    },
    {
      id: "at-17",
      type: "single",
      prompt:
        "Benar atau salah: Menurut NIST SP 800-63B-4, OTP lewat SMS adalah metode verifikasi paling aman sehingga direkomendasikan untuk semua akun penting.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. NIST menetapkan verifikasi lewat jaringan telepon (termasuk SMS) sebagai metode 'restricted' karena kode dikirim ke nomor, bukan ke perangkat. Passkey, security key, atau aplikasi authenticator lebih kuat.",
      concept: "Kelemahan OTP SMS",
      conceptNote:
        "Siapa pun yang menguasai nomor ikut menerima kode (lihat Topik 04 · Mengapa NIST Membatasi OTP via SMS?).",
    },
    {
      id: "at-18",
      type: "single",
      prompt: "Menurut Departemen Kehakiman AS, bagaimana Eric Council Jr. mengambil alih nomor telepon yang terhubung ke akun X resmi SEC?",
      options: [
        "Meretas satelit operator seluler",
        "Menebak PIN kartu SIM korban",
        "Membuat kartu identitas palsu berisi data pribadi korban, lalu menyamar sebagai korban untuk menguasai nomornya",
        "Mencuri ponsel korban di kantor SEC",
      ],
      correct: 2,
      explanation:
        "Council memakai printer kartu identitas untuk membuat ID palsu dengan data korban dari komplotannya. Setelah nomor dikuasai, komplotannya masuk ke akun X SEC dan mengunggah pengumuman palsu soal ETF Bitcoin.",
      concept: "Rekayasa Sosial dalam SIM Swap",
      conceptNote:
        "Data pribadi + identitas palsu = nomor telepon berpindah tangan (lihat Topik 04 · studi kasus SIM swap akun X SEC).",
    },
    {
      id: "at-19",
      type: "single",
      prompt: "Apa yang membedakan credential stuffing dari brute force?",
      options: [
        "Credential stuffing menebak semua kombinasi huruf dan angka",
        "Credential stuffing memakai pasangan username dan password asli yang bocor dari layanan lain, bukan tebakan acak",
        "Credential stuffing hanya bisa dilakukan secara manual",
        "Credential stuffing hanya menyasar password yang lemah",
      ],
      correct: 1,
      explanation:
        "Karena kredensial yang dipakai sudah terbukti benar di layanan lain, tingkat keberhasilannya jauh lebih tinggi daripada tebakan. Password yang kuat pun tidak aman jika dipakai ulang.",
      concept: "Credential Stuffing vs Brute Force",
      conceptNote:
        "Masalah utamanya adalah password reuse, bukan password lemah (lihat Topik 05 · Mengapa Credential Stuffing Massal Sangat Merusak?).",
    },
    {
      id: "at-20",
      type: "multi_select",
      prompt: "Belajar dari kasus Roku (2024), langkah mana saja yang tepat untuk mencegah akun diambil alih lewat credential stuffing? Pilih semua yang benar.",
      options: [
        "Memakai password unik untuk setiap layanan dengan bantuan password manager",
        "Mengaktifkan verifikasi dua langkah",
        "Memakai satu password yang sangat kuat untuk semua akun",
        "Mengecek apakah email pernah muncul di kebocoran data lewat Have I Been Pwned",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Password unik membuat kebocoran di satu layanan tidak membuka akun di layanan lain.",
        "Benar. Roku sendiri mengaktifkan verifikasi dua langkah untuk semua akun setelah insiden.",
        "Salah. Pada kasus Roku, sistemnya tidak dibobol; akun diambil alih karena password yang sama dipakai di layanan lain yang bocor.",
        "Benar. Jika email muncul di kebocoran, segera ganti password terkait.",
      ],
      concept: "Mencegah Credential Stuffing",
      conceptNote:
        "Lebih dari 590 ribu akun Roku terdampak tanpa server dibobol (lihat Topik 05 · studi kasus Roku).",
    },
  ],
};