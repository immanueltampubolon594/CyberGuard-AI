import type { ModuleQuiz } from "./types";

// Soal materi Data Breach (slug: data-breach).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada data-breach.json (Topik 00 sampai 05).
export const dataBreachQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "db-1",
      type: "single",
      prompt: "Apa fokus utama data breach yang membedakannya dari serangan ransomware menurut materi?",
      options: [
        "Data breach berfokus pada pencurian dan eksfiltrasi data, sedangkan ransomware mengenkripsi data untuk meminta tebusan",
        "Data breach selalu merusak perangkat keras korban",
        "Data breach hanya terjadi pada instansi pemerintah",
        "Data breach selalu langsung diketahui korban pada hari yang sama",
      ],
      correct: 0,
      explanation:
        "Data breach berarti data diakses, disalin, atau dicuri oleh pihak tidak berwenang. Sering kali korban baru sadar berbulan-bulan kemudian karena penyerang bergerak diam-diam.",
      concept: "Definisi Data Breach",
      conceptNote:
        "Data breach = pencurian dan eksfiltrasi data, bukan sekadar mengunci data (lihat Topik 00 · Apa itu Data Breach?).",
    },
    {
      id: "db-2",
      type: "single",
      prompt: "Menurut IBM Cost of a Data Breach edisi 2026 yang dikutip materi, berapa rata-rata biaya global satu insiden kebocoran data?",
      options: ["499 ribu dolar AS", "1 juta dolar AS", "4,99 juta dolar AS", "49,9 juta dolar AS"],
      correct: 2,
      explanation:
        "IBM mencatat rata-rata global 4,99 juta dolar AS, rekor tertinggi dan naik 12% dibanding tahun sebelumnya. Di Amerika Serikat rata-ratanya sekitar 11,5 juta dolar AS.",
      concept: "Dampak Finansial Data Breach",
      conceptNote:
        "Biaya mencakup forensik, pemulihan, notifikasi, kehilangan bisnis, dan denda (lihat Topik 00 · Mengapa Data Breach Menjadi Ancaman Global yang Kritis?).",
    },
    {
      id: "db-3",
      type: "single",
      prompt:
        "Benar atau salah: Pasal 46 UU PDP mewajibkan Pengendali Data Pribadi menyampaikan pemberitahuan tertulis paling lambat 3 x 24 jam kepada subjek data dan lembaga jika terjadi kegagalan pelindungan data pribadi.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Pemberitahuan minimal memuat data apa yang terungkap, kapan dan bagaimana kebocoran terjadi, serta upaya penanganan dan pemulihannya.",
      concept: "Kewajiban Notifikasi UU PDP",
      conceptNote:
        "3 x 24 jam ke subjek data dan lembaga (lihat Topik 00 · Kewajiban Saat Kebocoran Terjadi: UU PDP dan Respons Insiden).",
    },
    {
      id: "db-4",
      type: "scenario",
      prompt: "Studi kasus: Ibumu menerima pesan berikut. Apa saran yang paling tepat?",
      message: {
        sender: "+62 821-xxxx-3307",
        time: "Hari ini, 09.15",
        lines: [
          "Selamat pagi Ibu, kami dari bagian verifikasi BPJS Kesehatan.",
          "Data Ibu: NIK 3273xxxxxxxx0004, kartu peserta 0001xxxxxx, status pembayaran menunggak.",
          "Agar kepesertaan tidak dinonaktifkan, mohon kirim kode OTP yang baru masuk ke HP Ibu.",
        ],
      },
      options: [
        "Kirim kode OTP karena pengirim sudah tahu NIK dan nomor kartu Ibu",
        "Balas dengan foto KTP agar verifikasi lebih cepat",
        "Teruskan pesan ke grup keluarga dan tunggu pendapat orang lain",
        "Jangan kirim apa pun; data seperti NIK dan nomor kartu bisa berasal dari kebocoran. Cek status kepesertaan lewat kanal resmi BPJS yang dibuka sendiri",
      ],
      correct: 3,
      explanation:
        "Kasus dugaan kebocoran 2021 memperlihatkan data seperti nomor kartu peserta, data keluarga, dan status pembayaran bisa beredar di forum gelap. Penipu memakai data itu untuk terlihat meyakinkan.",
      concept: "Data Bocor sebagai Alat Penipuan",
      conceptNote:
        "Mengetahui data pribadi Anda bukan bukti bahwa penelepon itu resmi (lihat Topik 00 · studi kasus BPJS Kesehatan).",
    },
    {
      id: "db-5",
      type: "multi_select",
      prompt: "Mana saja temuan Verizon DBIR 2025 yang disebutkan dalam materi? Pilih semua yang benar.",
      options: [
        "Penyalahgunaan kredensial menjadi pintu masuk awal pada 22% kebocoran",
        "Semua kebocoran dilakukan peretas luar tanpa melibatkan pihak lain",
        "Eksploitasi kerentanan menjadi pintu masuk awal pada 20% kebocoran",
        "Keterlibatan pihak ketiga naik dua kali lipat menjadi 30% kebocoran",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Credential abuse adalah vektor awal paling sering (22%).",
        "Salah. Keterlibatan pihak ketiga justru mencapai 30%, dan faktor manusia serta insider juga berperan.",
        "Benar. Eksploitasi kerentanan menyumbang 20% sebagai vektor awal.",
        "Benar. Keamanan data juga bergantung pada vendor dan mitra yang diberi akses.",
      ],
      concept: "Pola Terjadinya Data Breach",
      conceptNote:
        "Kredensial, kerentanan, dan pihak ketiga (lihat Topik 00 · Bagaimana Data Breach Terjadi?).",
    },
    {
      id: "db-6",
      type: "single",
      prompt: "Mengapa kredensial login yang bocor disebut aset yang 'langsung dapat dieksekusi'?",
      options: [
        "Karena kredensial bocor otomatis menghapus akun korban",
        "Karena penyerang tidak perlu menebak; mereka sudah memegang kunci untuk masuk ke akun",
        "Karena kredensial bocor hanya bisa dipakai sekali",
        "Karena kredensial bocor selalu dienkripsi dengan aman",
      ],
      correct: 1,
      explanation:
        "Berbeda dengan data lain yang perlu diolah dulu, pasangan email dan password bisa langsung dicoba di halaman login, termasuk secara otomatis lewat credential stuffing.",
      concept: "Sifat Credential Leak",
      conceptNote:
        "Kredensial bocor = kunci pintu depan (lihat Topik 01 · Credential Leak).",
    },
    {
      id: "db-7",
      type: "single",
      prompt: "Berapa jumlah alamat email unik dalam kompilasi 'Collection #1' yang diumumkan Troy Hunt pada Januari 2019?",
      options: ["77 juta", "Sekitar 773 juta", "7,7 juta", "7,7 miliar"],
      correct: 1,
      explanation:
        "Collection #1 berisi 772.904.991 email unik dan 21.222.975 password unik, dari lebih dari 12.000 file berukuran lebih dari 87 GB. Seluruhnya dimasukkan ke Have I Been Pwned.",
      concept: "Kompilasi Kebocoran",
      conceptNote:
        "Gabungan banyak kebocoran lama dalam format siap pakai (lihat Topik 01 · studi kasus Collection #1).",
    },
    {
      id: "db-8",
      type: "multi_select",
      prompt: "Mana saja praktik penyimpanan password yang sesuai OWASP Password Storage Cheat Sheet? Pilih semua yang benar.",
      options: [
        "Menyimpan password dalam teks biasa agar mudah dipulihkan jika pengguna lupa",
        "Memakai algoritma hashing lambat seperti Argon2id sebagai pilihan pertama",
        "Memberi salt acak yang unik untuk setiap password",
        "Menambahkan pepper yang disimpan terpisah dari database sebagai lapisan tambahan",
      ],
      correct: [1, 2, 3],
      explanation: [
        "Salah. Password harus di-hash (satu arah), bukan disimpan sebagai teks biasa atau dienkripsi agar bisa dibuka.",
        "Benar. Urutannya Argon2id, lalu scrypt, bcrypt untuk sistem lama, dan PBKDF2 untuk kebutuhan FIPS-140.",
        "Benar. Salt membuat password sama menghasilkan hash berbeda dan menggagalkan rainbow table.",
        "Benar. Pepper adalah rahasia terpisah yang menambah lapisan pertahanan.",
      ],
      concept: "Penyimpanan Password yang Aman",
      conceptNote:
        "Hash lambat + salt unik + pepper opsional (lihat Topik 01 · Cara Layanan Seharusnya Menyimpan Password).",
    },
    {
      id: "db-9",
      type: "scenario",
      prompt: "Studi kasus: Kamu mengecek email di Have I Been Pwned dan ternyata email-mu muncul di kebocoran sebuah forum game lama. Kamu memakai password yang sama untuk email dan e-wallet. Apa langkah yang paling tepat?",
      options: [
        "Segera ganti password di semua layanan yang memakai password yang sama dengan password unik baru, lalu aktifkan MFA",
        "Hapus akun forum game saja, akun lain pasti aman",
        "Tunggu sampai ada transaksi mencurigakan baru bertindak",
        "Ganti password forum game dengan password yang sama seperti sebelumnya",
      ],
      correct: 0,
      explanation:
        "Selama password yang sama dipakai di tempat lain, kebocoran forum kecil bisa membuka akun email dan e-wallet. Password unik per layanan dan MFA memutus rantai kebocoran.",
      concept: "Memutus Rantai Kebocoran",
      conceptNote:
        "Password manager, MFA, dan pemantauan kebocoran (lihat Topik 01 · Strategi Pertahanan: Menghentikan Rantai Kebocoran).",
    },
    {
      id: "db-10",
      type: "single",
      prompt: "Mengapa NIK dan data KTP sangat bernilai bagi sindikat kejahatan di Indonesia?",
      options: [
        "Karena data KTP bisa ditukar langsung dengan uang di bank",
        "Karena NIK berisi password akun media sosial",
        "Karena NIK hanya dimiliki pejabat negara",
        "Karena data ini dapat dipakai menembus verifikasi KYC, misalnya untuk registrasi nomor, membuka rekening penampung, atau mengajukan pinjaman",
      ],
      correct: 3,
      explanation:
        "Data kependudukan adalah 'kunci master' untuk berbagai layanan. Sindikat memakainya untuk mendaftarkan nomor, membuka rekening, mengajukan pinjol atas nama korban, hingga membuat identitas sintetis.",
      concept: "Nilai Data Kependudukan",
      conceptNote:
        "NIK + KTP + selfie = bahan penipuan KYC (lihat Topik 02 · Mengapa Data Kependudukan Sangat Bernilai di Pasar Gelap?).",
    },
    {
      id: "db-11",
      type: "single",
      prompt:
        "Benar atau salah: Menurut Pasal 4 UU PDP, NIK secara eksplisit tercantum dalam daftar data pribadi yang bersifat spesifik.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Daftar data spesifik antara lain data kesehatan, biometrik, genetika, catatan kejahatan, data anak, dan data keuangan pribadi. NIK tidak tercantum di sana, tetapi kombinasinya dengan data lain tetap mengidentifikasi seseorang sehingga wajib dilindungi.",
      concept: "Kategori Data dalam UU PDP",
      conceptNote:
        "Data umum vs data spesifik (lihat Topik 02 · Regulasi dan Perlindungan Hukum di Indonesia).",
    },
    {
      id: "db-12",
      type: "scenario",
      prompt: "Studi kasus: Kakakmu tiba-tiba ditelepon penagih dari aplikasi pinjaman yang tidak pernah ia ajukan. Penagih menyebut NIK dan alamatnya dengan benar. Apa langkah yang paling tepat?",
      options: [
        "Bayar saja agar tidak diteror lagi",
        "Kirim foto KTP dan selfie kepada penagih untuk membuktikan bukan dia pelakunya",
        "Cek riwayat kredit lewat SLIK OJK (iDebKu), lalu laporkan ke kepolisian dan lembaga keuangan terkait agar fasilitas pinjaman itu diblokir",
        "Ganti nomor telepon dan abaikan semuanya",
      ],
      correct: 2,
      explanation:
        "Pinjaman atas nama korban adalah dampak khas kebocoran data identitas. Cek SLIK untuk melihat fasilitas apa saja yang tercatat, lalu laporkan agar bisa diblokir sebelum merusak riwayat kredit.",
      concept: "Mitigasi Penyalahgunaan Identitas",
      conceptNote:
        "Cek SLIK OJK secara berkala dan laporkan anomali (lihat Topik 02 · Regulasi dan Perlindungan Hukum di Indonesia).",
    },
    {
      id: "db-13",
      type: "multi_select",
      prompt: "Menurut pemberitaan CNBC Indonesia, mana saja fakta kasus klaim kebocoran 1,3 miliar data registrasi kartu SIM (2022)? Pilih semua yang benar.",
      options: [
        "Data yang beredar memuat NIK dan nomor ponsel",
        "Kominfo menyatakan, berdasarkan pengamatan potongan data, data itu tidak berasal dari sistemnya",
        "Sumber kebocoran dipastikan berasal dari Telkomsel dan pelakunya langsung ditangkap",
        "Keseluruhan data ditawarkan seharga 50.000 dolar AS",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Analis Vaksincom menyatakan beberapa nomor yang dicek valid.",
        "Benar. Kominfo membantah data berasal dari sistemnya.",
        "Salah. Telkomsel juga membantah, dan hingga pemberitaan itu sumber kebocoran belum terungkap.",
        "Benar. Data sekitar 87 GB itu ditawarkan seharga 50.000 dolar AS.",
      ],
      concept: "Kebocoran Data Identitas Massal",
      conceptNote:
        "Ketika sumber tidak diakui, korban sulit menuntut (lihat Topik 02 · studi kasus registrasi kartu SIM).",
    },
    {
      id: "db-14",
      type: "single",
      prompt: "Dalam model tanggung jawab bersama (shared responsibility) cloud, siapa yang bertanggung jawab mengatur izin akses bucket penyimpanan agar tidak terbuka untuk publik?",
      options: [
        "Pelanggan cloud (pemilik data), karena keamanan 'in the cloud' adalah tanggung jawab pelanggan",
        "Penyedia cloud sepenuhnya, pelanggan tidak perlu mengatur apa pun",
        "Pemerintah negara tempat pusat data berada",
        "Pengguna akhir aplikasi",
      ],
      correct: 0,
      explanation:
        "Penyedia mengamankan infrastruktur fisik dan jaringan ('security of the cloud'). Pelanggan mengatur data, enkripsi, dan izin akses ('security in the cloud').",
      concept: "Shared Responsibility Model",
      conceptNote:
        "Kesalahan konfigurasi adalah tanggung jawab pelanggan (lihat Topik 03 · Ilusi Keamanan Cloud dan Risiko Human Error).",
    },
    {
      id: "db-15",
      type: "scenario",
      prompt: "Studi kasus: Kamu menjadi admin sebuah aplikasi lama yang sudah tidak dipakai sejak tahun lalu, tetapi database-nya ternyata masih online tanpa password. Belajar dari kasus eHAC (2021), apa langkah yang paling tepat?",
      options: [
        "Biarkan saja karena aplikasinya sudah tidak dipakai",
        "Ganti nama database agar sulit ditemukan",
        "Tunggu sampai ada laporan dari peneliti keamanan",
        "Segera tutup akses publik dan aktifkan autentikasi, lalu matikan layanan dan hapus data yang tidak lagi diperlukan sesuai kebijakan",
      ],
      correct: 3,
      explanation:
        "Database eHAC versi lama berisi data sekitar 1,3 juta pengguna yang terbuka tanpa password, padahal aplikasinya sudah tidak dipakai. Sistem lama tetap harus diamankan atau dimatikan.",
      concept: "Database Terbuka di Cloud",
      conceptNote:
        "Sistem lama dan vendor pihak ketiga sering terlupakan (lihat Topik 03 · studi kasus eHAC).",
    },
    {
      id: "db-16",
      type: "scenario",
      prompt: "Studi kasus: Seorang anggota tim tanpa sengaja meng-commit file .env berisi access key cloud ke repositori GitHub publik. Apa langkah pertama yang paling tepat?",
      options: [
        "Hapus file dari commit terbaru saja, kunci otomatis aman",
        "Segera cabut (revoke) dan ganti kunci yang bocor, lalu periksa log akses untuk memastikan kunci belum disalahgunakan",
        "Ubah repositori menjadi private dan anggap masalah selesai",
        "Biarkan karena repositori jarang dikunjungi",
      ],
      correct: 1,
      explanation:
        "Begitu terunggah ke repositori publik, kunci harus dianggap sudah bocor karena riwayat commit dan salinannya bisa tetap ada. Kunci yang bocor bisa dipakai mengambil alih infrastruktur cloud atau menjalankan cryptojacking.",
      concept: "Kunci Kerajaan yang Bocor",
      conceptNote:
        "File konfigurasi dan environment variables berisi API key bisa membuka seluruh infrastruktur (lihat Topik 03 · Dampak Masif dari Eksposur Cloud Storage).",
    },
    {
      id: "db-17",
      type: "single",
      prompt: "Bagaimana tokenisasi mengurangi dampak kebocoran data kartu pembayaran?",
      options: [
        "Dengan menghapus semua data transaksi setiap hari",
        "Dengan menampilkan nomor kartu lengkap di struk",
        "Dengan mengganti nomor kartu asli (PAN) dengan token acak yang tidak berguna jika dicuri dari database merchant",
        "Dengan mengirim nomor kartu lewat email terenkripsi",
      ],
      correct: 2,
      explanation:
        "Merchant hanya menyimpan token, bukan nomor kartu asli. Jika database merchant dibobol, token itu tidak bisa dipakai bertransaksi di tempat lain.",
      concept: "Tokenisasi",
      conceptNote:
        "PCI DSS v4.0.1, tokenisasi, dan P2PE (lihat Topik 04 · Standar Keamanan Wajib: PCI-DSS dan Tokenisasi).",
    },
    {
      id: "db-18",
      type: "multi_select",
      prompt: "Menurut FTC, mana saja fakta kebocoran data Equifax (2017)? Pilih semua yang benar.",
      options: [
        "Equifax tidak pernah diperingatkan tentang kerentanan sebelum serangan",
        "Equifax memerintahkan patch tetapi tidak memeriksa apakah patch benar-benar terpasang",
        "Hanya sekitar 1.000 orang yang terdampak",
        "Nomor dan masa berlaku sekitar 209.000 kartu pembayaran ikut bocor",
      ],
      correct: [1, 3],
      explanation: [
        "Salah. Equifax sudah diperingatkan tentang kerentanan kritis itu pada Maret 2017.",
        "Benar. Perintah patch 48 jam tidak diverifikasi pelaksanaannya.",
        "Salah. Sekitar 147 juta orang terdampak.",
        "Benar. Selain itu, nomor jaminan sosial 145,5 juta orang juga bocor.",
      ],
      concept: "Kegagalan Manajemen Patch",
      conceptNote:
        "Patch diperintahkan ≠ patch terpasang; penyelesaian hingga 700 juta dolar AS (lihat Topik 04 · studi kasus Equifax).",
    },
    {
      id: "db-19",
      type: "single",
      prompt: "Seorang staf HR tanpa sengaja mengirim spreadsheet berisi gaji dan NIK seluruh karyawan ke alamat email yang salah. Termasuk kategori apa insiden ini?",
      options: [
        "Malicious insider, karena ia berniat menjual data",
        "Serangan DDoS",
        "Bukan insiden keamanan karena tidak ada peretas",
        "Negligent insider, yaitu kebocoran akibat kecerobohan tanpa niat jahat",
      ],
      correct: 3,
      explanation:
        "Negligent insider justru lebih umum dan dampaknya bisa sama besar dengan insider yang berniat jahat. Pelatihan dan kontrol seperti DLP membantu mencegahnya.",
      concept: "Malicious vs Negligent Insider",
      conceptNote:
        "Niat berbeda, dampak bisa sama besar (lihat Topik 05 · Memahami Anatomi Insider Threat: Malicious vs Negligent).",
    },
    {
      id: "db-20",
      type: "scenario",
      prompt: "Studi kasus: Seorang nasabah bursa kripto menerima telepon dari orang yang mengaku tim keamanan. Penelepon menyebut saldo dan beberapa transaksi terakhirnya dengan tepat, lalu meminta dana dipindahkan ke 'dompet aman'. Apa respons yang paling tepat?",
      options: [
        "Pindahkan dana karena penelepon tahu saldo dan transaksi, jadi pasti petugas resmi",
        "Berikan kode MFA agar petugas bisa mengamankan akun",
        "Tutup telepon, jangan pindahkan dana, lalu hubungi layanan resmi lewat aplikasi atau situs yang dibuka sendiri",
        "Minta penelepon mengirim nomor rekening lewat SMS",
      ],
      correct: 2,
      explanation:
        "Pada kasus Coinbase (2025), staf layanan pelanggan yang disuap membocorkan data seperti saldo dan riwayat transaksi 69.461 nasabah. Data semacam ini membuat penipuan lewat telepon terdengar sangat meyakinkan.",
      concept: "Insider Threat dan Penipuan Lanjutan",
      conceptNote:
        "Data dari orang dalam dipakai untuk menipu nasabah (lihat Topik 05 · studi kasus Coinbase).",
    },
  ],
};