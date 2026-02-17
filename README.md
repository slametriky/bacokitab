# Bacokitab 📖

**Bacokitab, bantu i'rab bahasa arab**

Bacokitab adalah aplikasi berbasis AI yang dirancang untuk membantu pelajar, santri, dan pengajar bahasa Arab dalam menganalisis tata bahasa (Nahwu & Shorof) secara instan dan akurat. Dengan dukungan teknologi AI terkini, Bacokitab dapat melakukan I'rab (analisis kedudukan kata) dari teks Arab gundul maupun berharokat.

![Bacokitab Preview](/screen.png)

## 🌟 Fitur Unggulan

- **Analisis I'rab Instan**: Dapatkan pemecahan gramatikal lengkap (kedudukan kata, tanda I'rab, dll) dalam hitungan detik.
- **Dukungan Multi-Input**:
  - 🎹 **Teks**: Ketik atau tempel teks Arab langsung.
  - (Segera Hadir) 📸 **OCR / Foto**: Unggah foto kitab atau tulisan tangan.
  - (Segera Hadir) 🎙️ **Suara**: Input melalui dikte suara bahasa Arab.
- **Tampilan Modern**: Antarmuka yang bersih, responsif, dan mudah digunakan (User Friendly).
- **Dark Mode**: Mendukung mode gelap untuk kenyamanan membaca di malam hari.

## 🚀 Teknologi

Project ini dibangun menggunakan:

- **[Vue.js 3](https://vuejs.org/)**: Framework JavaScript progresif untuk membangun antarmuka pengguna.
- **[Vite](https://vitejs.dev/)**: Build tool super cepat untuk pengembangan web modern.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first untuk styling yang cepat dan fleksibel.
- **[Flowbite](https://flowbite.com/)**: Komponen UI berbasis Tailwind CSS.
- **[Vue Router](https://router.vuejs.org/)**: Routing resmi untuk Vue.js.

## 🛠️ Cara Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal Anda:

### Prasyarat

- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- npm (biasanya sudah terinstal bersama Node.js)

### Langkah-langkah

1.  **Clone repositori ini** (jika menggunakan git):

    ```bash
    git clone https://github.com/username/bacokitab.git
    cd bacokitab
    ```

2.  **Instal dependensi**:

    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**:
    Buat file `.env` di root project dan tambahkan variabel berikut (sesuaikan dengan endpoint API backend Anda):

    ```env
    VITE_API_BASE_URL=http://127.0.0.1:8000
    ```

4.  **Jalankan development server**:

    ```bash
    npm run dev
    ```

5.  **Buka di browser**:
    Akses `http://localhost:5173` (atau port yang tertera di terminal).

## 📂 Struktur Project

```
bacokitab/
├── public/              # Aset statis (favicon, gambar, dll)
├── src/
│   ├── components/      # Komponen Vue (LandingPage, InputSection, ResultSection, dll)
│   ├── router/          # Konfigurasi routing
│   ├── services/        # Logic untuk API call
│   ├── App.vue          # Root component
│   ├── main.js          # Entry point aplikasi
│   └── style.css        # Global styles & Tailwind imports
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── package.json         # Dependensi project & scripts
├── tailwind.config.js   # Konfigurasi Tailwind CSS
└── vite.config.js       # Konfigurasi Vite
```

## 🤝 Kontribusi

Kontribusi selalu diterima! Jika Anda ingin berkontribusi:

1.  Fork repositori ini.
2.  Buat branch fitur baru (`git checkout -b fitur-keren`).
3.  Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4.  Push ke branch (`git push origin fitur-keren`).
5.  Buat Pull Request.

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

Dibuat dengan ❤️ di Palembang.
