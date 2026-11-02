import type { ModuleQuiz } from "./types";

// Soal materi E-Commerce Fraud (slug: ecommerce-fraud).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada ecommerce-fraud.json (Topik 00 sampai 06).
export const ecommerceFraudQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "ef-1",
      type: "single",
      prompt: "Menurut data Indonesia Anti-Scam Centre (IASC) OJK periode November 2024–November 2025, modus penipuan apa yang PALING BANYAK dilaporkan?",
      options: [
        "Penipuan transaksi belanja",
        "Penipuan investasi",
        "Penipuan lowongan kerja",
        "Penipuan hadiah",
      ],
      correct: 0,
      explanation:
        "Penipuan transaksi belanja menempati urutan pertama dengan 64.933 laporan dan kerugian sekitar Rp1,14 triliun. Artinya, belanja online adalah titik rawan yang paling sering dialami masyarakat.",
      concept: "Skala E-Commerce Fraud",
      conceptNote:
        "Penipuan transaksi belanja adalah modus dengan laporan terbanyak di IASC (lihat Topik 00 · Apa itu E-Commerce Fraud?).",
    },
    {
      id: "ef-2",
      type: "multi_select",
      prompt: "Siapa saja yang bisa menjadi PELAKU e-commerce fraud? Pilih semua yang benar.",
      options: [
        "Penjual palsu yang tidak mengirim barang atau mengirim barang palsu",
        "Pembeli yang mengajukan refund atau chargeback palsu",
        "Pihak ketiga yang mencuri data kartu atau mengambil alih akun",
        "Hanya peretas dari luar negeri; pembeli dan penjual tidak mungkin menipu",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. Contohnya toko online palsu dan triangulation fraud.",
        "Benar. Contohnya refund fraud dan friendly fraud.",
        "Benar. Contohnya carding dan account takeover.",
        "Salah. Pembeli dan penjual pun bisa menjadi pelaku, sehingga perlindungan harus berlapis.",
      ],
      concept: "Tiga Kelompok Pelaku",
      conceptNote:
        "Pelaku bisa penjual palsu, pembeli curang, atau pihak ketiga (lihat Topik 00 · Siapa Pelakunya? Pembeli, Penjual, atau Pihak Ketiga).",
    },
    {
      id: "ef-3",
      type: "scenario",
      prompt: "Studi kasus: Kamu melihat iklan Instagram berikut. Apa yang paling tepat?",
      message: {
        sender: "iPhone Official Store ID (iklan bersponsor)",
        time: "Hari ini, 20.10",
        lines: [
          "CUCI GUDANG! iPhone terbaru diskon 60%, hanya hari ini!",
          "Order via WhatsApp, transfer ke rekening a.n. pribadi agar proses cepat.",
          "Sudah 10.000+ pembeli puas!",
        ],
      },
      options: [
        "Segera order sebelum stok habis",
        "Transfer setengah dulu sebagai tanda jadi",
        "Tolak: harga tidak wajar, urgensi 'hari ini saja', dan transfer ke rekening pribadi adalah tanda toko palsu. Beli di toko resmi dan cek rekening di cekrekening.id",
        "Minta foto barang tambahan, lalu transfer jika fotonya bagus",
      ],
      correct: 2,
      explanation:
        "Diskon tidak wajar, urgensi, testimoni yang tidak bisa diverifikasi, dan permintaan transfer ke rekening perorangan adalah gabungan tanda toko palsu. Foto barang mudah dicuri dari situs resmi, jadi tidak membuktikan apa pun.",
      concept: "Tanda Toko Online Palsu",
      conceptNote:
        "Harga terlalu murah + urgensi + rekening pribadi = tanda bahaya (lihat Topik 01 · Tanda-tanda Toko Online Palsu).",
    },
    {
      id: "ef-4",
      type: "scenario",
      prompt: "Studi kasus: Temanmu membagikan tautan berikut di grup. Bagian mana yang paling mencurigakan?",
      message: {
        sender: "Grup Kelas",
        time: "Hari ini, 12.31",
        lines: [
          "Guys ada flash sale gila!",
          "https://tokopedia-diskon-resmi.com/flash-sale",
          "Laptop gaming cuma 2 juta, buruan!",
        ],
      },
      options: [
        "Tautannya memakai HTTPS",
        "Pengirimnya teman sekelas",
        "Pesannya dikirim siang hari",
        "Nama domainnya bukan domain resmi marketplace, melainkan domain lain yang diberi tambahan kata 'diskon-resmi'",
      ],
      correct: 3,
      explanation:
        "Domain resmi marketplace tidak ditambah kata-kata seperti 'diskon' atau 'resmi' dengan tanda hubung. Domain tiruan seperti ini adalah ciri toko palsu. HTTPS juga tidak menjamin keaslian, dan teman bisa saja ikut tertipu lalu membagikannya.",
      concept: "Domain Tiruan",
      conceptNote:
        "Periksa domain dengan teliti dan cek usia domain (lihat Topik 01 · Tanda-tanda Toko Online Palsu).",
    },
    {
      id: "ef-5",
      type: "single",
      prompt:
        "Benar atau salah: Dalam kasus BogusBazaar (2024), korban hanya rugi karena barang tidak dikirim, sedangkan data kartu kredit mereka tetap aman.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Halaman pembayaran palsu di toko BogusBazaar mencuri data kartu kredit, sehingga korban rugi dua kali: uang belanja hilang dan data kartu bisa disalahgunakan. Menurut SRLabs, lebih dari 850.000 pembeli terdampak.",
      concept: "Kasus BogusBazaar",
      conceptNote:
        "Toko palsu bisa sekaligus mencuri data kartu (lihat Topik 00 · studi kasus BogusBazaar).",
    },
    {
      id: "ef-6",
      type: "single",
      prompt: "Apa yang dimaksud dengan serangan Magecart?",
      options: [
        "Penipuan dengan mengirim paket kosong",
        "Menyisipkan script pencuri data kartu ke halaman pembayaran situs yang sah",
        "Mengambil alih akun penjual di marketplace",
        "Membuat toko palsu di Instagram",
      ],
      correct: 1,
      explanation:
        "Dalam serangan Magecart, penjahat mengubah halaman checkout situs asli sehingga data kartu yang diketik pembeli ikut terkirim ke pelaku. Contohnya kasus British Airways (2018). Karena itu, pembeli bisa menjadi korban meskipun berbelanja di situs resmi ber-HTTPS.",
      concept: "Magecart",
      conceptNote:
        "Data kartu bisa dicuri langsung dari halaman pembayaran situs asli (lihat Topik 02 · Bagaimana Carding Bekerja?).",
    },
    {
      id: "ef-7",
      type: "multi_select",
      prompt: "Langkah mana saja yang TEPAT bagi konsumen untuk melindungi kartu dari carding? Pilih semua yang benar.",
      options: [
        "Mengaktifkan notifikasi transaksi secara real-time",
        "Memakai nomor kartu virtual untuk belanja online",
        "Menyimpan data kartu di semua situs agar checkout lebih cepat",
        "Memeriksa tagihan atau mutasi kartu secara berkala",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Notifikasi membuat transaksi asing cepat ketahuan.",
        "Benar. Kartu virtual bisa diberi limit dan masa berlaku, sehingga kerusakan terbatas jika datanya dicuri.",
        "Salah. Semakin banyak situs menyimpan data kartu, semakin besar risiko jika salah satunya bocor.",
        "Benar. Pemeriksaan rutin membantu mendeteksi penyalahgunaan lebih awal.",
      ],
      concept: "Melindungi Kartu",
      conceptNote:
        "Notifikasi, kartu virtual, dan pengecekan rutin (lihat Topik 02 · Cara Konsumen Melindungi Kartu Kredit dari Carding).",
    },
    {
      id: "ef-8",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima notifikasi berikut padahal tidak berbelanja apa pun. Apa yang paling tepat?",
      message: {
        sender: "Notifikasi Kartu Kredit",
        time: "Hari ini, 02.14",
        lines: [
          "Transaksi Rp15.000 di GLOBAL-DONATION.ORG berhasil.",
          "Transaksi Rp22.000 di DIGITALKEYS-STORE berhasil.",
        ],
      },
      options: [
        "Abaikan karena nominalnya kecil",
        "Tunggu tagihan bulan depan untuk memastikan",
        "Segera hubungi bank lewat nomor resmi untuk memblokir kartu dan membantah transaksi tersebut",
        "Balas notifikasi untuk menanyakan siapa yang belanja",
      ],
      correct: 2,
      explanation:
        "Pelaku carding biasanya menguji kartu curian dengan transaksi kecil, sering di situs donasi atau produk digital. Jika berhasil, transaksi besar akan menyusul. Semakin cepat kartu diblokir, semakin kecil kerugiannya.",
      concept: "Uji Coba Kartu Curian",
      conceptNote:
        "Transaksi kecil yang tidak dikenal bisa jadi uji coba kartu curian (lihat Topik 02 · Bagaimana Carding Bekerja?).",
    },
    {
      id: "ef-9",
      type: "single",
      prompt: "Apa fungsi 3-D Secure (Visa Secure / Mastercard Identity Check) pada transaksi kartu online?",
      options: [
        "Menambahkan verifikasi dari bank penerbit, misalnya OTP atau persetujuan di aplikasi bank, sehingga kartu curian lebih sulit dipakai",
        "Menyimpan data kartu di situs toko",
        "Mempercepat pengiriman barang",
        "Mengubah nomor kartu setiap bulan",
      ],
      correct: 0,
      explanation:
        "Dengan 3-D Secure, mengetahui nomor kartu, tanggal kedaluwarsa, dan CVV saja tidak cukup; pelaku juga harus lolos verifikasi bank penerbit.",
      concept: "3-D Secure",
      conceptNote:
        "3-D Secure menambah lapisan verifikasi bank penerbit (lihat Topik 02 · Cara Merchant Melindungi Diri dari Payment Fraud).",
    },
    {
      id: "ef-10",
      type: "scenario",
      prompt: "Studi kasus: Kamu menerima telepon berikut. Apa respons yang paling tepat?",
      message: {
        sender: "Telepon dari +62 21-xxxx-xxxx",
        time: "Hari ini, 10.15",
        lines: [
          "\"Halo, kami dari customer service marketplace.\"",
          "\"Akun Anda terdeteksi login dari luar kota. Untuk mengamankan,",
          "mohon sebutkan kode OTP yang baru kami kirim ke SMS Anda.\"",
        ],
      },
      options: [
        "Sebutkan kodenya karena penelepon tahu nama dan nomor Anda",
        "Tutup telepon dan jangan berikan OTP; periksa keamanan akun langsung lewat aplikasi resmi",
        "Berikan setengah kodenya saja",
        "Minta penelepon mengirim OTP lewat email",
      ],
      correct: 1,
      explanation:
        "Platform resmi tidak pernah meminta OTP lewat telepon atau chat. OTP adalah kunci terakhir akun Anda. Penelepon yang 'tahu data Anda' bisa mendapatkan data itu dari kebocoran seperti kasus Tokopedia 2020.",
      concept: "Jangan Pernah Berikan OTP",
      conceptNote:
        "OTP hanya untuk pemilik akun; CS asli tidak memintanya (lihat Topik 03 · Cara Melindungi Akun E-Commerce dari Takeover).",
    },
    {
      id: "ef-11",
      type: "single",
      prompt: "Pada kebocoran data Tokopedia (2020), password disimpan dalam bentuk hash. Mengapa kebocoran itu tetap berbahaya bagi pengguna?",
      options: [
        "Karena hash langsung menampilkan password asli",
        "Karena data kartu kredit pasti ikut bocor",
        "Karena semua saldo pengguna langsung hilang",
        "Karena email, nama, tanggal lahir, dan nomor telepon yang bocor bisa dipakai untuk phishing, penipuan mengaku CS, dan credential stuffing",
      ],
      correct: 3,
      explanation:
        "Data pribadi yang bocor membuat penipuan terasa meyakinkan karena pelaku 'tahu banyak' tentang korban. Password yang dipakai ulang di tempat lain juga berisiko. Karena itu, pakai password unik, aktifkan 2FA, dan jangan pernah memberikan OTP.",
      concept: "Kebocoran Data dan ATO",
      conceptNote:
        "Kebocoran data menjadi bahan bakar account takeover (lihat Topik 03 · studi kasus Tokopedia 2020).",
    },
    {
      id: "ef-12",
      type: "single",
      prompt:
        "Benar atau salah: Mengaktifkan 2FA dan memakai password yang berbeda untuk setiap marketplace sangat membantu mencegah account takeover.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Password unik mencegah credential stuffing dari kebocoran situs lain, dan 2FA membuat password yang bocor saja tidak cukup untuk masuk ke akun.",
      concept: "Mencegah Account Takeover",
      conceptNote:
        "Password unik + 2FA adalah dua pertahanan utama (lihat Topik 03 · Cara Melindungi Akun E-Commerce dari Takeover).",
    },
    {
      id: "ef-13",
      type: "single",
      prompt: "Dalam triangulation fraud, siapa yang biasanya menanggung kerugian terbesar ketika pemilik kartu asli mengajukan chargeback?",
      options: [
        "Penjual asli yang mengirim barang dan menerima pembayaran dari kartu curian",
        "Pelaku penipuan",
        "Kurir pengiriman",
        "Tidak ada yang dirugikan",
      ],
      correct: 0,
      explanation:
        "Penjual asli kehilangan barang yang sudah dikirim sekaligus uangnya ditarik kembali lewat chargeback. Pembeli juga bisa terseret karena alamat pengiriman mengarah kepadanya, sementara pelaku sudah menerima uang dari pembeli.",
      concept: "Dampak Triangulation Fraud",
      conceptNote:
        "Penjual asli rugi barang + uang (lihat Topik 04 · Dampak Triangulation Fraud).",
    },
    {
      id: "ef-14",
      type: "multi_select",
      prompt: "Langkah mana saja yang TEPAT bagi penjual untuk mengurangi risiko triangulation fraud? Pilih semua yang benar.",
      options: [
        "Waspadai pesanan bernilai tinggi dengan alamat pengiriman yang tidak cocok dengan pemilik kartu",
        "Menghubungi pembeli untuk memverifikasi pesanan yang mencurigakan",
        "Langsung mengirim semua pesanan mahal tanpa pengecekan agar cepat",
        "Mendokumentasikan transaksi dengan baik sebagai bukti jika terjadi chargeback",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Alamat pengiriman yang berbeda jauh untuk barang mahal perlu diperiksa lebih teliti.",
        "Benar. Verifikasi langsung membantu menyaring pesanan dari kartu curian.",
        "Salah. Pengiriman tanpa pengecekan justru memudahkan pelaku.",
        "Benar. Bukti yang lengkap dibutuhkan saat menghadapi sengketa chargeback.",
      ],
      concept: "Pencegahan Triangulation Fraud",
      conceptNote:
        "Periksa alamat, verifikasi pesanan, dan dokumentasikan transaksi (lihat Topik 04 · Cara Melindungi Diri dari Triangulation Fraud).",
    },
    {
      id: "ef-15",
      type: "single",
      prompt: "Apa yang dimaksud dengan 'wardrobing'?",
      options: [
        "Mencuri pakaian dari gudang toko",
        "Menjual pakaian bekas sebagai barang baru",
        "Membeli barang, memakainya untuk keperluan tertentu, lalu mengembalikannya dengan alasan 'tidak cocok' untuk mendapatkan refund",
        "Mengirim paket kosong kepada pembeli",
      ],
      correct: 2,
      explanation:
        "Wardrobing sering terjadi pada pakaian pesta, kamera, atau perlengkapan acara. Pembeli mendapat refund penuh, sedangkan penjual menerima barang yang sudah terpakai dan nilainya turun.",
      concept: "Wardrobing",
      conceptNote:
        "Wardrobing = pakai dulu, lalu dikembalikan (lihat Topik 05 · Jenis-Jenis Refund & Return Fraud).",
    },
    {
      id: "ef-16",
      type: "scenario",
      prompt: "Studi kasus: Kamu penjual di marketplace dan menerima komplain berikut. Bukti apa yang PALING membantumu?",
      message: {
        sender: "Komplain Pembeli",
        time: "Hari ini, 09.40",
        lines: [
          "Paket yang saya terima KOSONG, tidak ada isinya!",
          "Saya minta refund penuh.",
        ],
      },
      options: [
        "Foto produk dari supplier",
        "Rating toko yang tinggi",
        "Video saat mengemas pesanan dengan nomor pesanan terlihat, ditambah bukti serah terima dari kurir",
        "Pesan permintaan maaf kepada pembeli",
      ],
      correct: 2,
      explanation:
        "Klaim paket kosong sulit dibantah tanpa bukti. Video packing dengan nomor pesanan terlihat dan bukti serah terima dari kurir adalah bukti terkuat saat sengketa. Banyak penjual juga meminta video unboxing dari pembeli sebagai syarat komplain.",
      concept: "Dokumentasi Pengiriman",
      conceptNote:
        "Video packing + bukti kurir adalah bukti utama melawan refund fraud (lihat Topik 05 · Cara Seller Melindungi Diri dari Refund Fraud).",
    },
    {
      id: "ef-17",
      type: "single",
      prompt: "Menurut gugatan Amazon (Desember 2023), apa yang dilakukan kelompok REKK?",
      options: [
        "Menjual barang palsu di Amazon",
        "Membobol akun penjual untuk mencuri saldo",
        "Membuat toko online palsu yang meniru Amazon",
        "Menawarkan 'jasa refund' berbayar agar Amazon mengembalikan uang untuk barang yang tidak pernah dikembalikan, termasuk dengan menyuap karyawan",
      ],
      correct: 3,
      explanation:
        "REKK mengiklankan jasanya di Reddit dan Discord. Menurut Amazon, kelompok ini membobol sistem internal dan menyuap setidaknya tujuh mantan karyawan agar menyetujui refund palsu, dengan kerugian jutaan dolar.",
      concept: "Refund-as-a-Service",
      conceptNote:
        "Refund fraud bisa dijalankan sebagai bisnis terorganisir (lihat Topik 05 · studi kasus Amazon REKK).",
    },
    {
      id: "ef-18",
      type: "single",
      prompt: "Apa yang dimaksud dengan friendly fraud?",
      options: [
        "Pembeli asli yang sudah menerima barang dengan baik, tetapi mengajukan chargeback atau komplain palsu agar uangnya kembali",
        "Penipuan yang dilakukan oleh teman dekat",
        "Diskon khusus untuk pelanggan setia",
        "Pencurian data kartu oleh peretas",
      ],
      correct: 0,
      explanation:
        "Disebut 'friendly' karena pelakunya pembeli asli, bukan pencuri kartu, sehingga sulit dibedakan dari komplain yang sah. Di Indonesia, bentuknya sering berupa komplain 'barang tidak sampai' atau 'tidak sesuai' melalui platform.",
      concept: "Definisi Friendly Fraud",
      conceptNote:
        "Friendly fraud = pembeli asli menyalahgunakan mekanisme perlindungan konsumen (lihat Topik 06 · Mengapa Pembeli Melakukan Friendly Fraud?).",
    },
    {
      id: "ef-19",
      type: "scenario",
      prompt: "Studi kasus: Seorang pembeli mengajukan komplain berikut, padahal data kurir menunjukkan paket sudah diterima. Apa langkah terbaik bagi penjual?",
      message: {
        sender: "Sistem Komplain Marketplace",
        lines: [
          "Alasan: Barang tidak sampai.",
          "Data kurir: Diterima oleh pembeli, ada foto serah terima.",
          "Batas waktu tanggapan penjual: 2 x 24 jam.",
        ],
      },
      options: [
        "Langsung setujui refund agar tidak repot",
        "Abaikan komplain sampai batas waktu habis",
        "Marahi pembeli di kolom ulasan",
        "Ajukan bantahan dengan bukti: foto serah terima kurir, video packing, dan riwayat percakapan",
      ],
      correct: 3,
      explanation:
        "Tanpa bantahan, komplain cenderung dimenangkan pembeli. Dengan bukti lengkap, peluang menang jauh lebih besar. Mengabaikan komplain atau bersikap kasar justru merugikan penjual.",
      concept: "Melawan Friendly Fraud",
      conceptNote:
        "Ajukan bantahan dengan bukti lengkap, jangan langsung menerima (lihat Topik 06 · Cara Seller Melawan Friendly Fraud).",
    },
    {
      id: "ef-20",
      type: "multi_select",
      prompt: "Kebiasaan mana saja yang membantu penjual mengurangi friendly fraud? Pilih semua yang benar.",
      options: [
        "Merekam video packing dengan nomor pesanan terlihat",
        "Memakai nama tagihan (descriptor) yang jelas dan mudah dikenali pembeli",
        "Membalas pertanyaan dan keluhan pembeli dengan cepat",
        "Menolak memberikan nomor resi agar pembeli tidak bisa melacak",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. Video packing menjadi bukti kuat saat sengketa.",
        "Benar. Pembeli yang tidak mengenali nama di tagihan lebih mungkin mengajukan chargeback 'transaksi tidak dikenal'.",
        "Benar. Pembeli yang merasa didengar jarang menempuh jalur chargeback atau komplain resmi.",
        "Salah. Nomor resi justru membantu pembeli memantau paket dan menjadi bukti pengiriman.",
      ],
      concept: "Pencegahan Friendly Fraud",
      conceptNote:
        "Dokumentasi, descriptor yang jelas, dan komunikasi proaktif (lihat Topik 06 · Cara Seller Melawan Friendly Fraud).",
    },
  ],
};