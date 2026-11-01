import type { ModuleQuiz } from "./types";

// Soal materi Scam & Penipuan Online (slug: scam-online).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada scam-online.json (Topik 00 sampai 05).
export const scamOnlineQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "sc-1",
      type: "single",
      prompt: "Apa itu Indonesia Anti-Scam Centre (IASC)?",
      options: [
        "Aplikasi antivirus buatan pemerintah untuk ponsel",
        "Pusat pelaporan penipuan transaksi keuangan yang diluncurkan OJK bersama Satgas PASTI pada November 2024",
        "Situs untuk membeli tiket konser resmi",
        "Komunitas korban penipuan di media sosial",
      ],
      correct: 1,
      explanation:
        "IASC diluncurkan OJK bersama Satgas PASTI pada 22 November 2024 untuk menerima laporan penipuan transaksi keuangan. Sampai 30 September 2026, IASC menerima 702.342 laporan, memblokir dana korban Rp811,1 miliar, dan mengembalikan Rp207,16 miliar.",
      concept: "Data Penipuan di Indonesia",
      conceptNote:
        "IASC (iasc.ojk.go.id) adalah kanal resmi pelaporan penipuan transaksi keuangan (lihat Topik 00 · Seberapa Besar Masalahnya? Data Indonesia dan Dunia).",
    },
    {
      id: "sc-2",
      type: "single",
      prompt:
        "Benar atau salah: Uang yang sudah ditransfer ke penipu sama sekali tidak mungkin diblokir, jadi tidak ada gunanya melapor.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Jejak transaksi tidak hilang. Bank dan IASC masih bisa memblokir dana yang belum sempat dipindahkan pelaku. Karena itu, kecepatan melapor sangat menentukan: rata-rata korban di Indonesia baru melapor sekitar 12 jam setelah kejadian, padahal di negara lain 15–20 menit.",
      concept: "Lapor Secepatnya",
      conceptNote:
        "Semakin cepat lapor ke bank dan IASC, semakin besar peluang dana diblokir (lihat Topik 00 · Kalau Sudah Terlanjur Jadi Korban: Lapor Secepatnya).",
    },
    {
      id: "sc-3",
      type: "multi_select",
      prompt: "Kamu baru sadar sudah mentransfer uang ke penipu. Langkah mana saja yang TEPAT? Pilih semua yang benar.",
      options: [
        "Segera hubungi bank atau e-wallet lewat nomor resmi dan minta rekening tujuan diblokir",
        "Hapus semua percakapan dengan pelaku karena malu",
        "Laporkan ke IASC (iasc.ojk.go.id) dengan bukti transfer dan tangkapan layar percakapan",
        "Laporkan rekening pelaku ke cekrekening.id dan buat laporan polisi",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Bank dan penyedia pembayaran terhubung dengan IASC, sehingga pemblokiran bisa dimulai lebih cepat.",
        "Salah. Percakapan adalah bukti penting. Jangan dihapus.",
        "Benar. Laporan ke IASC perlu dilengkapi bukti: percakapan, bukti transfer, nomor rekening, dan nomor telepon pelaku.",
        "Benar. Laporan ke cekrekening.id membantu orang lain waspada, dan laporan polisi diperlukan untuk proses hukum.",
      ],
      concept: "Langkah Setelah Menjadi Korban",
      conceptNote:
        "Urutan: bank/e-wallet → IASC → cekrekening.id dan polisi; simpan semua bukti (lihat Topik 00 · Kalau Sudah Terlanjur Jadi Korban: Lapor Secepatnya).",
    },
    {
      id: "sc-4",
      type: "single",
      prompt:
        "Setelah menjadi korban penipuan, kamu dihubungi seseorang yang mengaku 'tim pemulihan dana' dan bisa mengembalikan uangmu asalkan membayar biaya Rp2 juta terlebih dahulu. Ini adalah…",
      options: [
        "Layanan resmi dari OJK",
        "Kesempatan bagus yang sebaiknya segera diambil",
        "Hampir pasti penipuan lanjutan; pemulihan dana resmi hanya lewat bank, IASC, dan aparat penegak hukum",
        "Prosedur wajib sebelum melapor ke polisi",
      ],
      correct: 2,
      explanation:
        "Korban penipuan sering menjadi sasaran penipuan kedua dengan iming-iming 'dana bisa kembali'. Permintaan biaya di muka adalah tanda bahayanya. Pemulihan dana resmi tidak memungut biaya seperti itu.",
      concept: "Penipuan Kedua (Recovery Scam)",
      conceptNote:
        "Waspadai pihak yang menjanjikan pemulihan dana dengan bayaran di muka (lihat Topik 00 · Kalau Sudah Terlanjur Jadi Korban: Lapor Secepatnya).",
    },
    {
      id: "sc-5",
      type: "single",
      prompt: "Menurut materi, rekening bersama (rekber) yang AMAN untuk transaksi marketplace adalah…",
      options: [
        "Fitur perlindungan pembeli bawaan platform e-commerce resmi",
        "Jasa rekber yang disarankan oleh penjual",
        "Rekening pribadi milik teman penjual",
        "Rekber mana saja asalkan punya banyak testimoni",
      ],
      correct: 0,
      explanation:
        "Modus 'rekber palsu' terjadi ketika penjual menyodorkan jasa rekber yang ternyata milik komplotannya. Yang aman adalah fitur bawaan platform, di mana uang ditahan platform sampai pembeli mengonfirmasi barang diterima.",
      concept: "Rekber Palsu",
      conceptNote:
        "Rekber aman = fitur bawaan platform, bukan jasa yang disodorkan penjual (lihat Topik 01 · Modus Operandi Penipuan Marketplace).",
    },
    {
      id: "sc-6",
      type: "scenario",
      prompt: "Studi kasus: Kamu sedang membeli HP bekas di marketplace dan penjual mengirim pesan berikut. Apa yang paling tepat?",
      message: {
        sender: "Toko Gadget Murah",
        time: "Hari ini, 14.22",
        lines: [
          "Kak, transfer langsung aja ke rekening saya ya, biar nggak kena potongan admin.",
          "Saya kasih diskon tambahan 10% deh.",
          "Barang siap kirim hari ini, sudah banyak yang order!",
        ],
      },
      options: [
        "Langsung transfer karena dapat diskon",
        "Transfer setengah dulu sebagai tanda jadi",
        "Minta nomor WhatsApp pribadi agar bisa nego lebih murah",
        "Tolak transaksi di luar platform, bayar lewat checkout resmi, dan cek rekening penjual di cekrekening.id",
      ],
      correct: 3,
      explanation:
        "Ajakan transaksi di luar platform dengan alasan 'hindari biaya admin' adalah modus paling umum. Begitu uang ditransfer langsung, Anda kehilangan perlindungan pembeli. Selalu bayar lewat sistem resmi dan cek rekening yang dicurigai di cekrekening.id.",
      concept: "Transaksi di Luar Platform",
      conceptNote:
        "Jangan mau diajak transfer langsung di luar platform meski ditawari diskon (lihat Topik 01 · Cara Melindungi Diri dari Marketplace Scam).",
    },
    {
      id: "sc-7",
      type: "single",
      prompt: "Dalam kasus penipuan tiket konser Coldplay Jakarta (2023), cara apa yang dipakai pelaku untuk meyakinkan pembeli?",
      options: [
        "Mengirim tiket asli lalu menariknya kembali",
        "Mengaku orang tuanya memiliki agen tiket dengan kuota ratusan tiket",
        "Menjual tiket lewat situs resmi promotor",
        "Mengaku sebagai petugas kepolisian",
      ],
      correct: 1,
      explanation:
        "Pelaku mengaku orang tuanya punya agen tiket dengan kuota ratusan tiket. Klaim 'akses orang dalam' seperti ini adalah tanda bahaya. Dari enam laporan polisi, tercatat sekitar 2.268 tiket fiktif dengan kerugian sekitar Rp5,1 miliar.",
      concept: "Kasus Tiket Coldplay",
      conceptNote:
        "Klaim 'kenal orang dalam' + barang langka + transaksi di luar kanal resmi = pola marketplace scam (lihat Topik 01 · studi kasus Coldplay).",
    },
    {
      id: "sc-8",
      type: "single",
      prompt: "Bagaimana aturan pajak hadiah undian yang sah di Indonesia?",
      options: [
        "Pemenang wajib mentransfer pajak 25% ke penyelenggara sebelum hadiah dikirim",
        "Hadiah undian tidak dikenai pajak sama sekali",
        "PPh final 25% dipotong langsung oleh penyelenggara, sehingga pemenang tidak perlu mentransfer apa pun",
        "Pemenang membayar pajak lewat nomor WhatsApp yang diberikan penyelenggara",
      ],
      correct: 2,
      explanation:
        "Menurut PP Nomor 132 Tahun 2000, hadiah undian dikenai PPh final 25% yang wajib dipotong oleh penyelenggara. Jika menang Rp100 juta, yang diterima Rp75 juta. Permintaan 'transfer pajak dulu' adalah tanda pasti penipuan.",
      concept: "Pajak Hadiah Undian",
      conceptNote:
        "Pajak hadiah dipotong penyelenggara, pemenang tidak pernah transfer di muka (lihat Topik 02 · Cara Melindungi Diri dari Hadiah Palsu).",
    },
    {
      id: "sc-9",
      type: "scenario",
      prompt: "Studi kasus: Ayahmu memperlihatkan video berikut di media sosial dan ingin segera mendaftar. Apa saran yang paling tepat?",
      message: {
        sender: "Video di media sosial",
        lines: [
          "[Video seorang pejabat negara berbicara]",
          "\"Pemerintah membagikan bantuan tunai Rp5 juta untuk setiap keluarga.\"",
          "Daftar sekarang lewat WhatsApp 0812-xxxx-xxxx.",
          "Biaya administrasi pencairan hanya Rp250.000.",
        ],
      },
      options: [
        "Jangan menghubungi nomor itu; bantuan resmi tidak pernah meminta biaya pendaftaran, dan cek kebenarannya di situs atau akun resmi instansi pemerintah",
        "Daftar saja karena videonya menampilkan pejabat asli",
        "Bayar biaya administrasinya karena jumlahnya kecil dibanding bantuannya",
        "Bagikan video ke grup keluarga agar semua bisa ikut mendaftar",
      ],
      correct: 0,
      explanation:
        "Ini pola yang sama dengan kasus video deepfake Presiden Prabowo yang diungkap Bareskrim pada Januari 2025: video AI menawarkan bantuan, lalu korban diminta membayar biaya administrasi. Bantuan resmi diumumkan lewat kanal resmi dan tidak memungut biaya pendaftaran.",
      concept: "Deepfake Bantuan Palsu",
      conceptNote:
        "Video tokoh yang menawarkan bantuan tetapi meminta biaya admin = penipuan, walaupun terlihat asli (lihat Topik 02 · Modus Baru: Video Deepfake Pejabat yang 'Membagikan Bantuan').",
    },
    {
      id: "sc-10",
      type: "multi_select",
      prompt: "Mana saja yang merupakan CIRI penipuan hadiah atau undian palsu? Pilih semua yang benar.",
      options: [
        "Diminta membayar 'biaya administrasi' atau 'pajak' sebelum hadiah dicairkan",
        "Pemenang diumumkan lewat situs resmi dan pajak dipotong oleh penyelenggara",
        "Dihubungi dari nomor pribadi atau nomor asing yang mengaku customer service",
        "Diminta mengisi PIN dan kode OTP di 'formulir klaim hadiah'",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Permintaan uang di muka adalah inti dari penipuan hadiah.",
        "Salah. Ini justru ciri undian resmi.",
        "Benar. Nomor 'CS' di pesan undian palsu biasanya nomor pribadi komplotan.",
        "Benar. Formulir klaim yang meminta PIN dan OTP adalah phishing untuk menguras rekening.",
      ],
      concept: "Ciri Hadiah Palsu",
      conceptNote:
        "Biaya di muka, nomor tidak resmi, dan permintaan PIN/OTP adalah tanda bahaya (lihat Topik 02 · Anatomi Penipuan Undian Berhadiah).",
    },
    {
      id: "sc-11",
      type: "single",
      prompt: "Ciri yang PASTI menunjukkan sebuah 'pekerjaan paruh waktu' adalah task scam adalah…",
      options: [
        "Pekerjaannya bisa dilakukan dari rumah",
        "Tugasnya berupa memberi 'like' atau ulasan",
        "Komunikasi dilakukan lewat WhatsApp",
        "Kamu harus menyetor uang (deposit) dulu untuk membuka misi atau mencairkan gaji",
      ],
      correct: 3,
      explanation:
        "Kerja dari rumah atau komunikasi lewat WhatsApp belum tentu penipuan. Namun pekerjaan yang mengharuskan Anda menyetor uang lebih dulu pasti penipuan. Perusahaan asli membayar karyawan, bukan meminta karyawan membayar.",
      concept: "Ciri Utama Task Scam",
      conceptNote:
        "Diminta deposit untuk dapat misi atau gaji = pasti penipuan (lihat Topik 03 · Evolusi Job Scam: Dari Biaya Travel ke Task Scam).",
    },
    {
      id: "sc-12",
      type: "scenario",
      prompt: "Studi kasus: Temanmu menerima tawaran berikut. Apa yang sebenarnya terjadi?",
      message: {
        sender: "Lowongan Kerja Online",
        time: "Kemarin, 20.10",
        lines: [
          "Mau dapat Rp500.000 tanpa kerja berat?",
          "Cukup buka rekening bank baru atas nama kamu.",
          "Lalu kirim buku tabungan, kartu ATM, dan nomor HP yang terdaftar ke kami.",
        ],
      },
      options: [
        "Ini lowongan resmi dari bank",
        "Aman, karena rekeningnya tetap atas nama sendiri",
        "Ini perekrutan money mule: rekening akan dipakai menampung uang hasil penipuan dan pemiliknya bisa ikut terseret hukum",
        "Ini program promosi pembukaan rekening",
      ],
      correct: 2,
      explanation:
        "Sindikat membutuhkan banyak rekening untuk menampung uang korban. Dalam kasus yang diungkap Polda Metro Jaya pada Juni 2024, pelaku membuka sekitar 15 rekening dan mengirimkannya ke Kamboja, lalu ditangkap. Jangan pernah menjual, meminjamkan, atau membuatkan rekening untuk orang lain.",
      concept: "Money Mule",
      conceptNote:
        "Menyerahkan rekening ke orang lain = menjadi bagian dari penipuan (lihat Topik 03 · Tanda-Tanda Lowongan Kerja Palsu).",
    },
    {
      id: "sc-13",
      type: "single",
      prompt:
        "Benar atau salah: Menurut materi, 'HRD' perusahaan besar yang menghubungi dari alamat @gmail.com adalah tanda bahaya, sehingga kamu perlu memverifikasinya lewat situs atau kontak resmi perusahaan.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Perusahaan profesional biasanya memakai email berdomain perusahaan. Email gratis dari 'HRD perusahaan besar' adalah tanda bahaya yang harus diverifikasi lewat kanal resmi, bukan lewat kontak yang diberikan si pengirim.",
      concept: "Tanda Lowongan Palsu",
      conceptNote:
        "Email gratis, proses terlalu cepat, dan permintaan uang adalah tanda bahaya (lihat Topik 03 · Tanda-Tanda Lowongan Kerja Palsu).",
    },
    {
      id: "sc-14",
      type: "scenario",
      prompt: "Studi kasus: Sepupumu baru lulus SMK dan menerima tawaran berikut. Apa respons terbaik?",
      message: {
        sender: "Agen Kerja Luar Negeri",
        time: "Hari ini, 10.05",
        lines: [
          "Dibutuhkan ADMIN / CUSTOMER SERVICE di Kamboja.",
          "Gaji Rp20 juta/bulan, tiket dan mes ditanggung.",
          "Tanpa pengalaman, cukup bisa mengetik. Berangkat minggu depan pakai visa turis.",
        ],
      },
      options: [
        "Segera berangkat sebelum kuotanya habis",
        "Bayar biaya pengurusan agar diprioritaskan",
        "Berangkat dulu, nanti urus izin kerja di sana",
        "Waspada: ini pola perekrutan scam compound/TPPO; jangan berangkat, pastikan penempatan kerja lewat jalur resmi pemerintah, dan hubungi Kemlu/KBRI bila ragu",
      ],
      correct: 3,
      explanation:
        "Gaji sangat tinggi, syarat sangat mudah, posisi 'admin/CS' di Kamboja, dan berangkat dengan visa turis adalah pola yang sama dengan perekrutan korban scam compound. Kemlu mencatat sekitar 7.600 kasus WNI terkait online scam pada 2021–2025, terbanyak di Kamboja.",
      concept: "Lowongan Luar Negeri dan TPPO",
      conceptNote:
        "Lowongan luar negeri bergaji tinggi dengan syarat mudah bisa berujung perdagangan orang (lihat Topik 03 · Evolusi Job Scam dan Topik 00 · studi kasus Scam Compound).",
    },
    {
      id: "sc-15",
      type: "single",
      prompt: "Apa ciri utama skema Ponzi?",
      options: [
        "'Keuntungan' anggota lama dibayar dari uang anggota baru, bukan dari kegiatan usaha atau trading yang nyata",
        "Keuntungan berasal dari penjualan produk yang benar-benar laku",
        "Investasi diawasi dan berizin dari OJK",
        "Nilai investasi bisa naik dan turun sesuai pasar",
      ],
      correct: 0,
      explanation:
        "Dalam skema Ponzi, tidak ada kegiatan usaha atau trading yang sebenarnya. Uang member baru dipakai membayar member lama. Skema ini runtuh ketika rekrutmen melambat. Polisi menduga DNA Pro menjalankan robot trading dengan skema seperti ini.",
      concept: "Skema Ponzi",
      conceptNote:
        "Ponzi = uang member baru membayar 'profit' member lama (lihat Topik 04 · Skema Ponzi dan Investasi Bodong Berkedok Trading).",
    },
    {
      id: "sc-16",
      type: "multi_select",
      prompt: "Sebelum berinvestasi, langkah mana saja yang TEPAT menurut materi? Pilih semua yang benar.",
      options: [
        "Cek apakah platform berizin dari OJK",
        "Cek daftar entitas ilegal yang diblokir Satgas PASTI",
        "Percaya karena dipromosikan tokoh terkenal dalam sebuah video",
        "Untuk aset kripto, cek legalitasnya di OJK karena pengawasannya beralih dari Bappebti sejak Januari 2025",
        "Percaya karena influencer memamerkan saldo dan gaya hidup mewah",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Platform yang menghimpun dana masyarakat atau menawarkan investasi wajib berizin OJK.",
        "Benar. Satgas PASTI (sebelumnya Satgas Waspada Investasi) memblokir entitas keuangan ilegal.",
        "Salah. Video tokoh terkenal bisa berupa deepfake; verifikasi lewat akun resmi.",
        "Benar. Sejak Januari 2025, pengawasan perdagangan aset kripto dipegang OJK.",
        "Salah. Pamer kekayaan (flexing) tidak membuktikan apa pun dan bisa dibiayai dari uang korban.",
      ],
      concept: "Cek Legalitas Investasi",
      conceptNote:
        "Cek izin OJK dan daftar Satgas PASTI; abaikan flexing dan promosi tokoh (lihat Topik 04 · Cara Melindungi Diri dari Investasi Bodong).",
    },
    {
      id: "sc-17",
      type: "scenario",
      prompt: "Studi kasus: Kamu diundang ke grup Telegram berikut. Apa yang paling tepat?",
      message: {
        sender: "Grup ROBOT TRADING AI VIP",
        time: "Hari ini, 21.00",
        lines: [
          "Robot AI kami profit PASTI 1% per hari, anti-loss!",
          "Sudah 5.000 member, ajak teman dapat bonus 10%.",
          "Belum terdaftar di OJK, tapi sudah terdaftar di luar negeri.",
        ],
      },
      options: [
        "Coba dengan modal kecil dulu",
        "Ajak teman agar dapat bonus untuk menutup risiko",
        "Tolak dan keluar dari grup: profit pasti tanpa risiko, bonus rekrutmen, dan tidak berizin OJK adalah ciri skema Ponzi",
        "Ikut saja karena sudah banyak member",
      ],
      correct: 2,
      explanation:
        "Profit 'pasti' tanpa risiko tidak ada dalam investasi yang sah. Penekanan pada rekrutmen anggota baru dan tidak adanya izin OJK adalah tanda klasik Ponzi, sama seperti kasus robot trading DNA Pro dengan 3.621 korban dan kerugian Rp551,7 miliar.",
      concept: "Robot Trading Ilegal",
      conceptNote:
        "High return selalu disertai high risk; 'profit pasti' + rekrutmen + tanpa izin = Ponzi (lihat Topik 04 · studi kasus DNA Pro).",
    },
    {
      id: "sc-18",
      type: "single",
      prompt: "Apa yang dimaksud dengan 'pig butchering' dalam romance scam?",
      options: [
        "Penipu langsung meminta uang pada hari pertama berkenalan",
        "Penipu membangun hubungan asmara sambil perlahan mengajak korban berinvestasi kripto di platform palsu",
        "Penipu mencuri foto korban untuk membuat akun palsu",
        "Penipu mengirim paket berisi barang palsu",
      ],
      correct: 1,
      explanation:
        "Dalam pig butchering, pelaku tidak langsung meminta uang. Ia membangun hubungan dan perlahan memperkenalkan 'peluang investasi kripto', lalu mengarahkan korban ke platform trading palsu milik sindikat. Korban 'digemukkan' dulu sebelum seluruh dananya dikuras.",
      concept: "Pig Butchering",
      conceptNote:
        "Romance scam + investasi kripto palsu = pig butchering (lihat Topik 05 · Profil Pelaku dan Proses Grooming).",
    },
    {
      id: "sc-19",
      type: "scenario",
      prompt: "Studi kasus: Bibimu sudah tiga bulan dekat dengan seseorang di Facebook dan menerima pesan berikut. Apa saran terbaik?",
      message: {
        sender: "Petugas Bea Cukai",
        time: "Hari ini, 11.30",
        lines: [
          "Paket kiriman dari Tn. Michael (USA) untuk Anda tertahan di bandara.",
          "Isi: perhiasan dan uang tunai USD 50.000.",
          "Bayar denda Rp8.500.000 hari ini agar paket bisa dilepas.",
        ],
      },
      options: [
        "Jangan bayar apa pun; ini modus 'paket tertahan di bea cukai'. Hentikan komunikasi, ceritakan ke keluarga, dan laporkan",
        "Bayar dendanya karena jumlahnya kecil dibanding isi paket",
        "Minta potongan harga denda kepada petugas",
        "Minta Tn. Michael yang membayar setengahnya",
      ],
      correct: 0,
      explanation:
        "Modus 'paket tertahan di bea cukai' adalah alasan klasik romance scam. 'Petugas' itu adalah komplotan pelaku, dan dendanya akan terus bertambah. Jangan pernah mengirim uang kepada orang yang hanya dikenal secara online, dan ceritakan kepada keluarga.",
      concept: "Modus Paket Tertahan",
      conceptNote:
        "Hadiah/paket yang harus ditebus dengan denda adalah alasan pemerasan klasik (lihat Topik 05 · Tahapan Pemerasan dan Alasan yang Digunakan).",
    },
    {
      id: "sc-20",
      type: "multi_select",
      prompt: "Pelajaran apa saja yang bisa diambil dari kasus love scam di Pekanbaru (2025)? Pilih semua yang benar.",
      options: [
        "Kenalan online yang menjanjikan hadiah tetapi meminta biaya adalah tanda bahaya besar",
        "Rekening atas nama WNI berarti transaksi pasti aman",
        "Verifikasi langsung ke bank lewat nomor resmi, bukan lewat 'petugas bank' yang dikenalkan pelaku",
        "Ceritakan kepada keluarga sebelum mengirim uang",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Korban dijanjikan hadiah 30.000 dolar AS tetapi diminta membayar 'denda' agar blokir ATM dibuka.",
        "Salah. Dua WNI justru berperan sebagai penampung uang dan 'pegawai bank' agar korban percaya.",
        "Benar. 'Pegawai bank' dalam kasus ini adalah bagian dari komplotan.",
        "Benar. Keluarga atau teman yang objektif sering melihat kejanggalan yang tidak terlihat oleh korban.",
      ],
      concept: "Kasus Love Scam Pekanbaru",
      conceptNote:
        "Romance scam sering dibantu komplotan lokal sebagai 'petugas' dan pemilik rekening penampung (lihat Topik 05 · studi kasus Pekanbaru).",
    },
  ],
};