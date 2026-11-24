# Audit "30 reasons your site looks vibecoded" + perbaikan kecil

## Hasil audit (15 poin terlihat di tangkapan layar)

**Tidak ada di Lokamate (aman):**
- Pure white background → tema gelap (ink), bukan putih polos
- Rainbow coloring → palet konsisten: biru primer + netral
- Emojis → tidak ada emoji di UI
- Fake testimonials → tidak ada sama sekali
- Bento grids → tidak ada
- Terminal window → tidak ada
- Inter/Geist/Space Grotesk → font sudah self-hosted @fontsource: Plus Jakarta Sans, DM Sans, Outfit, Figtree
- Liquid glass → hanya backdrop-blur standar di header sticky (perilaku normal, bukan estetika "glassmorphism")
- Harsh gradients → gradien hanya berfungsi (scrim foto, cahaya hero, wash teks), bukan gradien ungu-biru dekoratif

**Kena ringan (4 temuan):**
1. **Em dashes di copy UI** — 3 kalimat memakai "—": HomeJourney.tsx:213-214 (deskripsi preview), HomeJourney.tsx:333 ("Peta rute — pilih hari"), BudgetStep.tsx:76
2. **Copy "it's not X, it's Y"** — Tentang, kartu "Kenapa": judul "Itinerary hasil AI, bukan template"
3. **Colored left stripe** — itinerary.$id.tsx:332: `border-l-2 border-primary` di rincian budget
4. **Lucide icons** (37 file) — dipakai secara semantik (Sparkles/Wallet/MapPin di kartu Tentang); ini standar shadcn dan tidak terlihat "vibecoded" jika tidak berlebihan → **disarankan dipertahankan**

## Rencana perbaikan

1. `src/components/home/HomeJourney.tsx` — tulis ulang 3 kalimat ber-em-dash (ID + EN) menjadi kalimat biasa dengan koma/titik, makna tetap.
2. `src/routes/tentang.tsx` — ganti judul kartu "Itinerary hasil AI, bukan template" (ID + EN) menjadi rumusan afirmatif, mis. "Setiap itinerary disusun khusus oleh AI" tanpa pola "bukan X".
3. `src/routes/itinerary.$id.tsx` — ganti penanda `border-l-2 border-primary` pada daftar rincian biaya dengan penanda netral (mis. titik kecil warna muted atau hanya indentasi).
4. Tidak mengubah: font, tema, ikon lucide, tata letak kartu (4 kartu "Kenapa" berisi klaim nyata aplikasi, bukan filler), gradien fungsional.

Catatan: poin 16-30 pada video tertutup di tangkapan layar. Kirim bagian sisanya bila ingin dicek juga.

## Verifikasi
- Build OK, cek halaman Home (preview journey), Tentang, dan halaman itinerary lewat Playwright — teks baru tampil dan tidak ada perubahan layout.
