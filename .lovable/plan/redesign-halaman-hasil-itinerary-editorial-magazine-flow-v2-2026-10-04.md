# Redesign halaman hasil itinerary — "Editorial magazine flow" (v2)

Mengubah `src/routes/itinerary.$id.tsx` mengikuti prototipe v2 yang dipilih, tanpa mengubah data, fungsi, atau logika.

## Perubahan tampilan

1. **Hero bergaya majalah**
   - Foto destinasi (aset lokal `src/assets` sesuai kota, fallback gradien biru) dengan gradasi gelap → terang.
   - Kartu perjalanan putih melayang menumpuk di bawah hero: judul trip (Outfit), meta hari/rombongan/budget, dan **progress bar budget** (estimasi vs budget, persen).

2. **Panel preferensi** tetap collapsible (default tertutup), distyle sebagai bar kartu dengan ikon — konten tidak berubah.

3. **Peta rute** tampil sebagai kartu ringkas (mode compact TripMap) dengan tab hari.

4. **Rencana harian menjadi timeline**
   - Rel vertikal dengan node ikon periode (Pagi/Siang/Malam) — node aktif biru, lainnya netral.
   - Kartu aktivitas: waktu + label periode di atas, badge biaya di kanan; kartu putih rounded besar dengan bayangan lembut; satu kartu sorotan gelap (slate-900) untuk aktivitas unggulan malam.
   - Bagian penginapan, kuliner, dan tips lokal distyle ulang: tips sebagai kartu gelap "Rekomendasi Ahli" dengan aksen garis biru.

5. **Token & font**: tetap Outfit (judul) + Figtree (isi); semua warna lewat token semantik di `src/styles.css` (tambah token bila perlu, tanpa hardcode warna).

6. **Responsif**: mobile 390px dan desktop; timeline tetap rapi di layar lebar (max-w terpusat).

## Teknis

- Hanya `src/routes/itinerary.$id.tsx` dan (bila perlu) `src/styles.css`; i18n label baru ditambahkan ke `src/lib/i18n` (id + en).
- Tidak ada perubahan skema, server function, atau logika AI.
- Verifikasi: build OK + tangkapan layar Playwright desktop (1280px) dan mobile (390px) pada itinerary Surabaya (929c9a3a).
