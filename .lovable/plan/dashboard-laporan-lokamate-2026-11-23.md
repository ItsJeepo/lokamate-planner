# Dashboard Laporan Lokamate

## Yang dibangun
- Tambahkan halaman `/laporan` untuk melihat ringkasan dan laporan itinerary yang tersimpan.
- Sediakan filter periode, destinasi, dan gaya liburan, beserta ringkasan pengelompokan data.
- Tampilkan tiga grafik yang diminta: biaya per destinasi (batang), jumlah itinerary per hari (garis), dan pembagian gaya liburan (lingkaran).
- Tambahkan tautan laporan pada menu akun yang sudah masuk, serta keadaan memuat, kosong, gagal, dan tampilan layar kecil.

## Teknis
- Gunakan data itinerary milik akun yang sedang masuk melalui fungsi daftar terlindungi yang sudah ada; mendukung Lovable Cloud dan MySQL self-hosted tanpa tabel baru atau akses data lintas akun.
- Tambahkan metadata halaman yang unik dan pengujian perhitungan filter/pengelompokan.