import type { ModuleQuiz } from "./types";

// Soal materi DDoS / DoS Attack (slug: ddos).
// 20 soal: konsep, studi kasus (scenario), benar/salah, dan pilih-semua.
// Setiap soal mengacu ke topik pada ddos.json (Topik 00 sampai 05).
export const ddosQuiz: ModuleQuiz = {
  quiz: [
    {
      id: "dd-1",
      type: "single",
      prompt: "Serangan yang membanjiri server dengan permintaan HTTP yang tampak seperti pengunjung biasa, sehingga CPU dan database kewalahan, termasuk kategori…",
      options: [
        "Serangan volumetrik",
        "Serangan lapisan aplikasi (Layer 7)",
        "Serangan protokol",
        "Serangan fisik terhadap pusat data",
      ],
      correct: 1,
      explanation:
        "Serangan Layer 7 meniru perilaku pengguna asli dan menguras sumber daya aplikasi, bukan bandwidth. Serangan volumetrik menyumbat bandwidth, sedangkan serangan protokol menghabiskan tabel koneksi pada server, firewall, atau load balancer.",
      concept: "Tiga Kategori DDoS",
      conceptNote:
        "Volumetrik, protokol, dan lapisan aplikasi menyerang sumber daya yang berbeda (lihat Topik 00 · Tiga Kategori Utama Serangan DDoS).",
    },
    {
      id: "dd-2",
      type: "scenario",
      prompt: "Studi kasus: Kamu bertugas sebagai admin di sebuah toko online. Tiba-tiba muncul pesan berikut di grup tim. Apa langkah pertama yang paling tepat?",
      message: {
        sender: "Monitoring Bot",
        time: "Hari ini, 19.42",
        lines: [
          "⚠️ Traffic masuk naik 40x lipat dalam 3 menit.",
          "Sebagian besar dari ribuan IP berbeda, menuju halaman /search.",
          "Waktu respons server: 18 detik. Banyak pelanggan gagal checkout.",
        ],
      },
      options: [
        "Mematikan server agar serangan berhenti dengan sendirinya",
        "Menunggu sampai besok pagi sambil berharap traffic turun",
        "Memastikan ini serangan, menjalankan rencana respons insiden, menghubungi ISP atau penyedia mitigasi, dan mencatat bukti (waktu, IP, packet capture)",
        "Memblokir satu alamat IP yang paling banyak mengirim permintaan, lalu menganggap masalah selesai",
      ],
      correct: 2,
      explanation:
        "Panduan CISA–FBI–MS-ISAC menyarankan: pastikan dulu bahwa ini serangan, aktifkan rencana respons, minta bantuan ISP atau penyedia mitigasi untuk memfilter traffic, dan kumpulkan bukti. Memblokir satu IP tidak cukup karena DDoS datang dari ribuan sumber, sedangkan mematikan server justru membuat tujuan penyerang tercapai.",
      concept: "Respons Insiden DDoS",
      conceptNote:
        "Konfirmasi → aktifkan rencana → libatkan ISP/mitigasi → kumpulkan bukti (lihat Topik 00 · Langkah Respons Saat Terkena DDoS (Panduan CISA–FBI–MS-ISAC)).",
    },
    {
      id: "dd-3",
      type: "single",
      prompt:
        "Benar atau salah: Karena Cloudflare melaporkan Indonesia sebagai sumber serangan DDoS terbesar di dunia (2025), berarti hampir semua pelaku serangan tersebut adalah orang Indonesia.",
      options: ["Benar", "Salah"],
      correct: 1,
      explanation:
        "Salah. 'Sumber' berarti lokasi alamat IP yang mengirim traffic serangan. Banyak di antaranya adalah router, server, atau perangkat IoT di Indonesia yang tidak aman dan ikut dikendalikan botnet tanpa disadari pemiliknya. Pengendali botnet bisa berada di negara mana pun.",
      concept: "Makna 'Sumber Serangan'",
      conceptNote:
        "Perangkat yang tidak aman di Indonesia bisa menjadi bagian dari 'pasukan' penyerang (lihat Topik 00 · studi kasus Indonesia sumber DDoS terbesar dan botnet Aisuru).",
    },
    {
      id: "dd-4",
      type: "multi_select",
      prompt: "Menurut panduan CISA, FBI, dan MS-ISAC, mana saja persiapan yang sebaiknya dilakukan SEBELUM serangan DDoS terjadi? Pilih semua yang benar.",
      options: [
        "Mengenali pola traffic normal (baseline) agar lonjakan aneh cepat terdeteksi",
        "Menyiapkan rencana respons insiden dan daftar kontak ISP atau penyedia hosting",
        "Menunda patch sistem agar server tidak perlu di-restart",
        "Mempertimbangkan layanan mitigasi DDoS atau CDN, serta rate limit pada firewall",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Tanpa baseline, sulit membedakan serangan dari lonjakan pengunjung yang wajar.",
        "Benar. Saat serangan berlangsung, tidak ada waktu untuk mencari kontak dan menyusun rencana dari nol.",
        "Salah. Panduan justru meminta sistem selalu di-patch agar celah tidak bisa dimanfaatkan.",
        "Benar. Kapasitas dan penyaringan dari penyedia mitigasi jauh lebih besar daripada kemampuan server sendiri.",
      ],
      concept: "Persiapan Sebelum Serangan",
      conceptNote:
        "Baseline, rencana respons, mitigasi, dan patch disiapkan sejak awal (lihat Topik 00 · Langkah Respons Saat Terkena DDoS (Panduan CISA–FBI–MS-ISAC)).",
    },
    {
      id: "dd-5",
      type: "single",
      prompt: "Mengapa penyerang memalsukan alamat IP pengirim menjadi IP korban dalam serangan amplifikasi (reflection)?",
      options: [
        "Agar server publik menolak permintaan tersebut",
        "Agar traffic serangan terenkripsi secara otomatis",
        "Agar penyerang bisa menerima balasan berukuran besar di komputernya sendiri",
        "Agar balasan berukuran besar dari server publik (DNS, NTP, Memcached) dikirim ke korban, bukan ke penyerang",
      ],
      correct: 3,
      explanation:
        "Server publik membalas ke alamat pengirim yang tertera di paket. Dengan memalsukan alamat itu menjadi IP korban, penyerang membuat server-server tersebut 'memantulkan' balasan yang jauh lebih besar ke arah korban.",
      concept: "Reflection dan Spoofing",
      conceptNote:
        "Spoofing IP adalah kunci serangan reflection/amplification (lihat Topik 01 · Senjata Mematikan: Amplification dan Reflection Attacks).",
    },
    {
      id: "dd-6",
      type: "scenario",
      prompt: "Studi kasus: Hasil pemindaian keamanan kantormu menunjukkan temuan berikut. Apa tindakan yang paling tepat?",
      message: {
        sender: "Laporan Vulnerability Scan",
        time: "Senin, 09.00",
        lines: [
          "Host: cache-01.kantor.co.id",
          "Layanan: Memcached, port 11211/UDP",
          "Status: TERBUKA untuk seluruh internet",
        ],
      },
      options: [
        "Batasi akses Memcached hanya untuk jaringan internal dan matikan UDP jika tidak diperlukan",
        "Biarkan saja, karena Memcached hanya menyimpan cache",
        "Pindahkan Memcached ke port lain agar tidak ditemukan",
        "Tambahkan RAM agar server kuat menahan serangan",
      ],
      correct: 0,
      explanation:
        "Memcached yang terbuka lewat UDP bisa disalahgunakan sebagai 'pemantul' dengan faktor amplifikasi 10.000–51.000 kali (CISA). Server seperti inilah yang dipakai dalam serangan 1,35 Tbps ke GitHub. Menutupnya dari internet melindungi pihak lain sekaligus reputasi organisasi sendiri.",
      concept: "Menutup Amplifier",
      conceptNote:
        "Layanan internal tidak boleh terbuka ke internet (lihat Topik 01 · Strategi Mitigasi dan Pertahanan Jaringan).",
    },
    {
      id: "dd-7",
      type: "single",
      prompt: "Dalam serangan Memcached 1,35 Tbps ke GitHub (28 Februari 2018), apa yang membuat GitHub dapat pulih dalam hitungan menit?",
      options: [
        "Penyerang menghentikan serangan karena merasa kasihan",
        "GitHub membayar tebusan kepada penyerang",
        "GitHub mengalihkan traffic ke Akamai yang memiliki kapasitas besar untuk menyerap dan menyaring serangan",
        "GitHub memutus seluruh koneksi internetnya selama seminggu",
      ],
      correct: 2,
      explanation:
        "Menurut laporan insiden GitHub, layanan tidak dapat diakses penuh sekitar 5 menit dan terganggu berkala hingga 17.30 UTC. Pemulihan cepat terjadi karena traffic dialihkan ke Akamai, yang mampu menyerap serangan sebesar itu.",
      concept: "Mitigasi Berbasis Penyedia",
      conceptNote:
        "Kemitraan mitigasi yang disiapkan sebelumnya mempercepat pemulihan (lihat Topik 01 · studi kasus GitHub 2018).",
    },
    {
      id: "dd-8",
      type: "single",
      prompt: "Apa tantangan terbesar dalam menghentikan HTTP Flood?",
      options: [
        "HTTP Flood selalu berasal dari satu alamat IP",
        "HTTP Flood hanya terjadi pada situs tanpa HTTPS",
        "HTTP Flood mudah dikenali karena paketnya rusak",
        "Permintaannya terlihat seperti pengunjung asli, sehingga sulit dibedakan dari lonjakan traffic yang sah",
      ],
      correct: 3,
      explanation:
        "Bot HTTP Flood mengirim permintaan yang sah secara format, bahkan bisa meniru navigasi manusia. Memblokir berdasarkan volume saja berisiko menolak pelanggan asli, misalnya saat produk sedang viral.",
      concept: "Bot vs Pengguna Asli",
      conceptNote:
        "Inti masalah HTTP Flood adalah membedakan bot dari manusia (lihat Topik 02 · Mengapa HTTP Flood Sangat Sulit Dimitigasi?).",
    },
    {
      id: "dd-9",
      type: "scenario",
      prompt: "Studi kasus: Saat flash sale, tim IT melihat log berikut. Langkah pertahanan apa yang paling tepat tanpa mengusir pembeli asli?",
      message: {
        sender: "Log WAF",
        time: "Flash sale, 12.00",
        lines: [
          "POST /cart/add — 85.000 permintaan/menit",
          "User-Agent: python-requests/2.31 (sebagian besar)",
          "Tidak ada eksekusi JavaScript dari klien tersebut",
        ],
      },
      options: [
        "Mematikan fitur keranjang belanja untuk semua orang",
        "Mengaktifkan JavaScript challenge/browser fingerprinting dan rate limit per sesi di WAF",
        "Memblokir seluruh traffic dari Indonesia",
        "Membiarkan saja karena itu pasti pembeli yang antusias",
      ],
      correct: 1,
      explanation:
        "Browser asli akan menjalankan JavaScript challenge dan mengembalikan token, sedangkan skrip sederhana seperti python-requests tidak. Ditambah rate limit per sesi, bot tersaring sementara pembeli asli tetap bisa berbelanja.",
      concept: "WAF dan JavaScript Challenge",
      conceptNote:
        "JavaScript challenge menyaring bot tanpa mengganggu manusia (lihat Topik 02 · Pertahanan Cerdas: WAF dan Browser Fingerprinting).",
    },
    {
      id: "dd-10",
      type: "multi_select",
      prompt: "Mana saja pernyataan yang BENAR tentang serangan HTTP/2 Rapid Reset (2023)? Pilih semua yang benar.",
      options: [
        "Penyerang membuka permintaan lalu langsung membatalkannya dengan frame RST_STREAM, berulang kali",
        "Google mencatat puncak 398 juta permintaan per detik",
        "Serangan ini membutuhkan botnet berisi ratusan juta perangkat",
        "Celah ini dicatat sebagai CVE-2023-44487 dan diumumkan secara terkoordinasi agar vendor bisa merilis patch",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Stream yang dibatalkan membebaskan slot, sehingga batas jumlah stream tidak pernah tercapai.",
        "Benar. Angka ini sekitar 7,5 kali rekor Google sebelumnya (46 juta rps).",
        "Salah. Cloudflare mencatat puncak lebih dari 201 juta rps dari botnet yang hanya berisi sekitar 20.000 mesin.",
        "Benar. Pengumuman pada 10 Oktober 2023 dilakukan bersama agar server web, proxy, dan load balancer dapat diperbarui.",
      ],
      concept: "HTTP/2 Rapid Reset",
      conceptNote:
        "Fitur protokol bisa disalahgunakan untuk HTTP flood (lihat Topik 02 · studi kasus HTTP/2 Rapid Reset).",
    },
    {
      id: "dd-11",
      type: "single",
      prompt: "Sumber daya apa yang dihabiskan oleh serangan SYN Flood?",
      options: [
        "Tabel koneksi/backlog yang menyimpan koneksi setengah terbuka (half-open)",
        "Ruang penyimpanan hard disk server",
        "Kuota email pengguna",
        "Baterai perangkat klien",
      ],
      correct: 0,
      explanation:
        "Server menyimpan setiap SYN yang masuk sambil menunggu ACK terakhir. Karena ACK tidak pernah datang, backlog penuh dan server menolak koneksi baru, termasuk dari pengguna asli.",
      concept: "Half-Open Connection",
      conceptNote:
        "SYN Flood menyerang langkah ketiga 3-way handshake yang tidak pernah selesai (lihat Topik 03 · Mengeksploitasi TCP 3-Way Handshake).",
    },
    {
      id: "dd-12",
      type: "single",
      prompt:
        "Benar atau salah: Dengan SYN Cookies, server tidak menyimpan status koneksi saat menerima SYN, dan baru membangun koneksi setelah ACK dengan cookie yang valid tiba.",
      options: ["Benar", "Salah"],
      correct: 0,
      explanation:
        "Benar. Informasi koneksi 'dititipkan' dalam nomor urut SYN-ACK. Server baru mengalokasikan memori setelah memverifikasi cookie pada paket ACK, sehingga jutaan SYN palsu tidak menghabiskan memori.",
      concept: "SYN Cookies",
      conceptNote:
        "SYN Cookies membuat server stateless pada tahap awal handshake (lihat Topik 03 · Solusi Elegan: SYN Cookies dan TCP Proxy).",
    },
    {
      id: "dd-13",
      type: "scenario",
      prompt: "Studi kasus: Server web Linux di kampusmu tiba-tiba menolak koneksi baru. Admin menjalankan perintah dan melihat hasil berikut. Apa langkah mitigasi yang paling tepat?",
      message: {
        sender: "Terminal admin",
        time: "Hari ini, 14.10",
        lines: [
          "$ ss -tan state syn-recv | wc -l",
          "65.211",
          "Alamat sumber: acak, ribuan IP berbeda, tidak ada yang mengirim ACK",
        ],
      },
      options: [
        "Menghapus semua file log agar server lebih ringan",
        "Mengganti password akun admin",
        "Memblokir port 443 agar tidak ada koneksi sama sekali",
        "Mengaktifkan SYN Cookies (net.ipv4.tcp_syncookies) serta menyesuaikan backlog dan timeout, lalu melibatkan ISP/penyedia mitigasi bila perlu",
      ],
      correct: 3,
      explanation:
        "Puluhan ribu koneksi berstatus SYN-RECV dari IP acak adalah tanda klasik SYN Flood. SYN Cookies, penyesuaian backlog dan timeout (dirangkum dalam RFC 4987), serta bantuan penyedia mitigasi adalah langkah yang tepat. Memblokir port 443 sama saja mematikan layanan sendiri.",
      concept: "Mendeteksi SYN Flood",
      conceptNote:
        "Banyak koneksi SYN-RECV dari IP acak menandakan SYN Flood (lihat Topik 03 · Dampak pada Infrastruktur Jaringan).",
    },
    {
      id: "dd-14",
      type: "single",
      prompt: "Apa ciri khas serangan Slowloris dibandingkan serangan flood biasa?",
      options: [
        "Membutuhkan botnet berisi jutaan perangkat",
        "Mengirim paket rusak untuk memicu bug memori",
        "Memakai bandwidth sangat kecil dan menahan banyak koneksi tetap terbuka dengan mengirim header HTTP sedikit demi sedikit",
        "Hanya bisa menyerang server email",
      ],
      correct: 2,
      explanation:
        "Slowloris tidak membanjiri server. Ia membuka ratusan koneksi dan tidak pernah menyelesaikan header, sehingga semua slot koneksi terisi. Traffic-nya sangat kecil sehingga sering lolos dari deteksi berbasis volume.",
      concept: "Low-and-Slow",
      conceptNote:
        "Slowloris menahan koneksi, bukan membanjiri bandwidth (lihat Topik 04 · Mekanisme 'Low-and-Slow' Slowloris).",
    },
    {
      id: "dd-15",
      type: "scenario",
      prompt: "Studi kasus: Server Apache sebuah sekolah tidak bisa diakses, padahal grafik bandwidth normal. Admin melihat catatan berikut. Apa langkah yang paling tepat?",
      message: {
        sender: "server-status Apache",
        time: "Pagi ini, 07.30",
        lines: [
          "Slot pekerja terpakai: 400/400",
          "Status hampir semua slot: 'Reading Request' sejak lebih dari 10 menit",
          "Data masuk per koneksi: beberapa byte setiap 15 detik",
        ],
      },
      options: [
        "Menambah bandwidth internet sekolah",
        "Mengaktifkan dan mengatur mod_reqtimeout, membatasi koneksi per IP, dan menempatkan reverse proxy event-driven di depan Apache",
        "Mengganti tampilan halaman utama",
        "Memperbesar ukuran hard disk server",
      ],
      correct: 1,
      explanation:
        "Semua slot terisi koneksi yang 'membaca permintaan' sangat lambat adalah pola Slowloris. NVD mencatat kelemahan Apache ini sebagai CVE-2007-6750. mod_reqtimeout memutus klien yang terlalu lambat (default header=20-40,MinRate=500), sedangkan reverse proxy event-driven mampu menahan banyak koneksi idle.",
      concept: "Mendeteksi Slowloris",
      conceptNote:
        "Slot penuh tetapi bandwidth normal adalah tanda serangan low-and-slow (lihat Topik 04 · studi kasus CVE-2007-6750).",
    },
    {
      id: "dd-16",
      type: "multi_select",
      prompt: "Mana saja langkah yang efektif untuk memitigasi Slowloris? Pilih semua yang benar.",
      options: [
        "Menempatkan reverse proxy event-driven (misalnya Nginx atau HAProxy) di depan server aplikasi",
        "Mengatur timeout dan kecepatan minimum pengiriman header (misalnya mod_reqtimeout di Apache)",
        "Memperpanjang timeout koneksi agar klien lambat dilayani lebih lama",
        "Membatasi jumlah koneksi bersamaan dari satu alamat IP",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Proxy event-driven menahan koneksi lambat dan hanya meneruskan permintaan yang sudah lengkap.",
        "Benar. Klien yang terlalu lambat diputus dengan kode 408 sehingga slot cepat bebas.",
        "Salah. Timeout yang panjang justru memudahkan Slowloris menahan slot lebih lama.",
        "Benar. Satu mesin tidak bisa lagi mengisi seluruh slot server, meskipun botnet tetap perlu ditangani dengan analisis perilaku.",
      ],
      concept: "Mitigasi Slowloris",
      conceptNote:
        "Proxy, timeout ketat, dan batas koneksi per IP saling melengkapi (lihat Topik 04 · Mitigasi: Reverse Proxy dan Timeout Agresif).",
    },
    {
      id: "dd-17",
      type: "single",
      prompt: "Mengapa perangkat IoT seperti kamera IP dan router rumahan menjadi rekrutan favorit botnet?",
      options: [
        "Karena perangkat IoT selalu memakai antivirus terbaru",
        "Karena perangkat IoT tidak terhubung ke internet",
        "Karena banyak yang memakai password bawaan, jarang diperbarui, selalu menyala, dan jarang dipantau",
        "Karena perangkat IoT memiliki prosesor paling cepat di dunia",
      ],
      correct: 2,
      explanation:
        "Malware seperti Mirai memindai internet dan mencoba password bawaan (admin/admin). Perangkat yang selalu menyala dan jarang dipantau bisa menjadi 'zombie' selama bertahun-tahun tanpa disadari pemiliknya.",
      concept: "Kerentanan IoT",
      conceptNote:
        "Password bawaan dan firmware usang menjadikan IoT target empuk (lihat Topik 05 · Evolusi Botnet: Dari PC Windows ke Ekosistem IoT).",
    },
    {
      id: "dd-18",
      type: "scenario",
      prompt: "Studi kasus: Seorang teman di grup game mengirim pesan berikut. Bagaimana respons yang paling tepat?",
      message: {
        sender: "Raka (grup Mabar)",
        time: "Malam ini, 22.15",
        lines: [
          "Server tim lawan bikin kesel banget 😤",
          "Ada web 'stresser' murah, katanya cuma buat 'stress test'.",
          "Patungan yuk, kita jatuhin server mereka pas turnamen besok!",
        ],
      },
      options: [
        "Ikut patungan karena layanannya menyebut diri 'stress test', jadi pasti legal",
        "Ikut saja asalkan memakai VPN agar tidak terlacak",
        "Diam-diam mencoba layanannya ke server sekolah dulu sebagai uji coba",
        "Menolak dan mengingatkan bahwa menyerang server orang lain adalah tindak pidana; operator dan pelanggan booter dapat dilacak, seperti dalam Operasi PowerOFF",
      ],
      correct: 3,
      explanation:
        "Label 'stress test' tidak membuat serangan menjadi legal karena tidak ada izin dari pemilik server. Dalam Operasi PowerOFF, FBI menyita 48 domain booter dan beberapa orang didakwa atau ditangkap. Di Indonesia, mengganggu sistem elektronik dilarang UU ITE (Pasal 33).",
      concept: "Hukum DDoS-for-Hire",
      conceptNote:
        "Uji beban yang sah hanya untuk sistem sendiri atau dengan izin tertulis (lihat Topik 05 · Aspek Hukum: Menyewa 'Stresser' Bukan Uji Coba yang Legal).",
    },
    {
      id: "dd-19",
      type: "multi_select",
      prompt: "Kamu baru memasang kamera CCTV Wi-Fi di rumah. Mana saja langkah yang membantu agar kamera tidak menjadi bagian botnet? Pilih semua yang benar.",
      options: [
        "Mengganti password bawaan dengan password yang kuat dan unik",
        "Memperbarui firmware secara rutin",
        "Membuka akses Telnet dari internet agar mudah dikontrol dari luar rumah",
        "Menempatkan perangkat IoT di jaringan terpisah (guest network/VLAN)",
      ],
      correct: [0, 1, 3],
      explanation: [
        "Benar. Botnet IoT masuk lewat daftar password bawaan.",
        "Benar. Firmware baru menutup celah yang sudah diketahui.",
        "Salah. Telnet yang terbuka dari internet adalah pintu masuk utama malware seperti Mirai.",
        "Benar. Jika kamera diretas, penyerang tidak mudah berpindah ke laptop atau NAS di jaringan utama.",
      ],
      concept: "Mengamankan Perangkat IoT",
      conceptNote:
        "Password unik, update firmware, tutup akses jarak jauh, dan isolasi jaringan (lihat Topik 05 · Memutus Rantai Botnet dan Melindungi Perangkat).",
    },
    {
      id: "dd-20",
      type: "single",
      prompt: "Menurut Europol, berapa banyak serangan yang telah dilancarkan melalui SATU situs booter yang ditutup dalam Operasi PowerOFF (Desember 2022)?",
      options: [
        "Lebih dari 30 juta serangan",
        "Sekitar 300 serangan",
        "Tepat 48 serangan",
        "Belum pernah dipakai sama sekali",
      ],
      correct: 0,
      explanation:
        "Europol menyebut satu situs yang disita telah dipakai untuk lebih dari 30 juta serangan. Angka 48 adalah jumlah domain yang disita FBI. Ini menunjukkan bahwa menutup satu penyedia layanan booter dapat mengurangi serangan dalam jumlah sangat besar.",
      concept: "Skala Industri Booter",
      conceptNote:
        "Satu layanan murah bisa menghasilkan puluhan juta serangan (lihat Topik 05 · studi kasus Operasi PowerOFF).",
    },
  ],
};