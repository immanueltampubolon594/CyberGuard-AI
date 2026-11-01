import type { ModuleQuiz } from "./types";

// Soal materi Social Engineering (slug: social-engineering).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada social-engineering.json (Topik 00 sampai 06).
export const socialEngineeringQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "se-1",
      type: "single",
      prompt: "Apa yang paling tepat menggambarkan social engineering?",
      options: [
        "Teknik membobol firewall dengan memanfaatkan celah software",
        "Teknik memanipulasi manusia agar melakukan tindakan atau memberikan informasi yang menguntungkan penyerang",
        "Teknik mengenkripsi data korban lalu meminta tebusan",
        "Teknik menebak password dengan mencoba semua kombinasi",
      ],
      correct: 1,
      explanation:
        "Social engineering menyerang manusia, bukan sistem. Penyerang memanfaatkan rasa takut, percaya, penasaran, atau sungkan agar korban sendiri yang membuka pintu.",
      concept: "Definisi Social Engineering",
      conceptNote:
        "Social engineering = manipulasi psikologis terhadap manusia, bukan eksploitasi teknis (lihat Topik 00 · Apa itu Social Engineering?).",
    },
    {
      id: "se-2",
      type: "multi_select",
      prompt: "Pesan berikut memakai prinsip persuasi apa saja? Pilih semua yang benar.",
      message: {
        sender: "Mentor Trading Sukses",
        time: "Hari ini, 20.15",
        lines: [
          "Sudah 3.000 member grup ini profit setiap hari!",
          "Slot member VIP tinggal 5 lagi, ditutup malam ini jam 23.59.",
          "Saya pernah jadi analis di bank besar, jadi tenang saja.",
        ],
      },
      options: [
        "Reciprocity (balas budi)",
        "Social proof (bukti sosial)",
        "Scarcity/urgency (kelangkaan dan desakan waktu)",
        "Authority (otoritas)",
      ],
      correct: [1, 2, 3],
      explanation: [
        "Reciprocity tidak muncul karena pelaku belum memberi hadiah atau bantuan apa pun.",
        "'3.000 member profit' adalah social proof: membuat korban ikut-ikutan karena banyak orang lain.",
        "'Tinggal 5 slot, ditutup jam 23.59' adalah scarcity/urgency: korban didesak agar tidak sempat berpikir.",
        "'Pernah jadi analis bank besar' adalah authority: klaim keahlian agar korban percaya.",
      ],
      concept: "Prinsip Persuasi Cialdini",
      conceptNote:
        "Kenali enam prinsip persuasi yang sering disalahgunakan: authority, urgency/scarcity, social proof, liking, reciprocity, commitment (lihat Topik 00 · Senjata Psikologis Penyerang).",
    },
    {
      id: "se-3",
      type: "single",
      prompt: "Urutan siklus serangan social engineering yang benar adalah…",
      options: [
        "Hook → Investigation → Exit → Play",
        "Play → Hook → Investigation → Exit",
        "Investigation → Hook → Play → Exit",
        "Investigation → Play → Hook → Exit",
      ],
      correct: 2,
      explanation:
        "Penyerang meriset target dulu (Investigation), membuka kontak dengan cerita yang cocok (Hook), menjalankan manipulasi (Play), lalu keluar tanpa dicurigai (Exit).",
      concept: "Siklus Serangan",
      conceptNote:
        "Telepon yang 'sangat tahu tentang kita' bisa jadi hasil tahap riset (lihat Topik 00 · Senjata Psikologis Penyerang).",
    },
    {
      id: "se-4",
      type: "scenario",
      prompt: "Studi kasus: Ibumu menerima pesan berikut di WhatsApp. Saran apa yang paling tepat?",
      message: {
        sender: "+62 857-xxxx-4410",
        time: "Hari ini, 10.05",
        lines: [
          "Assalamualaikum, mohon maaf mengganggu.",
          "Kami mengundang Bapak/Ibu ke acara pernikahan kami.",
          "Undangan Pernikahan.apk (2,4 MB)",
        ],
      },
      options: [
        "Buka saja karena isinya hanya undangan",
        "Teruskan ke grup keluarga untuk menanyakan siapa pengirimnya",
        "Jangan buka atau pasang file .apk itu, hapus pesannya, dan konfirmasi ke kerabat lewat telepon jika perlu",
        "Pasang file lalu langsung hapus setelah melihat isinya",
      ],
      correct: 2,
      explanation:
        "Undangan asli berupa gambar, PDF, atau tautan, bukan aplikasi (.apk). Begitu dipasang, APK palsu bisa mencuri data mobile banking. Inilah modus 'sniffing' yang diperingatkan OJK pada Juli 2023, dengan kerugian korban hingga Rp1,4 miliar.",
      concept: "Modus APK 'Sniffing'",
      conceptNote:
        "Jangan pernah memasang file .apk dari chat. Pasang aplikasi hanya dari toko resmi (lihat Topik 00 · Studi Kasus Sniffing).",
    },
    {
      id: "se-5",
      type: "single",
      prompt: "Benar atau salah: Jika sudah tahu modus sebuah penipuan, kita pasti tidak akan tertipu modus tersebut.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Modus sniffing terus memakan korban walaupun sudah viral. Saat panik, lelah, atau terburu-buru, pengetahuan bisa kalah oleh emosi. Yang melindungi kita adalah kebiasaan berhenti, berpikir, lalu verifikasi.",
      concept: "Berhenti — Pikir — Verifikasi",
      conceptNote:
        "Pengetahuan saja tidak cukup. Biasakan langkah Berhenti, Pikir, Verifikasi (lihat Topik 00 · Apa itu Social Engineering?).",
    },
    {
      id: "se-6",
      type: "scenario",
      prompt: "Studi kasus: Kamu staf keuangan. Setelah email ini, kamu diajak video call dan wajah serta suara 'CFO' terlihat asli. Apa langkah yang tepat?",
      message: {
        sender: "CFO (kantor pusat)",
        time: "Hari ini, 08.47",
        lines: [
          "Ada transaksi rahasia yang harus selesai hari ini.",
          "Jangan dibahas dengan tim lain dulu.",
          "Ikuti video call saya jam 09.00 untuk instruksi transfer.",
        ],
      },
      options: [
        "Transfer saja karena sudah melihat wajah CFO di video call",
        "Minta CFO mengirim ulang instruksi lewat email yang sama",
        "Transfer sebagian dulu untuk menguji apakah ini asli",
        "Akhiri proses, lalu hubungi CFO lewat nomor yang tercatat di sistem resmi dan ikuti prosedur dual authorization",
      ],
      correct: 3,
      explanation:
        "Pada kasus Arup (2024), karyawan melihat 'CFO' dan rekan kerja di video call, padahal semuanya deepfake, dan akhirnya mentransfer US$25,6 juta. Video call bukan bukti identitas. Verifikasi lewat saluran lain yang sudah tepercaya (out-of-band) dan wajibkan persetujuan dua orang.",
      concept: "Deepfake dan Out-of-Band Verification",
      conceptNote:
        "Permintaan 'rahasia + mendesak' wajib diverifikasi lewat saluran lain (lihat Topik 01 · Impersonation, Studi Kasus Arup).",
    },
    {
      id: "se-7",
      type: "single",
      prompt: "Apa yang dimaksud dengan out-of-band verification?",
      options: [
        "Memverifikasi permintaan melalui saluran berbeda yang sudah tepercaya, misalnya menelepon nomor yang tersimpan",
        "Membalas email yang mencurigakan untuk menanyakan keasliannya",
        "Meminta pengirim mengirim foto KTP sebagai bukti",
        "Menunggu 24 jam sebelum menuruti permintaan",
      ],
      correct: 0,
      explanation:
        "Jika permintaan datang lewat email atau chat, verifikasinya harus lewat jalur lain yang kamu cari sendiri. Membalas ke saluran yang sama berarti bertanya kepada pelaku itu sendiri.",
      concept: "Out-of-Band Verification",
      conceptNote:
        "Jangan memverifikasi lewat saluran yang sama dengan permintaan (lihat Topik 01 · Strategi Pertahanan Melawan Impersonation).",
    },
    {
      id: "se-8",
      type: "multi_select",
      prompt: "Kamu menerima telepon dari suara yang mirip adikmu. Pilih semua tanda bahaya modus 'mengaku keluarga' dengan voice cloning.",
      options: [
        "Mengaku kecelakaan atau ditangkap dan butuh uang segera",
        "Meminta agar tidak memberi tahu anggota keluarga lain",
        "Meminta transfer ke rekening atas nama orang lain",
        "Menyebut nama panggilanmu dengan benar",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Situasi darurat yang emosional dipakai agar korban panik.",
        "Larangan menghubungi keluarga lain dibuat agar korban tidak bisa mengecek.",
        "Rekening atas nama orang lain adalah tanda kuat penipuan.",
        "Nama panggilan bukan bukti, karena mudah ditemukan di media sosial. Ini bukan tanda bahaya, tetapi juga bukan jaminan keaslian.",
      ],
      concept: "Voice Cloning & Mengaku Keluarga",
      conceptNote:
        "Sepakati 'kata sandi keluarga' dan telepon balik ke nomor asli (lihat Topik 01 · Voice Cloning dan Modus 'Mengaku Keluarga').",
    },
    {
      id: "se-9",
      type: "single",
      prompt: "Dalam penelitian University of Illinois (IEEE S&P 2016), 297 USB disebar di kampus. Apa temuan utamanya?",
      options: [
        "Diperkirakan 45–98% USB dicolokkan, dan yang pertama tersambung dalam kurang dari 6 menit",
        "Hampir tidak ada yang mencolokkan USB temuan",
        "Hanya staf IT yang mencolokkan USB temuan",
        "USB hanya dicolokkan jika berlabel 'Gaji Karyawan'",
      ],
      correct: 0,
      explanation:
        "Rasa penasaran dan niat baik (ingin mengembalikan ke pemilik) membuat banyak orang mencolokkan USB temuan. Itulah yang dimanfaatkan baiting.",
      concept: "USB Drop Attack",
      conceptNote:
        "Jangan colokkan USB temuan. Serahkan ke petugas keamanan atau tim IT (lihat Topik 02 · Baiting, Studi Kasus Illinois).",
    },
    {
      id: "se-10",
      type: "scenario",
      prompt: "Studi kasus: Kamu menemukan flashdisk berlabel 'Daftar Gaji 2026 — RAHASIA' di parkiran kantor. Apa yang sebaiknya kamu lakukan?",
      options: [
        "Colokkan ke laptop kantor untuk mencari tahu pemiliknya",
        "Colokkan ke laptop pribadi agar laptop kantor tetap aman",
        "Serahkan ke tim IT atau petugas keamanan tanpa mencolokkannya",
        "Buang ke tempat sampah agar tidak dipakai orang lain",
      ],
      correct: 2,
      explanation:
        "Mencolokkan ke laptop mana pun (kantor atau pribadi) tetap berisiko karena malware bisa langsung berjalan. Membuangnya juga kurang tepat karena tim IT perlu tahu ada upaya serangan. Serahkan kepada pihak yang berwenang.",
      concept: "USB Drop Attack",
      conceptNote:
        "USB temuan = potensi umpan. Laporkan ke tim IT (lihat Topik 02 · Baiting).",
    },
    {
      id: "se-11",
      type: "single",
      prompt: "Mengapa sebaiknya menghindari mengisi daya HP di port USB umum (misalnya di bandara) dengan kabel yang disediakan di tempat?",
      options: [
        "Karena arus listriknya terlalu kecil",
        "Karena baterai HP akan cepat rusak",
        "Karena melanggar aturan bandara",
        "Karena port atau kabel yang dimodifikasi bisa dipakai untuk mencuri data atau memasang malware (juice jacking)",
      ],
      correct: 3,
      explanation:
        "Port USB membawa listrik sekaligus data. Gunakan charger dan kabel milik sendiri yang dicolokkan ke stopkontak listrik, atau powerbank pribadi.",
      concept: "Juice Jacking",
      conceptNote:
        "Pakai charger sendiri ke stopkontak, bukan port USB umum (lihat Topik 02 · Physical Baiting).",
    },
    {
      id: "se-12",
      type: "scenario",
      prompt: "Studi kasus: Saat membuka website, muncul pop-up berbunyi keras seperti di bawah. Apa tindakan yang paling tepat?",
      message: {
        sender: "Windows Defender Security Center (pop-up browser)",
        lines: [
          "PERINGATAN! Komputer Anda terinfeksi 5 virus.",
          "Data perbankan Anda dalam bahaya.",
          "Segera hubungi Microsoft Support: 0800-xxx-xxxx",
          "JANGAN MATIKAN KOMPUTER ANDA.",
        ],
      },
      options: [
        "Telepon nomor tersebut agar segera dibantu",
        "Klik tombol 'Scan Now' pada pop-up",
        "Jangan klik apa pun di pop-up, tutup browser secara paksa (Task Manager/Force Quit), lalu pindai dengan antivirus yang kamu pasang sendiri",
        "Pasang AnyDesk agar teknisi bisa memeriksa",
      ],
      correct: 2,
      explanation:
        "Microsoft tidak pernah menampilkan nomor telepon di pop-up browser. Pada kasus Restoro & Reimage, FTC mendenda US$26 juta karena pop-up 'komputer terinfeksi' palsu dipakai untuk menjual perbaikan dan akses jarak jauh.",
      concept: "Tech Support Scam",
      conceptNote:
        "Jangan telepon nomor di pop-up dan jangan beri akses remote (lihat Topik 03 · Scareware, Studi Kasus FTC Restoro).",
    },
    {
      id: "se-13",
      type: "single",
      prompt: "Benar atau salah: Peringatan virus yang muncul di website atau iklan adalah peringatan resmi dari sistem keamanan komputer kita.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Peringatan asli muncul dari aplikasi keamanan yang terpasang di perangkat, bukan dari halaman website. Website tidak bisa memindai isi komputermu.",
      concept: "Ciri Scareware",
      conceptNote:
        "Website tidak bisa mendeteksi virus di komputermu, jadi peringatan seperti itu hampir pasti palsu (lihat Topik 03 · Anatomi Scareware).",
    },
    {
      id: "se-14",
      type: "multi_select",
      prompt: "Kamu terlanjur memasang AnyDesk atas instruksi 'teknisi' palsu dan sempat membuka aplikasi bank. Pilih semua langkah yang tepat.",
      options: [
        "Putuskan internet dan hapus aplikasi remote access",
        "Menunggu 'teknisi' menelepon lagi untuk menyelesaikan perbaikan",
        "Hubungi bank lewat nomor resmi untuk memblokir rekening atau kartu",
        "Ganti password akun penting dari perangkat lain yang aman",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Memutus internet dan menghapus aplikasi remote menghentikan akses penyerang.",
        "Menunggu 'teknisi' adalah langkah salah. Jangan berkomunikasi lagi dengan pelaku.",
        "Bank perlu segera memblokir agar dana tidak terus terkuras.",
        "Password diganti dari perangkat lain karena perangkat yang dipakai mungkin sudah disusupi.",
      ],
      concept: "Respons Setelah Terkena Scareware",
      conceptNote:
        "Putus akses → amankan keuangan → ganti password → lapor (lihat Topik 03 · Jika Terlanjur Panik).",
    },
    {
      id: "se-15",
      type: "single",
      prompt: "Apa yang membedakan pretexting dari serangan social engineering lainnya?",
      options: [
        "Pretexting membangun cerita atau identitas palsu yang meyakinkan, sering dalam jangka panjang, untuk mendapatkan kepercayaan korban",
        "Pretexting selalu memakai USB drive",
        "Pretexting hanya dilakukan lewat pop-up browser",
        "Pretexting tidak membutuhkan riset tentang korban",
      ],
      correct: 0,
      explanation:
        "Pretexting berpusat pada 'pretext' (cerita atau identitas palsu). Contohnya romance scam, investasi bodong, dan BEC, yang biasanya didahului riset (OSINT) dan pembangunan hubungan.",
      concept: "Definisi Pretexting",
      conceptNote:
        "Pretexting = riset → membangun hubungan → eksploitasi (lihat Topik 04 · Anatomi Pretexting).",
    },
    {
      id: "se-16",
      type: "scenario",
      prompt: "Studi kasus: Kamu sudah 2 bulan berkenalan dengan seseorang lewat aplikasi kencan. Ia selalu menolak video call, lalu mengirim pesan ini. Apa yang sebaiknya kamu lakukan?",
      message: {
        sender: "Ryan ❤",
        time: "Kemarin, 22.40",
        lines: [
          "Sayang, aku sedang tertahan di bea cukai bandara.",
          "Aku butuh Rp15 juta untuk biaya administrasi, nanti langsung aku ganti.",
          "Tolong jangan cerita ke siapa-siapa dulu ya.",
        ],
      },
      options: [
        "Transfer setengahnya dulu untuk membantu",
        "Tolak mengirim uang, ceritakan ke orang tepercaya, simpan bukti, dan laporkan akun tersebut",
        "Kirim uang karena hubungan sudah berjalan lama",
        "Minta ia mengirim foto paspor sebagai bukti, lalu transfer",
      ],
      correct: 1,
      explanation:
        "Menolak video call, tiba-tiba ada keadaan darurat, meminta uang, dan meminta merahasiakan adalah pola klasik romance scam. Foto paspor mudah dipalsukan. FTC mencatat kerugian romance scam di AS mencapai US$1,14 miliar pada 2023.",
      concept: "Romance Scam",
      conceptNote:
        "Kenalan online yang menolak bertemu atau video call lalu meminta uang = tanda bahaya (lihat Topik 04 · Varian Pretexting).",
    },
    {
      id: "se-17",
      type: "single",
      prompt: "Pada kasus Indra Kenz (Binomo) dan Doni Salmanan (Quotex), apa 'pretext' yang dipakai untuk meyakinkan korban?",
      options: [
        "Mengaku sebagai petugas OJK",
        "Mengirim USB berisi aplikasi trading",
        "Menyamar sebagai kurir paket",
        "Citra 'crazy rich' atau trader sukses di media sosial dengan pamer kekayaan dan janji cepat kaya",
      ],
      correct: 3,
      explanation:
        "Pamer gaya hidup mewah dibangun sebagai bukti 'keberhasilan', padahal binary option ilegal di Indonesia. Indra Kenz divonis 10 tahun dan Doni Salmanan diperberat menjadi 8 tahun di tingkat banding.",
      concept: "Investasi Bodong",
      conceptNote:
        "Gaya hidup mewah bukan bukti investasi sah. Cek legalitas ke OJK (lihat Topik 04 · Studi Kasus Binomo & Quotex).",
    },
    {
      id: "se-18",
      type: "multi_select",
      prompt: "Pilih semua kebiasaan yang membantu mengurangi bahan OSINT bagi pelaku pretexting.",
      options: [
        "Tidak mengunggah foto KTP, tiket, atau boarding pass",
        "Menunda unggahan lokasi liburan sampai sudah pulang",
        "Ikut kuis media sosial 'Siapa nama hewan peliharaan pertamamu?'",
        "Mengatur akun pribadi menjadi privat",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Foto dokumen membocorkan data identitas dan kode booking.",
        "Unggahan lokasi real-time memberi tahu pelaku kapan kamu tidak di rumah dan bahan cerita palsu.",
        "Kuis seperti itu justru mengumpulkan jawaban pertanyaan keamanan. Ini kebiasaan yang harus dihindari.",
        "Akun privat membatasi informasi yang bisa dikumpulkan orang asing.",
      ],
      concept: "OSINT dan Jejak Digital",
      conceptNote:
        "Semakin sedikit info pribadi terbuka, semakin sulit pelaku membuat pretext (lihat Topik 04 · OSINT).",
    },
    {
      id: "se-19",
      type: "single",
      prompt: "Kamu ingin menjual laptop lama berisi SSD. Cara mana yang paling tepat agar data tidak bisa dipulihkan pembeli?",
      options: [
        "Hapus file lalu kosongkan Recycle Bin",
        "Quick format drive",
        "Gunakan fitur Secure Erase/Sanitize atau cryptographic erase (misalnya dengan enkripsi penuh lalu reset), sesuai panduan sanitasi media seperti NIST SP 800-88",
        "Ganti nama semua folder",
      ],
      correct: 2,
      explanation:
        "Delete dan quick format hanya menghapus 'daftar isi', sehingga data masih bisa dipulihkan dengan software recovery. Untuk SSD, gunakan Secure Erase/Sanitize atau cryptographic erase.",
      concept: "Sanitasi Media (Dumpster Diving Digital)",
      conceptNote:
        "Delete dan format biasa tidak cukup. Gunakan Secure Erase atau penghancuran fisik (lihat Topik 05 · Pertahanan Fisik dan Prosedural).",
    },
    {
      id: "se-20",
      type: "scenario",
      prompt: "Studi kasus: Seseorang berseragam teknisi AC membawa kotak alat dan berkata, \"Mas, tolong tahan pintunya ya, kartu saya ketinggalan, saya dipanggil untuk servis di lantai 5.\" Ini termasuk teknik apa, dan bagaimana responsmu?",
      options: [
        "Tailgating, jadi biarkan saja karena ia tidak meminta izin",
        "Baiting, jadi langsung laporkan ke polisi",
        "Piggybacking, jadi bantu saja karena seragamnya resmi",
        "Piggybacking, jadi tolak dengan sopan dan arahkan ke resepsionis atau bagian fasilitas untuk verifikasi",
      ],
      correct: 3,
      explanation:
        "Ia meminta bantuan secara sadar dari korban, jadi itu piggybacking (tailgating terjadi tanpa sepengetahuan korban). Seragam mudah ditiru. Tolak dengan ramah: 'Silakan lapor resepsionis dulu ya, Pak, nanti dibantu.'",
      concept: "Tailgating vs Piggybacking",
      conceptNote:
        "Piggybacking = korban sadar membantu; tailgating = korban tidak sadar. Arahkan ke prosedur resmi (lihat Topik 06 · Cara Menolak dengan Sopan).",
    },
  ],
};