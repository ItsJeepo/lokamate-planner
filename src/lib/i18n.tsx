import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "id" | "en";

const STORAGE_KEY = "tripmate.lang";

export const dict = {
  id: {
    nav: { signIn: "Masuk", start: "Mulai Sekarang", explore: "Jelajah Destinasi", about: "Tentang", myTrips: "Itinerary Saya", signOut: "Keluar" },
    hero: {
      badge: "Perencana liburan berbasis AI",
      title1: "Liburan Rapi",
      titleOptions: ["Liburan Rapi Tanpa Ribet", "Momen Seru yang Terencana", "Liburan Nyaman dari Hari Pertama"],
      title2: "Tanpa Riset Berjam-jam.",
      subtitle:
        "Isi mau liburan seperti apa, kota tujuan, budget, dan berapa hari. Lokamate langsung menyusun itinerary harian, rincian biaya, penginapan, kuliner, dan tips lokal.",
      cta: "Susun Itinerary Saya",
      note: "Gratis selama masa uji coba",
      chips: [
        { title: "Itinerary Harian", sub: "pagi sampai malam" },
        { title: "Pas Budget", sub: "rincian biaya jelas" },
        { title: "100% Indonesia", sub: "destinasi lokal" },
      ],
      previewTitle: "Contoh hasil",
      previewCity: "Yogyakarta - 3 hari",
      previewBudget: "Budget Rp 2.500.000",
      previewLines: [
        "Hari 1 - Pagi: Keraton & Taman Sari (Rp 45.000)",
        "Hari 1 - Sore: Sunset di Bukit Panguk (Rp 20.000)",
        "Hari 1 - Malam: Gudeg Yu Djum + Malioboro (Rp 60.000)",
        "Hari 2 - Pagi: Candi Borobudur (Rp 120.000)",
      ],
      previewTotal: "Total perkiraan: Rp 2.380.000 - masih di bawah budget",
    },
    compare: {
      title1: "Berhenti Liburan Dadakan,",
      title2: "Mulai Liburan Terencana.",
      body: "Rencana dadakan bikin waktu habis di jalan dan budget bocor di hari kedua. Lokamate menyusun urutan aktivitas yang masuk akal secara jarak dan jam buka, jadi liburanmu terasa panjang tanpa boros.",
      chartX: "Hari liburan",
      chartY: "Kepuasan",
      tagBad: "Tanpa rencana",
      tagGood: "Lokamate",
    },
    benefits: [
      {
        title: "Susun itinerary tanpa ribet",
        body: "Nggak perlu buka puluhan tab dan grup rekomendasi. Cukup empat pertanyaan, semua rencana harian langsung tersusun.",
        cta: "Mulai Sekarang",
        leftLabel: "Cara manual",
        leftBody: "Cari satu-satu, catat manual, tetap bingung urutannya",
        rightLabel: "Lokamate:",
        rightBody: "Isi sekali, itinerary lengkap langsung jadi",
      },
      {
        title: "Budget kelihatan sejak awal",
        body: "Setiap aktivitas punya perkiraan biaya, lengkap dengan total dan sisa budget. Jadi kamu tahu duluan kalau rencananya kebablasan.",
        cta: "Mulai Sekarang",
        items: [
          { label: "Transport", value: "Rp 620.000" },
          { label: "Penginapan", value: "Rp 900.000" },
          { label: "Makan", value: "Rp 540.000" },
          { label: "Tiket masuk", value: "Rp 320.000" },
        ],
        totalLabel: "Total perkiraan",
        totalValue: "Rp 2.380.000",
      },
    ],
    form: {
      heading: "Rencanakan liburanmu",
      sub: "Empat langkah, sekitar satu menit.",
      steps: ["Gaya liburan", "Kota tujuan", "Budget", "Lama liburan"],
      styleLabel: "Liburan seperti apa yang kamu mau?",
      styles: [
        { id: "santai", label: "Santai", desc: "Pelan, banyak istirahat" },
        { id: "petualangan", label: "Petualangan", desc: "Alam, hiking, air" },
        { id: "kuliner", label: "Kuliner", desc: "Makan enak terus" },
        { id: "keluarga", label: "Keluarga", desc: "Aman untuk anak" },
        { id: "romantis", label: "Romantis", desc: "Berdua, tenang" },
        { id: "budaya", label: "Budaya", desc: "Sejarah & seni" },
        { id: "hemat", label: "Hemat", desc: "Maksimalkan budget" },
        { id: "fotogenik", label: "Fotogenik", desc: "Spot foto terbaik" },
      ],
      cityLabel: "Kota atau daerah tujuan di Indonesia",
      cityPlaceholder: "Contoh: Yogyakarta, Bali, Labuan Bajo",
      cityPopular: "Populer:",
      budgetLabel: "Total budget (Rupiah)",
      budgetPlaceholder: "Contoh: 2500000",
      budgetHelp: "Untuk seluruh perjalanan, di luar tiket pesawat kalau kamu mau.",
      daysLabel: "Berapa hari?",
      notesLabel: "Catatan tambahan (opsional)",
      notesPlaceholder: "Misal: berangkat dari Jakarta, tidak suka pantai, ada anak 5 tahun",
      back: "Kembali",
      next: "Lanjut",
      submit: "Buat Itinerary",
      day: "hari",
      errors: {
        style: "Pilih dulu gaya liburanmu.",
        city: "Tulis kota atau daerah tujuan.",
        budget: "Budget minimal Rp 100.000.",
        days: "Pilih 1 sampai 14 hari.",
      },
    },
    faq: {
      heading: "Pertanyaan yang Sering Ditanya",
      items: [
        {
          q: "Itinerary-nya akurat? Bisa salah nggak?",
          a: "Lokamate menyusun rencana dari pengetahuan umum soal destinasi Indonesia, jadi anggap hasilnya sebagai rancangan yang sangat siap pakai. Jam buka, harga tiket, dan ketersediaan tetap sebaiknya kamu cek ulang sebelum berangkat.",
        },
        {
          q: "Biayanya benar-benar sesuai budget saya?",
          a: "Setiap aktivitas diberi perkiraan biaya dan dijumlahkan, lalu dibandingkan dengan budget yang kamu masukkan. Kalau totalnya lewat, Lokamate memberi catatan bagian mana yang bisa dihemat.",
        },
        {
          q: "Bisa untuk kota mana saja?",
          a: "Fokus kami destinasi lokal Indonesia, dari kota besar seperti Bandung dan Surabaya sampai daerah wisata seperti Labuan Bajo, Raja Ampat, dan Danau Toba.",
        },
        {
          q: "Kalau saya cuma libur dua hari, tetap berguna?",
          a: "Sangat berguna. Untuk liburan singkat, Lokamate memprioritaskan tempat yang berdekatan supaya waktumu tidak habis di jalan.",
        },
        {
          q: "Hasilnya bisa saya ubah sendiri?",
          a: "Bisa. Setiap itinerary tersimpan di akunmu dan bisa kamu buat ulang dengan budget, jumlah hari, atau gaya liburan yang berbeda kapan saja.",
        },
        {
          q: "Perlu bayar?",
          a: "Selama masa uji coba, pembuatan itinerary gratis setelah kamu masuk ke akun. Nanti setelah masa uji coba berakhir, akan ada paket berbayar.",
        },
      ],
    },
    closing: {
      title1: "Jangan tunggu bingung di lokasi.",
      title2: "Susun itinerary-mu sekarang.",
      cta: "Mulai Sekarang",
      note: "Gratis selama masa uji coba",
    },
    footer: {
      tagline: "Perencana itinerary liburan berbasis AI untuk destinasi lokal Indonesia.",
      addressTitle: "Alamat Bisnis",
      contactTitle: "Kontak",
      socialTitle: "Media Sosial",
      placeholder: "(isi nanti)",
      links: ["Kebijakan Privasi", "Syarat & Ketentuan", "Kebijakan Pengembalian Dana"],
      rights: "Hak cipta dilindungi.",
      language: "Bahasa",
    },
    auth: {
      title: "Masuk untuk melihat itinerary-mu",
      subtitle: "Rencanamu tersimpan, jadi kamu tidak perlu mengisi ulang.",
      tabSignIn: "Masuk",
      tabSignUp: "Daftar",
      email: "Email",
      password: "Kata sandi",
      name: "Nama",
      submitSignIn: "Masuk",
      submitSignUp: "Buat Akun",
      google: "Lanjut dengan Google",
      or: "atau",
      signUpSuccess: "Akun dibuat. Kamu sudah masuk.",
      checkEmail: "Cek emailmu untuk konfirmasi, lalu masuk kembali.",
      demoTitle: "Coba dengan akun demo",
      demoDescription: "Isi kredensial demo secara otomatis, lalu masuk untuk melanjutkan ke Planner.",
      useDemo: "Gunakan akun demo",
    },
    generating: {
      title: "Menyusun itinerary-mu...",
      sub: "Sedang menata aktivitas harian, biaya, dan rekomendasi lokal. Mohon tunggu sebentar.",
      failed: "Gagal menyusun itinerary",
      retry: "Coba lagi",
      noDraft: "Belum ada rencana yang diisi. Silakan isi formulir dulu.",
      backHome: "Kembali ke halaman utama",
    },
    result: {
      overview: "Ringkasan",
      daily: "Rencana Harian",
      costs: "Rincian Biaya",
      stays: "Rekomendasi Penginapan",
      food: "Kuliner Wajib Coba",
      tips: "Tips & Transportasi Lokal",
      morning: "Pagi",
      afternoon: "Siang",
      evening: "Malam",
      total: "Total perkiraan",
      budget: "Budget kamu",
      remaining: "Sisa budget",
      over: "Melebihi budget",
      newTrip: "Buat itinerary baru",
      myTrips: "Itinerary Saya",
      notFound: "Itinerary tidak ditemukan.",
      day: "Hari",
      perNight: "per malam",
      packing: "Barang bawaan",
      watchOut: "Perhatikan",
    },
    trips: {
      title: "Itinerary Saya",
      sub: "Semua rencana liburan yang pernah kamu buat.",
      empty: "Belum ada itinerary. Yuk susun yang pertama.",
      create: "Buat Itinerary",
      open: "Lihat",
      days: "hari",
      export: "Unduh semua (JSON)",
      exported: "Berkas JSON berhasil diunduh.",
      exportFailed: "Gagal mengunduh data.",
      offline: "Koneksi internet terputus. Lokamate akan kembali jalan begitu koneksi pulih.",
    },
    destinations: {
      title: "Jelajah Destinasi Indonesia",
      sub: "Pilih satu, lalu Lokamate menyusun rencananya untukmu.",
      best: "Waktu terbaik",
      budget: "Kisaran budget",
      plan: "Buat itinerary",
    },
    about: {
      title: "Tentang Lokamate",
      lead: "Lokamate lahir dari satu hal sederhana: merencanakan liburan seharusnya tidak lebih melelahkan daripada liburannya sendiri.",
      how: "Cara kerjanya",
      steps: [
        { title: "Kamu isi empat hal", body: "Gaya liburan, kota tujuan, total budget, dan lama liburan." },
        { title: "AI menyusun rencana", body: "Aktivitas harian diurutkan berdasarkan jarak, jam buka, dan ritme yang nyaman." },
        { title: "Semua keluar sekaligus", body: "Rencana harian, rincian biaya, penginapan, kuliner, dan tips lokal." },
      ],
      whyTitle: "Kenapa fokus Indonesia",
      why: "Destinasi lokal punya konteks yang sering terlewat di aplikasi global: jam buka pasar, musim hujan, cara sewa motor, sampai kapan sebaiknya berangkat supaya tidak kena macet akhir pekan. Kami menulis Lokamate khusus untuk itu.",
      cta: "Coba Sekarang",
    },
    planner: {
      back: "Kembali",
      stepCounter: "Langkah {current} dari {total}",
      next: "Lanjut",
      save: "Simpan pilihan",
      saved: "Pilihan tersimpan. Kita lanjutkan pertanyaan berikutnya nanti.",
      loginStep: {
        title: "Satu langkah lagi!",
        message: "Untuk melanjutkan, silahkan login dulu ya",
        description: "Pilihan liburanmu sudah tersimpan. Masuk atau daftar dulu, nanti rencananya langsung kita susun.",
        button: "Masuk / Daftar",
      },
      introSupport: "Dirancang khusus untuk perjalananmu",
      nickname: {
        title: "Boleh kenalan dulu?",
        description: "Kami sebaiknya memanggil kamu siapa selama merencanakan liburan ini?",
        label: "Nama panggilan",
        placeholder: "Contoh: Alex",
        error: "Masukkan minimal 2 karakter.",
      },
      destination: {
        title: "Mau liburan ke mana, {name}?",
        fallbackName: "kawan",
        description: "Pilih kota atau daerah di Indonesia.",
        select: "Pilih destinasi",
        search: "Cari kota atau daerah...",
        listLabel: "Destinasi Indonesia",
        empty: "Destinasi belum ditemukan.",
      },
      styles: {
        title: "Liburan seperti apa di {city}?",
        description: "Boleh pilih lebih dari satu. Ini jadi bahan utama AI menyusun itinerary-mu.",
        selectedCount: "{count} dipilih",
        options: {
          history: "Historikal",
          shopping: "Belanja",
          culinary: "Kuliner",
          scenery: "Pemandangan",
        },
      },
      introSteps: [
        {
          title: "Susun rencana liburan dengan mudah.",
          description: "Cukup pilih preferensi berikut ini.",
          visualTitle: "Satu rencana, tanpa ribet",
          visualItems: ["Pilih suasana", "Tentukan tujuan", "Atur ritme perjalanan"],
        },
        {
          title: "Lihat hari demi hari dengan detail",
          description: "Semua detail kecil dari budaya tempat, bujet, transportasi dijelaskan detail oleh kami.",
          visualTitle: "Perjalanan tersusun rapi",
          visualItems: ["08.00 · Sarapan lokal", "10.00 · Jelajah budaya", "16.30 · Tempat terbaik saat senja"],
        },
        {
          title: "Tanya apa saja tentang liburan kamu",
          description: "Liburan itu seharusnya dibawa santai, nggak ribet, kawann~",
          visualTitle: "Lokamate siap membantu",
          visualItems: ["Kuliner halal terdekat?", "Naik apa ke tempat berikutnya?", "Ada pilihan yang lebih hemat?"],
        },
        {
          title: "Yuk kita buat rencana liburan kamu dulu!",
          description: "Dalam 5 menit, kamu akan tahu destinasi dan pengalaman apa saja yang membuat liburan kamu lebih bermakna.",
          visualTitle: "Rencana yang terasa milikmu",
          visualItems: ["Sesuai minatmu", "Sesuai bujetmu", "Sesuai waktu yang kamu punya"],
        },
      ],
    },
    errors: {
      notFoundTitle: "Halaman tidak ditemukan",
      notFoundDescription: "Halaman yang kamu cari tidak ada atau sudah dipindahkan.",
      backHome: "Kembali ke halaman utama",
      loadTitle: "Halaman ini gagal dimuat",
      loadDescription: "Ada yang salah di sisi kami. Coba muat ulang atau kembali ke halaman utama.",
      retry: "Coba lagi",
      home: "Halaman utama",
    },
    common: { loading: "Memuat...", error: "Terjadi kesalahan." },
  },
  en: {
    nav: { signIn: "Sign in", start: "Get Started", explore: "Destinations", about: "About", myTrips: "My Trips", signOut: "Sign out" },
    hero: {
      badge: "AI holiday planner",
      title1: "A Well-Planned Trip",
      titleOptions: ["A Well-Planned Trip", "A Holiday Worth Remembering", "Paradise, Planned for You"],
      title2: "Without Hours of Research.",
      subtitle:
        "Tell us the kind of trip you want, where you're headed, your budget, and how many days. Lokamate builds the day-by-day plan, cost breakdown, places to stay, food to try, and local tips.",
      cta: "Build My Itinerary",
      note: "Free during the trial",
      chips: [
        { title: "Day-by-day plan", sub: "morning to night" },
        { title: "Budget-aware", sub: "clear cost breakdown" },
        { title: "All Indonesia", sub: "local destinations" },
      ],
      previewTitle: "Sample result",
      previewCity: "Yogyakarta - 3 days",
      previewBudget: "Budget IDR 2,500,000",
      previewLines: [
        "Day 1 - Morning: Keraton & Taman Sari (IDR 45,000)",
        "Day 1 - Afternoon: Sunset at Bukit Panguk (IDR 20,000)",
        "Day 1 - Evening: Gudeg Yu Djum + Malioboro (IDR 60,000)",
        "Day 2 - Morning: Borobudur Temple (IDR 120,000)",
      ],
      previewTotal: "Estimated total: IDR 2,380,000 - still under budget",
    },
    compare: {
      title1: "Stop Winging Your Trips,",
      title2: "Start Travelling On Purpose.",
      body: "Unplanned trips burn your hours in traffic and your budget by day two. Lokamate orders activities that actually make sense by distance and opening hours, so the trip feels longer and costs less.",
      chartX: "Trip days",
      chartY: "Satisfaction",
      tagBad: "No plan",
      tagGood: "Lokamate",
    },
    benefits: [
      {
        title: "Plan a trip without the hassle",
        body: "No more twenty open tabs and endless recommendation threads. Answer four questions and the whole plan is ready.",
        cta: "Get Started",
        leftLabel: "The manual way",
        leftBody: "Search one by one, take notes, still unsure of the order",
        rightLabel: "Lokamate:",
        rightBody: "Fill it once, get a complete itinerary",
      },
      {
        title: "See the budget up front",
        body: "Every activity carries an estimated cost, with a running total and what's left of your budget. You'll know early if the plan is too ambitious.",
        cta: "Get Started",
        items: [
          { label: "Transport", value: "IDR 620,000" },
          { label: "Stay", value: "IDR 900,000" },
          { label: "Food", value: "IDR 540,000" },
          { label: "Entrance fees", value: "IDR 320,000" },
        ],
        totalLabel: "Estimated total",
        totalValue: "IDR 2,380,000",
      },
    ],
    form: {
      heading: "Plan your trip",
      sub: "Four steps, about a minute.",
      steps: ["Trip style", "Destination", "Budget", "Length"],
      styleLabel: "What kind of trip do you want?",
      styles: [
        { id: "santai", label: "Relaxed", desc: "Slow, lots of rest" },
        { id: "petualangan", label: "Adventure", desc: "Nature, hikes, water" },
        { id: "kuliner", label: "Food trip", desc: "Eat your way through" },
        { id: "keluarga", label: "Family", desc: "Kid-friendly" },
        { id: "romantis", label: "Romantic", desc: "Quiet, just the two of you" },
        { id: "budaya", label: "Culture", desc: "History & arts" },
        { id: "hemat", label: "Budget", desc: "Stretch every rupiah" },
        { id: "fotogenik", label: "Photogenic", desc: "The best photo spots" },
      ],
      cityLabel: "City or area in Indonesia",
      cityPlaceholder: "e.g. Yogyakarta, Bali, Labuan Bajo",
      cityPopular: "Popular:",
      budgetLabel: "Total budget (IDR)",
      budgetPlaceholder: "e.g. 2500000",
      budgetHelp: "For the whole trip, flights excluded if you prefer.",
      daysLabel: "How many days?",
      notesLabel: "Anything else? (optional)",
      notesPlaceholder: "e.g. flying from Jakarta, not a beach person, travelling with a 5-year-old",
      back: "Back",
      next: "Continue",
      submit: "Create Itinerary",
      day: "days",
      errors: {
        style: "Pick a trip style first.",
        city: "Enter a city or area.",
        budget: "Budget must be at least IDR 100,000.",
        days: "Choose between 1 and 14 days.",
      },
    },
    faq: {
      heading: "Frequently Asked Questions",
      items: [
        {
          q: "Is the itinerary accurate? Can it be wrong?",
          a: "Lokamate builds plans from general knowledge about Indonesian destinations, so treat the result as a very usable draft. Do double-check opening hours, ticket prices, and availability before you go.",
        },
        {
          q: "Will the costs really fit my budget?",
          a: "Every activity gets an estimated cost, everything is summed up, and the total is compared against the budget you entered. If it goes over, Lokamate points out where you can cut back.",
        },
        {
          q: "Which cities does it cover?",
          a: "We focus on local Indonesian destinations, from big cities like Bandung and Surabaya to places like Labuan Bajo, Raja Ampat, and Lake Toba.",
        },
        {
          q: "I only have two days off. Still useful?",
          a: "Very. For short trips, Lokamate prioritises places close to each other so you don't lose the day in traffic.",
        },
        {
          q: "Can I change the result?",
          a: "Yes. Every itinerary is saved to your account, and you can regenerate it any time with a different budget, length, or trip style.",
        },
        {
          q: "Do I have to pay?",
          a: "During the trial, creating itineraries is free once you sign in. Paid plans will arrive after the trial period ends.",
        },
      ],
    },
    closing: {
      title1: "Don't figure it out on arrival.",
      title2: "Build your itinerary now.",
      cta: "Get Started",
      note: "Free during the trial",
    },
    footer: {
      tagline: "An AI itinerary planner for local Indonesian destinations.",
      addressTitle: "Business Address",
      contactTitle: "Contact",
      socialTitle: "Social Media",
      placeholder: "(to be filled in)",
      links: ["Privacy Policy", "Terms of Service", "Refund Policy"],
      rights: "All rights reserved.",
      language: "Language",
    },
    auth: {
      title: "Sign in to see your itinerary",
      subtitle: "Your answers are saved, so there's nothing to fill in twice.",
      tabSignIn: "Sign in",
      tabSignUp: "Sign up",
      email: "Email",
      password: "Password",
      name: "Name",
      submitSignIn: "Sign in",
      submitSignUp: "Create Account",
      google: "Continue with Google",
      or: "or",
      signUpSuccess: "Account created. You're signed in.",
      checkEmail: "Check your email to confirm, then sign in again.",
      demoTitle: "Try the demo account",
      demoDescription: "Fill in the demo credentials automatically, then sign in to continue to the Planner.",
      useDemo: "Use demo account",
    },
    generating: {
      title: "Building your itinerary...",
      sub: "Arranging daily activities, costs, and local recommendations. This takes a moment.",
      failed: "Couldn't build the itinerary",
      retry: "Try again",
      noDraft: "No trip details yet. Please fill in the form first.",
      backHome: "Back to home",
    },
    result: {
      overview: "Overview",
      daily: "Day-by-day Plan",
      costs: "Cost Breakdown",
      stays: "Where to Stay",
      food: "Food to Try",
      tips: "Tips & Getting Around",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      total: "Estimated total",
      budget: "Your budget",
      remaining: "Left over",
      over: "Over budget",
      newTrip: "Create a new itinerary",
      myTrips: "My Trips",
      notFound: "Itinerary not found.",
      day: "Day",
      perNight: "per night",
      packing: "What to pack",
      watchOut: "Watch out for",
    },
    trips: {
      title: "My Trips",
      sub: "Every itinerary you've created.",
      empty: "No itineraries yet. Let's build your first one.",
      create: "Create Itinerary",
      open: "Open",
      days: "days",
      export: "Download all (JSON)",
      exported: "Your JSON file has been downloaded.",
      exportFailed: "Couldn't download your data.",
      offline: "You're offline. Lokamate will work again as soon as the connection is back.",
    },
    destinations: {
      title: "Explore Indonesia",
      sub: "Pick one and Lokamate plans the rest.",
      best: "Best time",
      budget: "Budget range",
      plan: "Plan a trip",
    },
    about: {
      title: "About Lokamate",
      lead: "Lokamate started from one simple idea: planning a holiday shouldn't be more tiring than the holiday itself.",
      how: "How it works",
      steps: [
        { title: "You answer four things", body: "Trip style, destination, total budget, and length." },
        { title: "AI builds the plan", body: "Daily activities ordered by distance, opening hours, and a comfortable pace." },
        { title: "Everything at once", body: "Daily plan, cost breakdown, stays, food, and local tips." },
      ],
      whyTitle: "Why Indonesia only",
      why: "Local trips carry context global apps keep missing: market hours, rainy season, how to rent a scooter, and when to leave so you don't hit weekend traffic. We wrote Lokamate for exactly that.",
      cta: "Try It Now",
    },
    planner: {
      back: "Back",
      stepCounter: "Step {current} of {total}",
      next: "Continue",
      save: "Save choice",
      saved: "Your choice is saved. We'll continue with the next questions later.",
      loginStep: {
        title: "One more step!",
        message: "To continue, please sign in first",
        description: "Your choices are saved. Sign in or create an account and we'll build your plan right away.",
        button: "Sign in / Sign up",
      },
      introSupport: "Designed around your trip",
      nickname: {
        title: "Let's get to know you first.",
        description: "What should we call you while planning this holiday?",
        label: "Nickname",
        placeholder: "Example: Alex",
        error: "Enter at least 2 characters.",
      },
      destination: {
        title: "Where would you like to go, {name}?",
        fallbackName: "friend",
        description: "Choose a city or region in Indonesia.",
        select: "Choose a destination",
        search: "Search a city or region...",
        listLabel: "Indonesian destinations",
        empty: "No destination found.",
      },
      styles: {
        title: "What kind of trip in {city}?",
        description: "Pick one or more. We'll use this to shape your itinerary.",
        selectedCount: "{count} selected",
        options: {
          history: "Historical",
          shopping: "Shopping",
          culinary: "Culinary",
          scenery: "Scenery",
        },
      },
      introSteps: [
        {
          title: "Plan your holiday with ease.",
          description: "Just choose a few preferences to get started.",
          visualTitle: "One plan, no hassle",
          visualItems: ["Pick the vibe", "Choose the destination", "Set the trip rhythm"],
        },
        {
          title: "See every day in detail",
          description: "We break down the cultural details, budget, transport, and small choices that shape the trip.",
          visualTitle: "A neatly arranged route",
          visualItems: ["08:00 · Local breakfast", "10:00 · Culture walk", "16:30 · Best sunset stop"],
        },
        {
          title: "Ask anything about your holiday",
          description: "A holiday should feel relaxed, simple, and easy to enjoy.",
          visualTitle: "Lokamate is ready to help",
          visualItems: ["Nearby halal food?", "How do I get to the next place?", "Any more budget-friendly option?"],
        },
        {
          title: "Let's build your holiday plan first!",
          description: "In 5 minutes, you'll know which destinations and experiences can make your holiday more meaningful.",
          visualTitle: "A plan that feels like yours",
          visualItems: ["Fits your interests", "Fits your budget", "Fits the time you have"],
        },
      ],
    },
    errors: {
      notFoundTitle: "Page not found",
      notFoundDescription: "The page you're looking for doesn't exist or has moved.",
      backHome: "Back to the home page",
      loadTitle: "This page didn't load",
      loadDescription: "Something went wrong on our end. Try again or return to the home page.",
      retry: "Try again",
      home: "Home page",
    },
    common: { loading: "Loading...", error: "Something went wrong." },
  },
};

type Dict0 = typeof dict.id;

const dicts: Record<Lang, Dict0> = { id: dict.id, en: dict.en as unknown as Dict0 };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict0 };

const LanguageContext = createContext<Ctx>({ lang: "id", setLang: () => {}, t: dict.id });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "id" || stored === "en") {
        setLangState(stored);
        document.documentElement.lang = stored;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: dicts[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

export function formatIDR(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
