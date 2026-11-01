import type { ModuleQuiz } from "./types";

// Soal materi Phishing (slug: phishing). Prototype: kunci jawaban ada di frontend.
// Soal pilot lama dipertahankan, lalu ditambah agar topik QR, spear, clone,
// dan fake login page ikut tercakup (sesuai phishing.json topik 00 sampai 07).
export const phishingQuiz: ModuleQuiz = {
  latihan: [
    {
      id: "lat-1",
      type: "multi_select",
      prompt: "Pilih semua bagian pesan yang menurutmu mencurigakan.",
      message: {
        sender: "Bank Support",
        time: "Hari ini, 14.32",
        lines: [
          "Yth. Nasabah,",
          "Akun Anda akan dinonaktifkan dalam 24 jam.",
          "Silakan klik link berikut untuk verifikasi:",
          "https://secure-verifikasi-example.com",
          "Terima kasih.",
        ],
      },
      options: [
        "Akun Anda akan dinonaktifkan dalam 24 jam.",
        "Silakan klik link berikut untuk verifikasi",
        "https://secure-verifikasi-example.com",
        "Terima kasih.",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Menggunakan urgensi: ancaman 24 jam dibuat agar kamu panik dan tidak sempat berpikir.",
        "Mengarahkan ke link: bank resmi tidak meminta verifikasi lewat tautan di pesan.",
        "Link tidak berasal dari sumber resmi: domainnya tidak cocok dengan domain bank.",
      ],
    },
    {
      id: "lat-2",
      type: "multi_select",
      prompt: "Pilih semua alamat website yang kemungkinan besar palsu.",
      options: [
        "https://www.bca.co.id",
        "https://bca-verifikasi-akun.com",
        "https://klikbca.com.secure-login.net",
        "https://www.klikbca.com",
      ],
      correct: [1, 2],
      explanation: [
        "bca-verifikasi-akun.com hanya meniru nama bank. Domain aslinya bukan milik bank.",
        "Pada klikbca.com.secure-login.net, domain sebenarnya adalah secure-login.net (bagian paling kanan sebelum garis miring).",
      ],
    },
    {
      id: "lat-3",
      type: "multi_select",
      prompt: "Pilih semua ciri email phishing pada daftar berikut.",
      options: [
        "Pengirim memakai alamat cs-bca@gmail.com",
        "Salam pembuka umum seperti 'Dear Customer'",
        "Email meminta password atau OTP",
        "Email notifikasi transaksi tanpa meminta data apa pun",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Bank tidak memakai alamat Gmail untuk komunikasi resmi. Pengirim yang tidak resmi adalah tanda pertama.",
        "Email phishing dikirim massal, jadi salamnya umum dan tidak menyebut namamu.",
        "Bank dan layanan resmi tidak pernah meminta password, PIN, atau OTP lewat email.",
      ],
    },
  ],

  simulasi: [
    {
      id: "sim-1",
      type: "scenario",
      prompt: "Bayangkan kamu menerima pesan berikut. Apa yang akan kamu lakukan?",
      message: {
        sender: "Bank Support",
        time: "Hari ini, 14.32",
        lines: [
          "Akun Anda akan dinonaktifkan dalam 24 jam.",
          "Silakan klik link berikut untuk verifikasi:",
          "https://secure-verifikasi-example.com",
          "Terima kasih.",
        ],
      },
      options: [
        "Klik link dan periksa",
        "Balas pesan untuk memastikan",
        "Jangan klik link dan verifikasi melalui kanal resmi",
        "Kirim OTP untuk menyelesaikan verifikasi",
      ],
      correct: 2,
      explanation:
        "Pesan ini adalah pola penipuan. Lakukan verifikasi melalui kanal resmi seperti website resmi atau aplikasi resmi bank, bukan lewat link di pesan.",
    },
    {
      id: "sim-2",
      type: "scenario",
      prompt: "Kamu mendapat pesan WhatsApp dari nomor tak dikenal. Apa tindakanmu?",
      message: {
        sender: "+62 812-xxxx-1234 (Kurir Paket)",
        time: "Hari ini, 09.10",
        lines: [
          "Paket Anda gagal dikirim.",
          "Unduh aplikasi kurir untuk jadwal ulang pengiriman: kurir-cepat.apk",
        ],
      },
      options: [
        "Unduh dan pasang aplikasinya",
        "Abaikan, lalu cek status paket lewat aplikasi atau website resmi ekspedisi",
        "Balas dengan nomor KTP untuk verifikasi",
        "Teruskan ke grup keluarga agar mereka waspada",
      ],
      correct: 1,
      explanation:
        "File .apk dari pesan tak dikenal adalah modus penyebaran malware. Cek status paket hanya lewat kanal resmi ekspedisi.",
    },
    {
      id: "sim-3",
      type: "scenario",
      prompt:
        "Kamu staf keuangan dan menerima email berikut. Apa yang akan kamu lakukan?",
      message: {
        sender: "Direktur Utama (direktur.utama@gmail.com)",
        time: "Hari ini, 16.45",
        lines: [
          "Saya sedang rapat di luar kota dan tidak bisa ditelepon.",
          "Tolong segera transfer Rp 75.000.000 ke rekening vendor baru untuk akuisisi rahasia.",
          "Ini confidential, jangan diskusikan dengan siapa pun.",
        ],
      },
      options: [
        "Segera transfer karena permintaan datang dari atasan",
        "Balas email dan minta nomor rekening lengkap",
        "Teruskan ke rekan lain agar mereka yang mentransfer",
        "Verifikasi ke atasan lewat telepon atau chat dengan kontak yang sudah kamu simpan sebelum melakukan apa pun",
      ],
      correct: 3,
      explanation:
        "Ini pola spear phishing: mengaku eksekutif, mendesak, dan meminta kerahasiaan. Verifikasi lewat saluran lain dengan kontak yang sudah kamu simpan, bukan kontak dari email itu.",
    },
    {
      id: "sim-4",
      type: "scenario",
      prompt:
        "Di mesin parkir sebuah mall, ada stiker QR di sebelah mesin. Apa yang sebaiknya kamu lakukan?",
      message: {
        sender: "Stiker di mesin parkir",
        lines: [
          "Bayar parkir lebih cepat, scan di sini!",
          "Diskon 20% khusus hari ini.",
        ],
      },
      options: [
        "Scan dan isi data kartu kredit karena ada diskon",
        "Jangan scan. Bayar lewat kasir, mesin resmi, atau aplikasi resmi mall, lalu laporkan stiker itu ke petugas",
        "Scan dan isi data kartu asalkan ada ikon gembok",
        "Foto QR-nya dan kirim ke grup",
      ],
      correct: 1,
      explanation:
        "QR palsu sering ditempel di tempat umum seperti mesin parkir. Pembayaran resmi tidak meminta data kartu secara manual lewat QR tempelan, dan QR menyembunyikan URL tujuannya.",
    },
  ],

  quiz: [
    {
      id: "q-1",
      type: "single",
      prompt: "Apa tujuan utama serangan phishing?",
      options: [
        "Memperlambat koneksi internet korban",
        "Mencuri informasi sensitif seperti password dan data pribadi",
        "Mempercepat kinerja perangkat korban",
        "Menambah jumlah pengikut media sosial",
      ],
      correct: 1,
      explanation:
        "Phishing menyamar sebagai pihak tepercaya untuk memancing korban menyerahkan data sensitif secara sukarela.",
      concept: "Tujuan Phishing",
      conceptNote:
        "Phishing bertujuan mencuri data sensitif dengan menyamar sebagai pihak atau organisasi tepercaya.",
    },
    {
      id: "q-2",
      type: "single",
      prompt: "Manakah ciri pesan phishing yang paling umum?",
      options: [
        "Menggunakan bahasa yang santai",
        "Menciptakan rasa urgensi dan mengarahkan ke sebuah link",
        "Selalu berisi lampiran gambar",
        "Hanya dikirim pada tengah malam",
      ],
      correct: 1,
      explanation:
        "Urgensi (batas waktu, ancaman) dan ajakan klik link adalah pola yang paling sering dipakai pelaku.",
      concept: "Ciri-ciri Phishing",
      conceptNote:
        "Waspadai pesan yang menekan dengan batas waktu dan meminta kamu mengeklik link atau membuka lampiran.",
    },
    {
      id: "q-3",
      type: "single",
      prompt:
        "Seseorang mengaku petugas bank dan meminta kode OTP lewat WhatsApp untuk 'mengamankan akun'. Apa yang benar?",
      options: [
        "Berikan OTP karena dia petugas resmi",
        "Berikan OTP, asal PIN tidak dibagikan",
        "Jangan berikan OTP kepada siapa pun dan hubungi bank lewat kanal resmi",
        "Minta dia menyebutkan nama lengkap sebagai bukti",
      ],
      correct: 2,
      explanation:
        "Petugas bank tidak pernah meminta OTP. Kode ini adalah kunci akses akunmu.",
      concept: "OTP, PIN, dan Data Pribadi",
      conceptNote:
        "Jangan pernah membagikan kode OTP, PIN, atau data pribadi kepada siapa pun, termasuk pihak yang mengaku sebagai petugas bank.",
    },
    {
      id: "q-4",
      type: "single",
      prompt:
        "Phishing yang menyasar individu tertentu dengan memakai informasi pribadi korban disebut...",
      options: ["Spear phishing", "Clone phishing", "Smishing", "Quishing"],
      correct: 0,
      explanation:
        "Spear phishing menyasar target spesifik. Clone phishing meniru email asli, smishing lewat SMS, dan quishing lewat QR code.",
      concept: "Jenis-jenis Phishing",
      conceptNote:
        "Pelajari perbedaan spear phishing, clone phishing, smishing, dan quishing pada topik 01 sampai 07.",
    },
    {
      id: "q-5",
      type: "single",
      prompt: "Cara terbaik memeriksa apakah sebuah link aman sebelum dibuka adalah...",
      options: [
        "Klik dulu, lalu lihat isinya",
        "Periksa domain dengan teliti dan buka situs resmi lewat aplikasi atau pencarian",
        "Percaya jika ada ikon gembok (HTTPS)",
        "Percaya jika link dikirim oleh teman",
      ],
      correct: 1,
      explanation:
        "Gembok HTTPS hanya berarti koneksi terenkripsi, bukan berarti situsnya terpercaya. Akun teman juga bisa diretas.",
      concept: "Memeriksa Link",
      conceptNote:
        "Periksa domain sebenarnya (bagian paling kanan sebelum garis miring) dan buka situs resmi lewat kanal yang kamu percaya.",
    },
    {
      id: "q-6",
      type: "single",
      prompt: "Mengapa QR phishing (quishing) sulit dicurigai korban?",
      options: [
        "Karena QR code selalu dibuat oleh pihak resmi",
        "Karena QR code hanya bisa dipindai di komputer",
        "Karena QR code menyembunyikan URL tujuan sehingga tidak bisa diperiksa sebelum dipindai",
        "Karena QR code tidak bisa mengarah ke website",
      ],
      correct: 2,
      explanation:
        "Berbeda dengan link teks yang bisa diperiksa dulu, QR code tidak menampilkan URL aslinya. Gunakan scanner yang menampilkan pratinjau URL dan periksa domainnya sebelum membuka.",
      concept: "QR Phishing",
      conceptNote:
        "QR code menyembunyikan URL tujuan. Periksa URL setelah scan dan waspadai QR yang ditempel sembarangan di tempat umum.",
    },
    {
      id: "q-7",
      type: "single",
      prompt:
        "Kamu menerima email yang hampir identik dengan email sebelumnya, dengan keterangan 'invoice revisi', tetapi lampirannya berbeda. Ini ciri dari...",
      options: [
        "Clone phishing",
        "Vishing",
        "Email resmi yang aman dibuka",
        "Smishing",
      ],
      correct: 0,
      explanation:
        "Clone phishing menyalin email asli, lalu mengganti link atau lampiran dengan yang berbahaya dan mengirimnya ulang dengan alasan seperti 'resending' atau 'updated'. Verifikasi ke pengirim asli lewat saluran lain.",
      concept: "Clone Phishing",
      conceptNote:
        "Clone phishing menyalin email asli lalu mengganti link atau lampiran. Bandingkan dengan email asli dan verifikasi ke pengirim.",
    },
    {
      id: "q-8",
      type: "single",
      prompt:
        "Cara paling aman untuk membuka halaman login akun penting (email atau bank) adalah...",
      options: [
        "Klik link login dari email notifikasi",
        "Klik link login dari SMS karena lebih cepat",
        "Cukup lihat bahwa halamannya terlihat mirip dengan aslinya",
        "Ketik URL resmi sendiri atau buka dari bookmark, dan aktifkan 2FA",
      ],
      correct: 3,
      explanation:
        "Fake login page bisa meniru tampilan asli secara hampir sempurna, jadi tampilan tidak bisa dijadikan acuan. URL ketikan sendiri atau bookmark menghindari domain palsu, dan 2FA melindungi bila password sudah terlanjur dicuri.",
      concept: "Fake Login Page",
      conceptNote:
        "Halaman login palsu sangat mirip aslinya. Akses lewat URL ketikan sendiri atau bookmark, periksa domain, dan aktifkan 2FA.",
    },
    // ── Soal tambahan (studi kasus & dua pilihan) ──
    {
      id: "q-9",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima telepon berikut. Apa tindakan yang paling tepat?",
      message: {
        sender: "Panggilan masuk · 021-5xxx-xxxx (mengaku CS Bank Sentosa)",
        time: "Hari ini, 19.05",
        lines: [
          "\"Selamat malam, kami dari Bank Sentosa. Ada transaksi Rp 4.800.000 dari rekening Bapak/Ibu yang mencurigakan.\"",
          "\"Untuk membatalkannya, kami sudah kirim kode 6 digit lewat SMS. Mohon sebutkan kodenya sekarang, sebelum dana terpotong.\"",
        ],
      },
      options: [
        "Menyebutkan kode agar transaksi segera dibatalkan",
        "Meminta penelepon menyebutkan nama dan nomor pegawai, lalu menyebutkan kodenya",
        "Menutup telepon, lalu menghubungi call center resmi di balik kartu ATM untuk mengecek",
        "Menyebutkan setengah kode saja supaya lebih aman",
      ],
      correct: 2,
      explanation:
        "Ini vishing (voice phishing). Kode 6 digit itu adalah OTP untuk menyetujui transaksi, bukan membatalkannya. Bank tidak pernah meminta OTP. Nama dan nomor pegawai mudah dikarang, jadi verifikasi selalu lewat nomor resmi yang kamu cari sendiri.",
      concept: "Vishing",
      conceptNote:
        "Penipu lewat telepon memakai kepanikan dan tekanan waktu. Tutup telepon dan hubungi nomor resmi (lihat Topik 03 · Smishing & Vishing).",
    },
    {
      id: "q-10",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima pesan WhatsApp berikut. Langkah pertama yang paling aman adalah...",
      message: {
        sender: "+62 812-xxxx-7781",
        time: "10.12",
        lines: [
          "Nak, ini Mama. HP Mama rusak, ini nomor baru ya.",
          "Tolong transfer Rp 2.000.000 ke rekening teman Mama dulu, buat bayar rumah sakit. Darurat, jangan telepon dulu, Mama lagi di ruang periksa.",
        ],
      },
      options: [
        "Langsung transfer karena keadaannya darurat",
        "Menelepon Mama ke nomor lama yang sudah tersimpan, atau menghubungi anggota keluarga lain",
        "Membalas chat dan meminta foto KTP Mama sebagai bukti",
        "Transfer setengahnya dulu, sisanya setelah Mama membalas",
      ],
      correct: 1,
      explanation:
        "Ciri penipuan mengaku keluarga: nomor baru, minta transfer ke rekening orang lain, dan melarang menelepon. Verifikasi lewat suara ke nomor lama. Foto KTP bisa dicuri dari internet, jadi bukan bukti.",
      concept: "Penipuan Mengaku Keluarga",
      conceptNote:
        "Verifikasi setiap permintaan uang lewat telepon ke nomor lama yang kamu simpan (lihat Topik 02 · WhatsApp Phishing).",
    },
    {
      id: "q-11",
      type: "single",
      prompt: "Benar atau salah: Website yang memiliki ikon gembok (HTTPS) di browser pasti aman dan bukan website phishing.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Gembok hanya berarti koneksi terenkripsi. Pelaku phishing juga bisa memasang HTTPS secara gratis, jadi yang harus diperiksa tetap nama domainnya.",
      concept: "HTTPS dan Gembok",
      conceptNote:
        "HTTPS bukan tanda website tepercaya. Selalu periksa domain sebenarnya (lihat Topik 05 · Fake Login Page).",
    },
    {
      id: "q-12",
      type: "single",
      prompt: "Benar atau salah: Kode verifikasi 6 digit dari WhatsApp boleh dibagikan kepada teman dekat yang memintanya.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Kode itu dipakai untuk mendaftarkan nomormu di HP lain. Siapa pun yang memintanya, termasuk akun teman yang mungkin sudah dibajak, bisa mengambil alih akun WhatsApp-mu.",
      concept: "Kode Verifikasi WhatsApp",
      conceptNote:
        "Jangan bagikan kode verifikasi kepada siapa pun dan aktifkan Verifikasi Dua Langkah (lihat Topik 02 · WhatsApp Phishing).",
    },
    {
      id: "q-13",
      type: "scenario",
      prompt: "Studi kasus: Kamu sedang menunggu paket dan menerima SMS berikut. Bagian mana yang paling kuat menunjukkan ini smishing?",
      message: {
        sender: "+62 838-xxxx-2290",
        time: "Kemarin, 13.47",
        lines: [
          "[INFO KURIR] Paket Anda tertahan karena alamat kurang lengkap.",
          "Lengkapi data & bayar biaya kirim ulang Rp 15.000 di: kurir-ekspres-id.top/bayar",
          "Paket dikembalikan ke pengirim jika tidak dibayar hari ini.",
        ],
      },
      options: [
        "SMS dikirim pada siang hari",
        "Nominal yang diminta kecil, hanya Rp 15.000",
        "Kata \"[INFO KURIR]\" di awal pesan",
        "Dikirim dari nomor pribadi dan meminta pembayaran lewat link domain tidak resmi (.top)",
      ],
      correct: 3,
      explanation:
        "Jasa kirim resmi memakai nama pengirim atau aplikasi resmi, bukan nomor pribadi, dan tidak menagih lewat link aneh. Nominal kecil justru dipakai agar korban tidak curiga, lalu data kartunya dicuri.",
      concept: "Smishing",
      conceptNote:
        "Cek status paket hanya lewat aplikasi atau situs resmi kurir, bukan dari link SMS (lihat Topik 03 · Smishing & Vishing).",
    },
  ],
};