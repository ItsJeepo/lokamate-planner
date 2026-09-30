# Lokamate — Roadmap

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
- [ ] Pengujian end-to-end pembuatan itinerary dari preview

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
- [ ] Akun demo dari proyek lama belum tersedia di workspace baru; perlu akun baru bila demo ingin digunakan
- [x] Lapisan gelap latar beranda menyatu tanpa garis patahan antarbagian
