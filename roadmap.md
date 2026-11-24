# Lokamate — Roadmap

## Dashboard laporan (selesai)
- [x] Tambahkan dashboard berbasis data itinerary dengan filter/pengelompokan dan grafik batang, garis, serta lingkaran.
- [x] Verifikasi akses data per akun dan tampilan desktop/mobile.

## Profil akun
- [x] Tambahkan halaman profil dengan data pribadi, email akun, dan keamanan, serta akses dari menu profil.
- [x] Verifikasi penyimpanan data profil dan tampilan pada layar kecil.

## Jelajah destinasi
- [x] Tampilkan pilihan destinasi populer dengan gambar gradasi landmark khas masing-masing dan verifikasi tampilannya.
- [x] Pastikan seluruh gambar destinasi tersimpan lokal dan ikut tersedia saat hosting mandiri.

## Fondasi (selesai)
- [x] Lovable Cloud aktif (auth + tabel itineraries, RLS + GRANT)
- [x] Design system biru #08519C + putih, font Plus Jakarta Sans + DM Sans
- [x] Kamus dua bahasa (id/en) + provider + pemilih bahasa di footer
- [x] Header: logo Lokamate clickable, tombol Masuk + Mulai Sekarang
- [x] Halaman utama: hero, pembanding, manfaat, form 4 langkah, contoh hasil, FAQ, CTA gelap
- [x] Footer 3 kolom dengan placeholder teks (menunggu teks asli dari user)
- [x] Server function AI pembuat itinerary + halaman /auth, /itinerary/$id, /perjalanan, /destinasi, /tentang, /membuat
- [x] Draft form tersimpan saat login, lanjut proses setelah login
- [x] Meta head unik per halaman

## Fase arsitektur (disetujui 2026-09-08)
- [x] Lapisan AI dua jalur: `AI_PROVIDER` = lovable (sekarang) / openai (nanti, kunci user)
- [x] Lapisan penyimpanan dua jalur: `DATA_SOURCE` = lovable (host) / mysql (lokal)
- [x] Skema MySQL di mysql/schema.sql
- [x] Ekspor semua itinerary sebagai JSON (tombol di /perjalanan)
- [x] PWA: manifest + ikon + theme-color + indikator offline
- [x] DESKTOP.md — panduan membungkus jadi .exe (Tauri)
- [x] HOSTING.md — panduan menjalankan lokal dengan MySQL

## Nanti
- [ ] User memasukkan OPENAI_API_KEY lewat secret store saat siap pindah AI
- [ ] Teks asli footer (alamat/kontak/medsos) dari user
- [ ] Pembayaran setelah masa demo selesai
- [x] Pengujian end-to-end pembuatan itinerary dari preview

## Rebranding & pengalaman halaman utama
- [x] Ganti seluruh identitas Tripmate.ai menjadi Lokamate
- [x] Ubah contoh hasil menjadi peta rute tiga hari dengan detail waktu yang dapat dibuka
- [x] Tambahkan latar foto wisata Indonesia yang berganti lembut saat halaman digulir
- [x] Verifikasi tampilan desktop dan mobile

## Planner onboarding
- [x] Judul utama statis dan berganti pilihan setiap kunjungan halaman
- [x] Alur pengenalan enam langkah dengan navigasi kembali dan indikator progres
- [x] Pengisian nama panggilan serta pencarian dan pilihan destinasi Indonesia
- [x] Seluruh teks Planner tersedia dalam bahasa Indonesia dan Inggris
- [ ] Pertanyaan preferensi lanjutan dan ilustrasi HP final (menunggu arahan/aset berikutnya)

## Akses demo
- [x] Akun admin uji dibuat (login: admin)
- [x] Lapisan gelap latar beranda menyatu tanpa garis patahan antarbagian

## Kedatangan & rombongan
- [x] Langkah "Kamu tiba lewat mana?" dan "Berlibur bersama berapa orang?" dipasang di planner
- [x] Tombol Lanjut terkunci tanpa titik tiba / tanpa orang dewasa
- [x] Titik kedatangan & jumlah orang dikirim ke AI dan tersimpan

## Halaman hasil itinerary
- [x] Preferensi perjalanan tampil lewat panel yang tertutup secara default
- [x] Halaman hasil memakai susunan kartu modern, peta rute, dan alur aktivitas harian yang lebih mudah dipindai
- [x] Foto destinasi Google Places di area atas hasil itinerary menggunakan `GOOGLE_API_KEY` milik pengguna secara langsung, tanpa sambungan pihak ketiga Lovable (foto lokal tetap cadangan bila Places tidak mengembalikan foto)
- [x] Saat hosting mandiri, foto bawaan lokal tetap tersedia tanpa Google; foto Google Places tidak di-cache karena aturan lisensi Google melarang penyimpanan foto tersebut.

## Migrasi workspace baru (2026-10-05)
- [x] Aktifkan Lovable Cloud di workspace ini
- [x] Jalankan migrasi tabel (itineraries, user_roles, RLS + GRANT, cron, trigger)
- [x] Buat ulang akun admin tester (admin@lokamate.local)
- [x] Verifikasi login admin end-to-end
