# Cek "30 ciri website vibecoded" di Lokamate

## Hasil cek

**Tidak ada (aman):** gradien ungu mencolok, latar putih polos, warna pelangi, emoji, testimoni palsu, bento grid, jendela terminal, font Inter/Geist/Space Grotesk, paket harga 3 tingkat, warna ungu-hitam, warna neon, warna pastel, bulatan cahaya (radial orbs), pola titik (dot grid).

**Ada, perlu dirapikan:**
1. Tanda pisah panjang (—) di teks yang dibaca pengguna. Komentar kode yang memakainya tidak terlihat dan tidak diubah.
2. Ikon kilau (Sparkles) di 3 tempat.
3. Panah beranimasi pada tombol (ArrowRight bergerak saat disorot) di 5 tempat.
4. Bullet tanda centang di beberapa daftar.
5. Belum ada loading skeleton: saat data dimuat, yang tampil hanya putaran/teks.
6. Belum ada halaman Syarat & Ketentuan dan Kebijakan Privasi.

**Ada, tapi dibiarkan (wajar):** ikon lucide (dipakai sesuai fungsinya), sudut membulat, sedikit animasi saat disorot, demo produk (aplikasi asli langsung bisa dicoba).

## Rencana perbaikan

1. Tulis ulang kalimat ber-"—" di halaman (versi ID dan EN) memakai koma atau titik.
2. Ganti ikon Sparkles dengan ikon yang lebih spesifik (mis. peta/kompas/rute).
3. Hilangkan gerakan panah saat tombol disorot, panah tetap diam.
4. Ganti bullet centang dengan nomor atau titik kecil netral.
5. Tambah skeleton (kotak abu-abu berdenyut) di halaman Perjalanan dan halaman Itinerary saat data dimuat.
6. Buat halaman `/syarat` dan `/privasi` dengan teks dasar (ID/EN), lalu tambahkan tautannya di footer dan di form daftar. Isi teksnya contoh dariku, jadi perlu kamu periksa.

## Detail teknis
- Skeleton memakai komponen `ui/skeleton` dari shadcn dengan token warna `muted`.
- Halaman baru dibuat sebagai file route TanStack masing-masing, dengan head() sendiri.
- Verifikasi: cek build, lalu buka Beranda, Tentang, Perjalanan, Syarat, dan Privasi lewat Playwright.
