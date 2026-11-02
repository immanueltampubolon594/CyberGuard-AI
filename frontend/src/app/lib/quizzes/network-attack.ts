import type { ModuleQuiz } from "./types";

// Soal materi Network Attack (slug: network-attack).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada network-attack.json (Topik 00 sampai 06).
export const networkAttackQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "na-1",
      type: "single",
      prompt: "Mengapa banyak protokol jaringan inti seperti ARP, DNS, dan IP mudah disalahgunakan penyerang?",
      options: [
        "Karena protokol tersebut sudah tidak dipakai lagi",
        "Karena protokol tersebut selalu dienkripsi dengan kunci yang lemah",
        "Karena protokol tersebut dirancang dengan asumsi semua pihak dapat dipercaya, tanpa autentikasi atau verifikasi bawaan",
        "Karena protokol tersebut hanya berjalan di jaringan rumah",
      ],
      correct: 2,
      explanation:
        "Protokol inti dirancang pada era 1970–1990-an dengan fokus keterbukaan dan interoperabilitas, bukan keamanan. Contohnya, perangkat menerima ARP Reply apa pun tanpa memeriksa keasliannya.",
      concept: "Desain Berbasis Kepercayaan",
      conceptNote:
        "Protokol lama tidak punya autentikasi bawaan (lihat Topik 00 · Mengapa Protokol Jaringan Menjadi Target Empuk?).",
    },
    {
      id: "na-2",
      type: "single",
      prompt:
        "Benar atau salah: Kebocoran rute BGP Indosat pada 2 April 2014 adalah serangan peretas yang disengaja untuk mencuri data dari seluruh dunia.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. Menurut RIPE Labs, insiden ini disebabkan kesalahan konfigurasi. Namun, insiden ini memperlihatkan kelemahan yang sama dengan yang dimanfaatkan penyerang: BGP menerima pengumuman rute tanpa verifikasi bawaan, sehingga traffic sebagian jaringan sempat 'tersesat' ke Indonesia selama sekitar dua jam.",
      concept: "Kepercayaan pada BGP",
      conceptNote:
        "Kesalahan routing bisa berdampak global karena BGP berbasis kepercayaan (lihat Topik 00 · studi kasus kebocoran rute BGP Indosat 2014).",
    },
    {
      id: "na-3",
      type: "single",
      prompt: "Mode apa yang diaktifkan pada kartu jaringan agar dapat menangkap SEMUA paket yang lewat, bukan hanya paket yang ditujukan kepadanya?",
      options: [
        "Promiscuous mode (atau monitor mode pada adapter Wi-Fi)",
        "Airplane mode",
        "Safe mode",
        "Power saving mode",
      ],
      correct: 0,
      explanation:
        "Dalam mode normal, kartu jaringan hanya memproses paket untuk alamat MAC-nya sendiri. Promiscuous mode (dan monitor mode pada Wi-Fi) membuatnya meneruskan semua paket ke alat seperti Wireshark atau tcpdump.",
      concept: "Promiscuous Mode",
      conceptNote:
        "Sniffing dimulai dengan menangkap semua paket di segmen jaringan (lihat Topik 01 · Cara Kerja Packet Sniffing: Dari Promiscuous Mode hingga Deep Packet Inspection).",
    },
    {
      id: "na-4",
      type: "scenario",
      prompt: "Studi kasus: Temanmu sedang di kafe dan mengirim pesan berikut. Apa saran yang paling tepat?",
      message: {
        sender: "Dimas",
        time: "Sore ini, 16.20",
        lines: [
          "Aku pakai Wi-Fi kafe 'Free_WiFi' tanpa password nih.",
          "Mau login ke portal nilai kampus lama, alamatnya masih http:// (bukan https).",
          "Aman kan? Cuma masukin NIM sama password doang 😅",
        ],
      },
      options: [
        "Aman, karena Wi-Fi kafe biasanya dipakai banyak orang",
        "Aman asalkan password-nya panjang",
        "Login saja, lalu langsung logout agar tidak disadap",
        "Jangan login lewat HTTP di Wi-Fi terbuka; data dikirim tanpa enkripsi dan bisa disadap. Gunakan data seluler atau VPN, dan laporkan ke kampus agar portal memakai HTTPS",
      ],
      correct: 3,
      explanation:
        "Pada HTTP, username dan password dikirim dalam bentuk teks biasa. Siapa pun di jaringan terbuka yang sama dapat menyadapnya dengan sniffer. Logout cepat tidak membantu karena data sudah terkirim saat login.",
      concept: "Plaintext di Jaringan Terbuka",
      conceptNote:
        "HTTP, FTP, dan Telnet mengirim kredensial tanpa enkripsi (lihat Topik 01 · Data Apa Saja yang Dapat Dicuri Melalui Packet Sniffing?).",
    },
    {
      id: "na-5",
      type: "multi_select",
      prompt: "Dalam kasus Albert Gonzalez (dakwaan 2009), mana saja pernyataan yang BENAR? Pilih semua yang benar.",
      options: [
        "Pelaku memasang program 'sniffer' yang menyadap data kartu secara real-time di jaringan internal korban",
        "Korbannya antara lain Heartland Payment Systems, 7-Eleven, dan Hannaford",
        "Pelaku hanya mencuri data dari Wi-Fi publik di bandara",
        "Data lebih dari 130 juta kartu kredit dan debit diduga dicuri",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Kejaksaan New Jersey menyebut sniffer dipasang untuk menyadap data kartu saat diproses.",
        "Benar. Ketiganya disebut dalam dakwaan Departemen Kehakiman AS.",
        "Salah. Pelaku masuk ke jaringan perusahaan lewat SQL injection, lalu menyadap traffic internalnya.",
        "Benar. Ini disebut sebagai salah satu kasus pencurian data kartu terbesar saat itu.",
      ],
      concept: "Sniffing di Jaringan Internal",
      conceptNote:
        "Jaringan internal yang tidak terenkripsi tetap bisa disadap (lihat Topik 01 · studi kasus Albert Gonzalez).",
    },
    {
      id: "na-6",
      type: "single",
      prompt: "Mengapa IP spoofing 'buta' (blind) sulit dipakai untuk membangun koneksi TCP penuh dari jaringan lain?",
      options: [
        "Karena TCP tidak memakai alamat IP sama sekali",
        "Karena balasan SYN-ACK dikirim ke alamat IP yang dipalsukan, sehingga penyerang tidak menerimanya dan sulit menyelesaikan handshake",
        "Karena semua router di dunia sudah memblokir spoofing",
        "Karena TCP selalu dienkripsi",
      ],
      correct: 1,
      explanation:
        "Server membalas ke alamat sumber yang tertera di paket. Jika alamat itu palsu, balasannya tidak sampai ke penyerang. Karena itu spoofing paling sering dipakai untuk serangan yang tidak butuh balasan, seperti flood dan amplifikasi berbasis UDP.",
      concept: "Batasan IP Spoofing",
      conceptNote:
        "Spoofing efektif untuk serangan satu arah (lihat Topik 02 · Mekanisme Teknis IP Spoofing dan Batasannya).",
    },
    {
      id: "na-7",
      type: "scenario",
      prompt: "Studi kasus: Kamu magang di bagian jaringan. Log router perbatasan kantor menunjukkan hal berikut. Langkah apa yang paling tepat?",
      message: {
        sender: "Log Router Perbatasan",
        time: "Hari ini, 02.14",
        lines: [
          "Interface: WAN (dari internet)",
          "Paket masuk dengan alamat sumber 10.20.0.15",
          "Catatan: 10.20.0.0/16 adalah alamat jaringan INTERNAL kantor",
        ],
      },
      options: [
        "Mengizinkan paket itu karena alamatnya milik kantor sendiri",
        "Mematikan seluruh koneksi internet kantor",
        "Menerapkan ingress filtering: buang paket dari internet yang mengaku beralamat internal, serta egress filtering untuk paket keluar",
        "Mengganti alamat IP semua komputer kantor",
      ],
      correct: 2,
      explanation:
        "Paket dari internet tidak mungkin sah jika mengaku berasal dari jaringan internal; ini tanda spoofing. CERT Advisory CA-95:01 sudah merekomendasikan penyaringan seperti ini, yang kemudian dibakukan dalam BCP38 (RFC 2827).",
      concept: "Ingress/Egress Filtering",
      conceptNote:
        "Saring paket dengan alamat sumber yang tidak masuk akal di tepi jaringan (lihat Topik 02 · Mitigasi: BCP38, Ingress/Egress Filtering, dan Source Validation).",
    },
    {
      id: "na-8",
      type: "multi_select",
      prompt: "Menurut CERT Advisory CA-95:01 (Januari 1995), mana saja pernyataan yang BENAR? Pilih semua yang benar.",
      options: [
        "Penyerang memalsukan alamat IP untuk menipu layanan yang memberi akses hanya berdasarkan alamat IP",
        "Serangan dapat berhasil meskipun penyerang tidak menerima paket balasan",
        "Setelah menguasai sistem, pelaku membajak sesi terminal yang aktif sehingga one-time password pun bisa dilewati",
        "Mematikan source routing sudah cukup untuk menghentikan serangan ini",
      ],
      correct: [0, 1, 2],
      explanation: [
        "Benar. Layanan seperti rlogin/rsh, NFS, dan X Windows yang percaya pada alamat IP menjadi sasaran.",
        "Benar. Advisori menyebut serangan tetap berjalan walaupun balasan tidak pernah diterima penyerang.",
        "Benar. Pembajakan dilakukan setelah autentikasi selesai, sehingga autentikasi kuat ikut terlewati.",
        "Salah. Advisori menegaskan bahwa mematikan source routing tidak menghentikan serangan ini; yang direkomendasikan adalah router penyaring.",
      ],
      concept: "IP Bukan Bukti Identitas",
      conceptNote:
        "Akses berbasis alamat IP mudah ditipu (lihat Topik 02 · studi kasus CERT Advisory CA-95:01).",
    },
    {
      id: "na-9",
      type: "single",
      prompt: "Apa kelemahan utama protokol ARP yang dimanfaatkan dalam ARP spoofing?",
      options: [
        "ARP hanya bekerja di internet publik",
        "ARP selalu memerlukan password admin",
        "ARP mengenkripsi semua data dengan kunci yang sama",
        "Perangkat menerima dan memperbarui cache ARP dari ARP Reply apa pun, bahkan yang tidak diminta, tanpa verifikasi",
      ],
      correct: 3,
      explanation:
        "Penyerang cukup mengirim ARP Reply palsu (gratuitous ARP) yang mengaku 'IP gateway ada di MAC saya'. Korban langsung percaya dan mengirim traffic ke perangkat penyerang.",
      concept: "Kelemahan ARP",
      conceptNote:
        "ARP tidak punya autentikasi (lihat Topik 03 · Protokol ARP dan Mengapa Ia Rentan).",
    },
    {
      id: "na-10",
      type: "scenario",
      prompt: "Studi kasus: Kamu membantu admin lab komputer kampus dan menerima peringatan berikut. Apa langkah yang paling tepat?",
      message: {
        sender: "arpwatch@lab-server",
        time: "Hari ini, 10.47",
        lines: [
          "changed ethernet address",
          "IP: 192.168.1.1 (gateway)",
          "MAC lama: 00:1a:2b:3c:4d:5e → MAC baru: 08:00:27:aa:bb:cc",
        ],
      },
      options: [
        "Lacak MAC baru ke port switch, isolasi perangkatnya, ganti sesi/kata sandi yang mungkin bocor, lalu aktifkan DHCP Snooping dan Dynamic ARP Inspection",
        "Abaikan karena perubahan MAC gateway adalah hal biasa setiap jam",
        "Matikan arpwatch agar peringatan tidak muncul lagi",
        "Minta semua mahasiswa mengganti wallpaper komputer",
      ],
      correct: 0,
      explanation:
        "MAC gateway yang tiba-tiba berubah adalah tanda klasik ARP spoofing. Perangkat penyerang perlu ditemukan dan diisolasi, kredensial yang mungkin tersadap diganti, dan switch diperkuat dengan DHCP Snooping serta DAI.",
      concept: "Mendeteksi ARP Spoofing",
      conceptNote:
        "Perubahan pemetaan IP–MAC gateway harus segera diselidiki (lihat Topik 03 · studi kasus skenario perangkat asing di ruang rapat).",
    },
    {
      id: "na-11",
      type: "single",
      prompt:
        "Benar atau salah: Dynamic ARP Inspection (DAI) memakai database binding dari DHCP Snooping untuk membuang paket ARP yang pemetaan IP–MAC-nya tidak sesuai.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. DHCP Snooping mencatat IP yang diberikan DHCP beserta MAC dan port switch yang sah. DAI lalu memeriksa setiap paket ARP terhadap catatan ini dan membuang yang tidak cocok.",
      concept: "DHCP Snooping + DAI",
      conceptNote:
        "Pertahanan ARP di tingkat switch (lihat Topik 03 · Deteksi dan Mitigasi: Static ARP, DHCP Snooping, dan Dynamic ARP Inspection).",
    },
    {
      id: "na-12",
      type: "single",
      prompt: "Bagaimana cara kerja malware DNSChanger yang dibongkar FBI dalam Operation Ghost Click (2011)?",
      options: [
        "Menghapus semua file di komputer korban",
        "Mengenkripsi hard disk dan meminta tebusan",
        "Mengubah pengaturan DNS komputer korban agar memakai server DNS milik pelaku, sehingga traffic web dan iklan bisa dibelokkan",
        "Mencuri baterai laptop korban dari jarak jauh",
      ],
      correct: 2,
      explanation:
        "Menurut FBI, sekitar 4 juta komputer di lebih dari 100 negara terinfeksi, dan pelaku meraup setidaknya 14 juta dolar AS dari penipuan iklan. Pengadilan sampai memerintahkan server DNS pengganti yang bersih agar korban tidak langsung kehilangan internet.",
      concept: "DNS Spoofing lewat Malware",
      conceptNote:
        "Mengubah resolver korban sama efektifnya dengan meracuni cache (lihat Topik 04 · studi kasus Operation Ghost Click).",
    },
    {
      id: "na-13",
      type: "scenario",
      prompt: "Studi kasus: Saat membuka halaman pengaturan router rumah, kamu melihat hal berikut, padahal tidak pernah mengubahnya. Apa langkah yang paling tepat?",
      message: {
        sender: "Halaman Admin Router",
        time: "Pengaturan WAN",
        lines: [
          "Primary DNS: 185.xx.xx.12 (tidak dikenal)",
          "Secondary DNS: 185.xx.xx.13 (tidak dikenal)",
          "Password admin: masih bawaan pabrik",
        ],
      },
      options: [
        "Biarkan saja selama internet masih bisa dipakai",
        "Kembalikan DNS ke pengaturan ISP atau resolver tepercaya, ganti password admin, perbarui firmware, dan matikan akses admin dari internet",
        "Restart router lalu lupakan masalahnya",
        "Unggah tangkapan layar pengaturan ke media sosial untuk bertanya",
      ],
      correct: 1,
      explanation:
        "DNS yang diubah tanpa sepengetahuan pemilik bisa membelokkan semua perangkat di rumah ke situs palsu. Restart tidak mengubah pengaturan yang sudah diganti. Pulihkan DNS, amankan akun admin, dan perbarui firmware.",
      concept: "Hardening Router",
      conceptNote:
        "Router dengan password bawaan rentan diubah DNS-nya (lihat Topik 04 · Pertahanan: DNSSEC, DoH/DoT, dan Local Hardening).",
    },
    {
      id: "na-14",
      type: "multi_select",
      prompt: "Mana saja langkah yang membantu melindungi dari DNS spoofing? Pilih semua yang benar.",
      options: [
        "Memakai resolver yang memvalidasi DNSSEC",
        "Memakai DNS over HTTPS (DoH) atau DNS over TLS (DoT) ke resolver tepercaya",
        "Menonaktifkan perlindungan DNS rebinding di router",
        "Rutin memeriksa pengaturan DNS di router dan perangkat",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. DNSSEC memastikan jawaban DNS ditandatangani dan tidak diubah di perjalanan.",
        "Benar. Enkripsi DNS mencegah penyadapan dan manipulasi di jaringan lokal atau ISP.",
        "Salah. Perlindungan DNS rebinding justru sebaiknya diaktifkan bila tersedia.",
        "Benar. Banyak serangan, seperti DNSChanger, bekerja dengan diam-diam mengganti pengaturan DNS.",
      ],
      concept: "Pertahanan DNS",
      conceptNote:
        "DNSSEC, enkripsi DNS, dan hardening lokal saling melengkapi (lihat Topik 04 · Pertahanan: DNSSEC, DoH/DoT, dan Local Hardening).",
    },
    {
      id: "na-15",
      type: "single",
      prompt: "Serangan apa yang terutama dicegah oleh HSTS (HTTP Strict Transport Security)?",
      options: [
        "Serangan DDoS volumetrik",
        "Pencurian laptop secara fisik",
        "Serangan ARP flood",
        "SSL stripping, yaitu menurunkan koneksi HTTPS menjadi HTTP",
      ],
      correct: 3,
      explanation:
        "HSTS memerintahkan browser untuk selalu memakai HTTPS bagi domain tersebut, sehingga penyerang MITM tidak bisa memaksa korban berpindah ke HTTP. Dengan HSTS preload, kunjungan pertama pun langsung memakai HTTPS.",
      concept: "HSTS",
      conceptNote:
        "HSTS mencegah downgrade ke HTTP (lihat Topik 05 · Pertahanan Komprehensif: Certificate Pinning, HSTS, dan Zero Trust).",
    },
    {
      id: "na-16",
      type: "scenario",
      prompt: "Studi kasus: Kakakmu memakai Wi-Fi gratis di mal dan melihat peringatan browser berikut saat membuka situs internet banking. Apa saran yang paling tepat?",
      message: {
        sender: "Peringatan Browser",
        time: "Hari ini, 13.05",
        lines: [
          "Your connection is not private",
          "Penyerang mungkin mencoba mencuri informasi Anda dari situs bank ini.",
          "NET::ERR_CERT_AUTHORITY_INVALID",
        ],
      },
      options: [
        "Jangan lanjutkan; putuskan Wi-Fi tersebut dan akses bank lewat data seluler atau aplikasi resmi",
        "Klik 'Advanced' lalu 'Proceed' karena peringatan seperti ini biasa muncul",
        "Lanjutkan saja asalkan tidak memasukkan OTP",
        "Matikan antivirus agar peringatan hilang",
      ],
      correct: 0,
      explanation:
        "Sertifikat yang tidak valid pada situs bank adalah tanda kuat adanya MITM, misalnya melalui access point palsu. Melanjutkan berarti mengirim kredensial ke penyerang.",
      concept: "Peringatan Sertifikat",
      conceptNote:
        "MITM sering memakai sertifikat palsu untuk menyadap HTTPS (lihat Topik 05 · Mekanisme MITM: Dari Posisi Strategis hingga Kontrol Penuh).",
    },
    {
      id: "na-17",
      type: "single",
      prompt: "Menurut FTC, apa yang membuat perangkat lunak Superfish VisualDiscovery di laptop Lenovo berbahaya?",
      options: [
        "Perangkat lunak itu membuat layar laptop menjadi gelap",
        "Perangkat lunak itu bertindak sebagai man-in-the-middle untuk traffic HTTPS dan mengganti sertifikat situs tanpa memvalidasinya dengan benar",
        "Perangkat lunak itu hanya mengganti nada dering",
        "Perangkat lunak itu memblokir semua iklan",
      ],
      correct: 1,
      explanation:
        "VisualDiscovery menyisipkan iklan dengan menyadap koneksi terenkripsi dan mengganti sertifikat asli. FTC juga menyebut kata sandi yang sama dan mudah dibobol dipakai di semua laptop terdampak, sehingga penyerang lain bisa ikut memanfaatkannya.",
      concept: "MITM dari Perangkat Lunak",
      conceptNote:
        "MITM bisa berasal dari software yang sudah terpasang (lihat Topik 05 · studi kasus Superfish di laptop Lenovo).",
    },
    {
      id: "na-18",
      type: "scenario",
      prompt: "Studi kasus: Seorang kreator konten pemula menerima email berikut. Apa respons yang paling tepat?",
      message: {
        sender: "partnership@vpn-promo-deal.com",
        time: "Kemarin, 20.31",
        lines: [
          "Halo! Kami ingin mensponsori kanal Anda senilai $500 per video.",
          "Silakan coba aplikasi kami dulu, lalu ulas di video Anda:",
          "📎 Setup_VPN_Pro.zip (password: 2024)",
        ],
      },
      options: [
        "Langsung jalankan aplikasinya karena tawaran sponsor jarang datang",
        "Jalankan aplikasinya, lalu ganti password setelahnya",
        "Jangan jalankan file tersebut; verifikasi perusahaan lewat situs resminya, karena file seperti ini sering berisi malware pencuri cookie sesi",
        "Teruskan file ke teman agar mereka ikut mencoba",
      ],
      correct: 2,
      explanation:
        "Tawaran sponsor palsu adalah umpan umum untuk mengirim malware pencuri data (infostealer). Begitu file dijalankan, cookie sesi di browser dicuri dan akun bisa diambil alih tanpa password atau MFA (pass-the-cookie). Arsip ZIP berpassword sering dipakai agar lolos pemindaian antivirus email.",
      concept: "Umpan Sponsor Palsu",
      conceptNote:
        "Malware pencuri cookie sering menyamar sebagai software sponsor (lihat Topik 06 · Pass-the-Cookie: Mengapa MFA Saja Tidak Cukup).",
    },
    {
      id: "na-19",
      type: "single",
      prompt: "Mengapa pencurian cookie sesi (pass-the-cookie) dapat melewati perlindungan MFA?",
      options: [
        "Karena MFA tidak pernah bekerja di browser",
        "Karena cookie berisi password dalam bentuk teks biasa",
        "Karena penyerang selalu mengetahui kode OTP korban",
        "Karena cookie sesi dibuat SETELAH login dan MFA berhasil, sehingga pemegangnya dianggap sudah terautentikasi",
      ],
      correct: 3,
      explanation:
        "Cookie sesi adalah 'tiket masuk' setelah semua pemeriksaan selesai. Siapa pun yang memegangnya bisa dianggap sebagai pengguna sah. Karena itu layanan perlu mendeteksi sesi yang berpindah perangkat atau lokasi dan meminta autentikasi ulang untuk tindakan sensitif.",
      concept: "Pass-the-Cookie",
      conceptNote:
        "MFA melindungi login, bukan sesi yang sudah terbentuk (lihat Topik 06 · Pass-the-Cookie: Mengapa MFA Saja Tidak Cukup).",
    },
    {
      id: "na-20",
      type: "multi_select",
      prompt: "Sebagai developer aplikasi web, mana saja praktik yang membantu mencegah session hijacking? Pilih semua yang benar.",
      options: [
        "Memberi flag Secure, HttpOnly, dan SameSite pada cookie sesi",
        "Membuat ulang (regenerate) session ID setelah login berhasil",
        "Menyimpan session ID di URL agar mudah dibagikan",
        "Menghapus sesi di sisi server saat pengguna logout",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Secure mencegah pengiriman lewat HTTP, HttpOnly mencegah pembacaan lewat JavaScript, dan SameSite membatasi pengiriman lintas situs.",
        "Benar. Ini mencegah session fixation, yaitu memaksa korban memakai session ID yang sudah diketahui penyerang.",
        "Salah. Session ID di URL mudah bocor lewat riwayat browser, log server, dan header Referer.",
        "Benar. Jika sesi hanya dihapus di browser, cookie curian masih bisa dipakai.",
      ],
      concept: "Manajemen Sesi yang Aman",
      conceptNote:
        "Flag cookie dan siklus hidup sesi yang benar adalah pertahanan pertama (lihat Topik 06 · Pertahanan: Secure Cookie Flags, Session Management, dan Behavioral Analytics).",
    },
  ],
};