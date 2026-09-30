# Menjalankan Lokamate sendiri dengan MySQL

Panduan ini untuk menjalankan Lokamate di komputermu sendiri, dengan datamu
tersimpan di MySQL milikmu — tanpa bergantung pada hosting Lovable. Ditulis
langkah demi langkah; salin-tempel saja setiap perintah.

> Selama Lokamate dibuka lewat alamat Lovable (pratinjau/publish), ia tetap
> memakai penyimpanan bawaan Lovable. MySQL hanya aktif saat kamu menjalankan
> Lokamate di komputermu sendiri, karena database di komputermu tidak bisa
> dijangkau dari internet.

## 1. Pasang alat-alatnya

1. **Node.js** (LTS): https://nodejs.org — klik Next sampai selesai.
2. **MySQL**: https://dev.mysql.com/downloads/installer/ — pilih "MySQL
   Installer for Windows", saat instalasi pilih **Server only** boleh, dan
   **catat kata sandi root** yang kamu buat.

## 2. Buat database dan tabel

Buka "MySQL Command Line Client" (ada di menu Start), masukkan kata sandi
root, lalu ketik:

```sql
SOURCE C:/lokasi/proyek/tripmate/mysql/schema.sql;
```

(ganti lokasinya dengan folder tempat kamu menyimpan proyek ini). File itu
membuat database `tripmate` beserta tabel `users` dan `itineraries`.

## 3. Sambungkan Lokamate ke MySQL

Di folder proyek, buat berkas bernama `.env.local` (teks biasa) berisi:

```
DATA_SOURCE=mysql
DATABASE_URL=mysql://root:KATA_SANDI_KAMU@localhost:3306/tripmate
```

Ganti `KATA_SANDI_KAMU` dengan kata sandi MySQL-mu.

## 4. Jalankan Lokamate

Di terminal, dari folder proyek:

```bash
npm install
npm run dev
```

Buka http://localhost:8080 di browser. Lokamate sekarang berjalan di
komputermu, dan semua itinerary tersimpan di MySQL-mu.

## 5. AI-nya

Ada dua pilihan, diatur lewat `.env.local`:

- **AI bawaan** — hanya jalan di hosting Lovable. Saat hosting sendiri WAJIB pakai kunci OpenAI.
- **Kunci OpenAI milikmu** — tambahkan:

```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Hasil itinerary dan seluruh halaman sama saja; yang berubah hanya akun yang
membayar panggilan AI-nya.

## 6. Memindahkan data

Di halaman **Itinerary Saya** ada tombol **Unduh semua (JSON)**. Berkas itu
berisi seluruh itinerary-mu dan bisa diimpor ke penyimpanan mana pun nanti —
jadi datamu tidak pernah terkunci di satu tempat.

## 7. Login Google saat hosting sendiri

Login email/nama + sandi langsung jalan. Untuk Google: buat OAuth Client ID di
Google Cloud Console, masukkan Client ID & Secret di pengaturan Auth backend
Lovable Cloud, lalu tambahkan domainmu (mis. http://localhost:8080) ke daftar
Redirect URL. Lokamate otomatis memakai jalur Google langsung di luar domain Lovable.

## 8. Fitur tanpa kunci

Kurs mata uang (Frankfurter/ECB), peta (OpenStreetMap), pencarian lokasi
(Nominatim) dan rute (OSRM) gratis dan jalan otomatis — butuh internet.
Semua kunci lihat `.env.example`.
