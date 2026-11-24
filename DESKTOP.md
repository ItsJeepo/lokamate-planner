# Lokamate.ai sebagai aplikasi desktop (.exe)

Lokamate adalah aplikasi web. Versi desktop-nya adalah pembungkus kecil yang
membuka web Lokamate di jendela aplikasi sendiri — seperti Chrome tanpa bilah
alamat. Panduan ini memakai **Tauri** (ringan, hasil `.exe` kecil).

Web-nya sendiri sudah disiapkan: ikon, nama "Lokamate.ai", warna tema biru,
dan berkas `manifest.webmanifest` sudah ada, jadi saat dibungkus tampilannya
langsung seperti aplikasi.

## Yang perlu dipasang di komputermu

1. **Node.js** — unduh dari https://nodejs.org (versi LTS), instal, selesai.
2. **Rust** — unduh dari https://rustup.rs, jalankan, pilih opsi default.
3. Di Windows: **Microsoft C++ Build Tools** — https://visualstudio.microsoft.com/visual-cpp-build-tools/ (centang "Desktop development with C++").
4. WebView2 — biasanya sudah ada di Windows 10/11.

## Langkah membungkus

Jalankan perintah berikut di terminal, di dalam folder proyek Lokamate:

```bash
npm install
npx tauri init
```

Saat `tauri init` bertanya, isi:

- **App name**: `Lokamate.ai`
- **Window title**: `Lokamate.ai`
- **Frontend assets**: `dist`
- **Dev URL**: `http://localhost:8080`
- **Frontend dev command**: `npm run dev`
- **Frontend build command**: `npm run build`

Lalu buka berkas `src-tauri/tauri.conf.json` yang tercipta, dan ubah alamat
jendela agar menunjuk ke Lokamate yang sudah online:

```json
{
  "app": {
    "windows": [
      {
        "title": "Lokamate.ai",
        "url": "https://ALAMAT-WEB-LOKAMATE-KAMU",
        "width": 1280,
        "height": 860
      }
    ]
  },
  "bundle": {
    "targets": ["nsis"],
    "icon": ["../public/icons/icon-512.png"]
  }
}
```

Ganti `ALAMAT-WEB-LOKAMATE-KAMU` dengan alamat Lokamate yang sudah dipublish
(lihat langkah Publish di Lovable).

Terakhir, hasilkan installernya:

```bash
npx tauri build
```

Installer `.exe` akan muncul di `src-tauri/target/release/bundle/nsis/`.
Bagikan berkas itu — siapa pun bisa klik dua kali untuk memasang Lokamate
sebagai aplikasi Windows.

## Catatan

- Aplikasi desktop ini tetap butuh internet, karena isinya adalah web
  Lokamate. Kalau koneksi putus, aplikasi menampilkan pemberitahuan ramah,
  bukan halaman error browser.
- Login tetap tersimpan saat aplikasi ditutup dan dibuka lagi.
- Kalau nanti Lokamate dijalankan lokal dengan MySQL (lihat `HOSTING.md`),
  isi `url` di atas dengan `http://localhost:8080` saja.
