import type { ModuleQuiz } from "./types";

// Soal materi WiFi Attack (slug: wifi-attack).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada wifi-attack.json (Topik 00 sampai 05).
export const wifiAttackQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "wf-1",
      type: "single",
      prompt: "Menurut materi, apa kerentanan paling mendasar dari jaringan WiFi dibandingkan jaringan kabel?",
      options: [
        "WiFi selalu lebih lambat daripada kabel",
        "WiFi tidak bisa memakai password",
        "Sinyal radio menyebar ke segala arah, sehingga siapa pun dalam jangkauan bisa menangkapnya tanpa menyentuh kabel",
        "WiFi hanya bisa dipakai satu perangkat sekaligus",
      ],
      correct: 2,
      explanation:
        "Sinyal WiFi menembus dinding dan jendela. Penyerang tidak perlu akses fisik, cukup berada dalam jangkauan sinyal. Inilah sifat broadcast yang membuat WiFi rentan.",
      concept: "Sifat Broadcast WiFi",
      conceptNote:
        "Siapa pun dalam jangkauan sinyal adalah calon penyerang (lihat Topik 00 · Mengapa Jaringan WiFi Sangat Rentan Terhadap Serangan?).",
    },
    {
      id: "wf-2",
      type: "scenario",
      prompt: "Studi kasus: Kamu membaca berita berikut. Apa langkah paling tepat untuk perangkat di rumahmu?",
      message: {
        sender: "Portal Berita Teknologi",
        time: "Oktober 2017",
        lines: [
          "Peneliti mengungkap KRACK, kerentanan pada handshake WPA2.",
          "Vendor mulai merilis pembaruan untuk ponsel, laptop, dan router.",
        ],
      },
      options: [
        "Perbarui sistem operasi dan firmware semua perangkat, termasuk router dan IoT, serta tetap pakai HTTPS/VPN",
        "Ganti nama WiFi karena KRACK menebak nama jaringan",
        "Matikan password WiFi agar tidak bisa diserang",
        "Tidak perlu melakukan apa pun karena WPA2 pasti aman",
      ],
      correct: 0,
      explanation:
        "KRACK menyerang kelemahan pada standar/implementasi WPA2, bukan menebak password. Satu-satunya perbaikan adalah pembaruan dari vendor. HTTPS dan VPN memberi lapisan tambahan selama perangkat belum diperbarui.",
      concept: "Respons terhadap KRACK",
      conceptNote:
        "Kerentanan protokol diatasi dengan pembaruan perangkat (lihat Topik 00 · studi kasus KRACK 2017).",
    },
    {
      id: "wf-3",
      type: "single",
      prompt:
        "Benar atau salah: Menurut CERT/CC (VU#723755), kelemahan desain WPS membuat jumlah tebakan PIN turun dari 100 juta menjadi sekitar 11.000 percobaan.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Access point membocorkan apakah paruh pertama PIN sudah benar, dan digit terakhir hanyalah checksum. Akibatnya kemungkinan turun dari 10^8 menjadi 10^4 + 10^3, yaitu sekitar 11.000 percobaan.",
      concept: "Cacat Desain WPS",
      conceptNote:
        "PIN divalidasi per paruh sehingga mudah ditebak (lihat Topik 05 · Desain Cacat WPS dan Kerentanan PIN).",
    },
    {
      id: "wf-4",
      type: "single",
      prompt: "Apa pertahanan PALING efektif terhadap cracking password WiFi WPA2 secara offline?",
      options: [
        "Menyembunyikan nama jaringan (SSID)",
        "Memakai password yang mudah diingat, misalnya nama keluarga dan tahun lahir",
        "Mematikan router setiap malam",
        "Memakai passphrase panjang dan acak yang tidak ada di wordlist umum, dan beralih ke WPA3 bila memungkinkan",
      ],
      correct: 3,
      explanation:
        "Cracking offline menebak password memakai wordlist dan kombinasi. Passphrase panjang dan acak membuat tebakan tidak praktis. WPA3 (SAE) juga mempersulit serangan tebak offline.",
      concept: "Password WiFi yang Kuat",
      conceptNote:
        "Panjang dan acak mengalahkan dictionary attack (lihat Topik 01 · Strategi Pertahanan Terhadap Password Cracking).",
    },
    {
      id: "wf-5",
      type: "multi_select",
      prompt: "Mana saja langkah yang melindungi kamu dari serangan evil twin di WiFi publik? Pilih semua yang benar.",
      options: [
        "Menanyakan nama jaringan resmi kepada petugas tempat tersebut",
        "Memakai VPN saat terhubung ke WiFi publik",
        "Mengaktifkan 'auto-connect' untuk semua jaringan yang pernah dipakai",
        "Mencurigai WiFi gratis yang meminta email dan password media sosial",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Evil twin meniru nama jaringan, jadi pastikan nama yang resmi.",
        "Benar. VPN mengenkripsi lalu lintas sehingga tetap terlindungi meski terlanjur masuk ke jaringan palsu.",
        "Salah. Auto-connect membuat perangkat otomatis menyambung ke SSID yang ditiru penyerang.",
        "Benar. Halaman login palsu yang meminta kredensial adalah modus umum evil twin.",
      ],
      concept: "Pertahanan Evil Twin",
      conceptNote:
        "Verifikasi jaringan, pakai VPN, dan matikan auto-connect (lihat Topik 02 · Strategi Pertahanan dan Deteksi).",
    },
    {
      id: "wf-6",
      type: "scenario",
      prompt: "Studi kasus: Saat menunggu pesawat, kamu menemukan jaringan berikut. Setelah terhubung, muncul halaman ini. Apa yang sebaiknya kamu lakukan?",
      message: {
        sender: "Bandara_Free_WiFi",
        time: "Hari ini, 14.10",
        lines: [
          "Selamat datang! Untuk internet gratis,",
          "silakan login dengan email dan password media sosial Anda.",
        ],
      },
      options: [
        "Login dengan akun media sosial karena internetnya gratis",
        "Jangan masukkan kredensial; putuskan koneksi, verifikasi jaringan resmi ke petugas, atau pakai data seluler",
        "Masukkan password lama agar akun utama aman",
        "Bagikan nama jaringan ini ke teman agar mereka juga bisa memakai",
      ],
      correct: 1,
      explanation:
        "Pada Juli 2024, Kepolisian Federal Australia mendakwa seorang pria yang membuat WiFi palsu di bandara dan pesawat. Korban diarahkan ke halaman login palsu yang meminta email atau kredensial media sosial.",
      concept: "Evil Twin di Tempat Umum",
      conceptNote:
        "WiFi palsu memancing kredensial lewat halaman login palsu (lihat Topik 02 · studi kasus evil twin di bandara Australia).",
    },
    {
      id: "wf-7",
      type: "single",
      prompt: "Standar apa yang melindungi frame manajemen WiFi sehingga deauthentication palsu tidak lagi diterima perangkat?",
      options: [
        "802.11b",
        "WEP",
        "802.11w (Protected Management Frames)",
        "WPS",
      ],
      correct: 2,
      explanation:
        "802.11w mengautentikasi frame manajemen seperti deauth dan disassociation, sehingga frame palsu dari penyerang ditolak. WEP dan WPS justru memiliki kelemahan tersendiri.",
      concept: "Protected Management Frames",
      conceptNote:
        "802.11w menggagalkan pemalsuan frame deauth (lihat Topik 03 · Mitigasi dan Deteksi Deauthentication Attack).",
    },
    {
      id: "wf-8",
      type: "single",
      prompt:
        "Benar atau salah: Jika password WiFi sudah sangat kuat, jaringan tetap aman meskipun fitur WPS yang rentan masih aktif.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Serangan WPS menyasar PIN, bukan password WiFi. Jika PIN berhasil ditebak, penyerang bisa mendapatkan password sekuat apa pun. Karena itu WPS harus dimatikan.",
      concept: "WPS Melewati Password",
      conceptNote:
        "Password kuat tidak menolong bila WPS aktif (lihat Topik 05 · studi kasus pengungkapan kerentanan WPS 2011).",
    },
    {
      id: "wf-9",
      type: "multi_select",
      prompt: "Mana saja cara yang membantu organisasi mendeteksi atau mencegah rogue access point? Pilih semua yang benar.",
      options: [
        "Memasang Wireless Intrusion Detection/Prevention System (WIDS/WIPS)",
        "Menerapkan Network Access Control (NAC) pada port switch",
        "Membiarkan karyawan memasang router sendiri tanpa izin agar produktif",
        "Melakukan audit fisik berkala dan membuat kebijakan tertulis",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Sensor WIDS/WIPS memindai spektrum untuk menemukan access point yang tidak terdaftar.",
        "Benar. NAC mengautentikasi perangkat yang dicolok ke jaringan dan memblokir perangkat asing.",
        "Salah. Router pribadi tanpa izin IT adalah sumber rogue AP yang paling umum.",
        "Benar. Audit fisik dan kebijakan yang jelas mengurangi rogue AP, termasuk yang tidak disengaja.",
      ],
      concept: "Deteksi Rogue AP",
      conceptNote:
        "Gabungkan teknologi, kebijakan, dan audit (lihat Topik 04 · Deteksi dan Pencegahan Rogue AP).",
    },
    {
      id: "wf-10",
      type: "scenario",
      prompt:
        "Studi kasus: Rekan kerjamu memasang router murah di mejanya karena WiFi kantor lambat. Router itu masih memakai nama dan password bawaan pabrik. Apa tindakan yang paling tepat?",
      options: [
        "Ikut terhubung ke router itu karena lebih cepat",
        "Ganti nama WiFi router itu agar terlihat resmi",
        "Biarkan saja karena hanya dipakai satu orang",
        "Laporkan ke tim IT agar perangkat dicabut, lalu minta solusi resmi untuk sinyal yang lemah",
      ],
      correct: 3,
      explanation:
        "Router yang dicolok ke LAN tanpa izin menjadi pintu samping yang melewati firewall. Dengan password bawaan, orang di luar gedung bisa masuk ke jaringan internal. Masalah sinyal harus diselesaikan lewat jalur resmi.",
      concept: "Rogue AP Tidak Disengaja",
      conceptNote:
        "Niat baik bisa membuka jaringan kantor (lihat Topik 04 · studi kasus contoh skenario router pribadi karyawan).",
    },
    {
      id: "wf-11",
      type: "single",
      prompt: "Apa yang membuat teknik PMKID (diungkap pengembang Hashcat pada 2018) berbeda dari cara lama menyerang WPA/WPA2?",
      options: [
        "Teknik ini tidak memerlukan klien yang sedang terhubung; materi untuk ditebak offline diambil dari frame access point",
        "Teknik ini hanya bekerja pada jaringan tanpa password",
        "Teknik ini membutuhkan akses fisik ke router",
        "Teknik ini membuat password tidak perlu ditebak sama sekali",
      ],
      correct: 0,
      explanation:
        "Cara lama perlu menangkap 4-way handshake saat ada klien yang terhubung. Teknik PMKID mengambil nilai dari satu frame access point. Passphrase tetap harus ditebak offline, jadi password panjang dan acak tetap menjadi pertahanan utama.",
      concept: "Teknik PMKID",
      conceptNote:
        "Teknik menyerang WPA2 terus berkembang (lihat Topik 01 · studi kasus teknik PMKID 2018).",
    },
    {
      id: "wf-12",
      type: "single",
      prompt: "Bagaimana status hukum mengakses jaringan WiFi milik orang lain tanpa izin di Indonesia, menurut materi?",
      options: [
        "Boleh selama tidak mengunduh file",
        "Melanggar hukum, karena UU ITE melarang akses ilegal, intersepsi tanpa hak, dan gangguan sistem elektronik",
        "Boleh jika sinyalnya sampai ke rumah kita",
        "Hanya dilarang jika dilakukan pada malam hari",
      ],
      correct: 1,
      explanation:
        "UU ITE (terakhir diubah dengan UU No. 1 Tahun 2024) mengatur larangan akses ilegal dan intersepsi beserta ancaman pidananya. Teknik dalam materi hanya boleh dipraktikkan pada jaringan sendiri atau dalam pengujian resmi dengan izin tertulis.",
      concept: "Hukum dan Etika",
      conceptNote:
        "Belajar untuk bertahan, bukan menyerang (lihat Topik 00 · Kerangka Hukum dan Etika di Indonesia).",
    },
    {
      id: "wf-13",
      type: "scenario",
      prompt:
        "Studi kasus: Saat menginap di hotel, hotspot dari ponselmu terus terputus, padahal WiFi berbayar hotel lancar. Berdasarkan kasus nyata dalam materi, apa yang mungkin terjadi?",
      options: [
        "Ponselmu rusak dan harus diganti",
        "Kartu SIM-mu sudah kedaluwarsa",
        "Sistem WiFi tempat itu mungkin mengirim frame deauthentication ke hotspot tamu, praktik yang pernah didenda FCC sebesar US$600.000",
        "Hotspot memang tidak bisa dipakai di dalam gedung",
      ],
      correct: 2,
      explanation:
        "Pada 2014, FCC mendenda Marriott US$600.000 karena memakai fitur containment untuk mengirim frame deauth ke hotspot pribadi tamu. Tujuannya agar tamu membeli WiFi hotel. Memutus koneksi orang lain secara sengaja ada konsekuensi hukumnya.",
      concept: "Deauth di Dunia Nyata",
      conceptNote:
        "Frame deauth dipakai untuk memutus koneksi orang lain (lihat Topik 03 · studi kasus Marriott 2014).",
    },
    {
      id: "wf-14",
      type: "multi_select",
      prompt: "Mana saja langkah yang memperkuat jaringan WiFi rumah dari cracking password? Pilih semua yang benar.",
      options: [
        "Memakai passphrase minimal 16 karakter yang acak",
        "Beralih ke WPA3 jika router dan perangkat mendukung",
        "Memakai password '12345678' agar mudah dibagikan",
        "Mematikan WPS dan memperbarui firmware router",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Passphrase panjang dan acak tidak ada di wordlist dan terlalu lama untuk ditebak.",
        "Benar. WPA3 (SAE) membuat serangan tebak offline jauh lebih sulit.",
        "Salah. Password umum seperti ini termasuk yang pertama dicoba dalam dictionary attack.",
        "Benar. WPS adalah jalur lain yang lemah, dan firmware baru menutup celah yang sudah diketahui.",
      ],
      concept: "Mengamankan WiFi Rumah",
      conceptNote:
        "Password kuat, WPA3, dan WPS mati (lihat Topik 01 · Strategi Pertahanan Terhadap Password Cracking).",
    },
    {
      id: "wf-15",
      type: "single",
      prompt: "Menurut materi, mitigasi apa yang paling efektif dan benar-benar aman terhadap serangan PIN WPS?",
      options: [
        "Mengganti password WiFi setiap minggu",
        "Menyembunyikan SSID",
        "Memindahkan router ke ruangan lain",
        "Mematikan WPS di panel admin router",
      ],
      correct: 3,
      explanation:
        "Serangan menyasar PIN WPS, jadi mengganti password atau menyembunyikan SSID tidak menutup celahnya. Mematikan WPS menghilangkan jalur serangan tersebut sepenuhnya.",
      concept: "Matikan WPS",
      conceptNote:
        "Satu-satunya mitigasi yang benar-benar aman adalah mematikan WPS (lihat Topik 05 · Mitigasi: Mematikan WPS dan Alternatif Aman).",
    },
    {
      id: "wf-16",
      type: "scenario",
      prompt: "Studi kasus: Keluargamu ingin menyambungkan smart TV baru ke WiFi rumah. Kakakmu menyarankan menyalakan WPS PIN supaya praktis. Apa saran yang paling tepat?",
      options: [
        "Ketik passphrase secara manual atau bagikan lewat QR code, dan biarkan WPS tetap mati",
        "Nyalakan WPS PIN dan biarkan aktif terus",
        "Hapus password WiFi agar TV mudah tersambung",
        "Pakai WiFi tetangga untuk TV",
      ],
      correct: 0,
      explanation:
        "Ada cara praktis yang aman tanpa WPS: mengetik passphrase atau memakai QR code di Android dan iOS. WPS PIN membuka celah yang bisa ditebak dalam hitungan jam.",
      concept: "Alternatif Aman WPS",
      conceptNote:
        "Kemudahan setup tidak harus mengorbankan keamanan (lihat Topik 05 · Mitigasi: Mematikan WPS dan Alternatif Aman).",
    },
    {
      id: "wf-17",
      type: "single",
      prompt: "Apa yang dimaksud dengan Evil Twin Attack?",
      options: [
        "Virus yang menggandakan file di laptop",
        "Router yang memiliki dua antena",
        "Access point palsu yang meniru nama jaringan WiFi asli untuk menipu pengguna agar terhubung",
        "Dua orang yang memakai password WiFi yang sama",
      ],
      correct: 2,
      explanation:
        "Evil twin memakai SSID yang identik atau mirip dengan jaringan sah. Setelah korban terhubung, penyerang bisa menyadap lalu lintas yang tidak terenkripsi atau menyajikan halaman phishing.",
      concept: "Definisi Evil Twin",
      conceptNote:
        "Kembaran jahat dari jaringan asli (lihat Topik 02 · Mekanisme dan Implementasi Evil Twin).",
    },
    {
      id: "wf-18",
      type: "multi_select",
      prompt: "Mana saja pernyataan yang BENAR tentang deauthentication attack menurut materi? Pilih semua yang benar.",
      options: [
        "Bisa dipakai untuk memaksa klien terhubung ulang sehingga handshake baru bisa ditangkap",
        "Memerlukan password WiFi korban terlebih dahulu",
        "Sering dipakai bersama evil twin untuk memindahkan korban ke jaringan palsu",
        "Mengeksploitasi frame manajemen 802.11 lama yang tidak diautentikasi",
      ],
      correct: [0, 2, 3],
      explanation: [
        "Benar. Klien yang diputus akan terhubung ulang, dan proses itu menghasilkan 4-way handshake baru.",
        "Salah. Deauth bisa dilakukan tanpa mengetahui password karena frame manajemen lama tidak diverifikasi.",
        "Benar. Korban diputus dari jaringan asli lalu tersambung ke evil twin yang sinyalnya lebih kuat.",
        "Benar. Inilah akar masalahnya, dan diperbaiki oleh 802.11w.",
      ],
      concept: "Tujuan Serangan Deauth",
      conceptNote:
        "Deauth adalah alat bantu bagi serangan lain (lihat Topik 03 · Tujuan dan Use Case Serangan Deauth).",
    },
    {
      id: "wf-19",
      type: "scenario",
      prompt: "Studi kasus: Pengaturan router di rumahmu terlihat seperti di bawah ini. Apa perbaikan yang paling tepat?",
      message: {
        sender: "Panel Admin Router",
        time: "Pengaturan saat ini",
        lines: [
          "Keamanan: WPA2-Personal",
          "Password WiFi: rumah123",
          "WPS: Aktif",
        ],
      },
      options: [
        "Tidak perlu diubah karena sudah memakai WPA2",
        "Cukup ganti nama jaringan (SSID)",
        "Ubah password menjadi 'rumah1234'",
        "Ganti dengan passphrase panjang dan acak, matikan WPS, dan pakai WPA3 jika didukung",
      ],
      correct: 3,
      explanation:
        "'rumah123' mudah ditemukan lewat dictionary attack, dan WPS aktif membuka jalur serangan PIN. WPA2 tidak melindungi password yang lemah. Perbaiki ketiganya sekaligus.",
      concept: "Audit Router Rumah",
      conceptNote:
        "Password lemah dan WPS aktif adalah dua celah terbesar (lihat Topik 01 · Teknik Cracking: Dictionary vs Brute Force).",
    },
    {
      id: "wf-20",
      type: "single",
      prompt: "Mengapa rogue access point di dalam jaringan perusahaan sangat berbahaya?",
      options: [
        "Karena membuat WiFi kantor menjadi lebih cepat",
        "Karena menciptakan 'pintu samping' yang melewati firewall, IDS/IPS, dan kontrol keamanan perimeter",
        "Karena selalu memakai WPA3",
        "Karena hanya bisa dipakai oleh tim IT",
      ],
      correct: 1,
      explanation:
        "Lalu lintas lewat rogue AP tidak melewati gateway yang diawasi. Orang di luar gedung bisa masuk ke jaringan internal, lalu memindai, mencuri data, atau bergerak ke perangkat lain.",
      concept: "Bahaya Rogue AP",
      conceptNote:
        "Rogue AP melewati seluruh pertahanan perimeter (lihat Topik 04 · Bahaya dan Vektor Serangan Melalui Rogue AP).",
    },
  ],
};