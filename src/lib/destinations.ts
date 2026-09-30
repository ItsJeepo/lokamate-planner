export type Destination = {
  city: string;
  region: string;
  icon: string;
};

/** Kota destinasi wisata terkenal di seluruh Indonesia, diurutkan per pulau. */
export const DESTINATIONS: readonly Destination[] = [
  // Sumatera
  { city: "Aceh", region: "Aceh", icon: "🕌" },
  { city: "Medan", region: "Sumatera Utara", icon: "🍜" },
  { city: "Danau Toba", region: "Sumatera Utara", icon: "🛶" },
  { city: "Berastagi", region: "Sumatera Utara", icon: "🌋" },
  { city: "Padang", region: "Sumatera Barat", icon: "🌶️" },
  { city: "Bukittinggi", region: "Sumatera Barat", icon: "🕰️" },
  { city: "Pekanbaru", region: "Riau", icon: "🛕" },
  { city: "Batam", region: "Kepulauan Riau", icon: "🚢" },
  { city: "Bintan", region: "Kepulauan Riau", icon: "🏖️" },
  { city: "Jambi", region: "Jambi", icon: "🏯" },
  { city: "Palembang", region: "Sumatera Selatan", icon: "🌉" },
  { city: "Bengkulu", region: "Bengkulu", icon: "🌺" },
  { city: "Lampung", region: "Lampung", icon: "🐘" },
  { city: "Belitung", region: "Kepulauan Bangka Belitung", icon: "🏝️" },

  // Jawa
  { city: "Jakarta", region: "DKI Jakarta", icon: "🏙️" },
  { city: "Bogor", region: "Jawa Barat", icon: "🌿" },
  { city: "Bandung", region: "Jawa Barat", icon: "🌋" },
  { city: "Pangandaran", region: "Jawa Barat", icon: "🏄‍♀️" },
  { city: "Cirebon", region: "Jawa Barat", icon: "🦐" },
  { city: "Anyer", region: "Banten", icon: "🌅" },
  { city: "Ujung Kulon", region: "Banten", icon: "🦏" },
  { city: "Semarang", region: "Jawa Tengah", icon: "🏘️" },
  { city: "Borobudur", region: "Jawa Tengah", icon: "🛕" },
  { city: "Solo", region: "Jawa Tengah", icon: "👑" },
  { city: "Karimunjawa", region: "Jawa Tengah", icon: "🐢" },
  { city: "Yogyakarta", region: "DI Yogyakarta", icon: "🏛️" },
  { city: "Surabaya", region: "Jawa Timur", icon: "🦈" },
  { city: "Malang", region: "Jawa Timur", icon: "⛰️" },
  { city: "Bromo", region: "Jawa Timur", icon: "🌄" },
  { city: "Batu", region: "Jawa Timur", icon: "🎠" },
  { city: "Banyuwangi", region: "Jawa Timur", icon: "🔵" },

  // Bali & Nusa Tenggara
  { city: "Bali", region: "Bali", icon: "🌴" },
  { city: "Lombok", region: "Nusa Tenggara Barat", icon: "🏝️" },
  { city: "Gili Trawangan", region: "Nusa Tenggara Barat", icon: "🐠" },
  { city: "Sumbawa", region: "Nusa Tenggara Barat", icon: "🌊" },
  { city: "Labuan Bajo", region: "Nusa Tenggara Timur", icon: "🐉" },
  { city: "Sumba", region: "Nusa Tenggara Timur", icon: "🐎" },
  { city: "Kupang", region: "Nusa Tenggara Timur", icon: "🐚" },

  // Kalimantan
  { city: "Pontianak", region: "Kalimantan Barat", icon: "🌐" },
  { city: "Palangka Raya", region: "Kalimantan Tengah", icon: "🌳" },
  { city: "Banjarmasin", region: "Kalimantan Selatan", icon: "🛶" },
  { city: "Balikpapan", region: "Kalimantan Timur", icon: "🛢️" },
  { city: "Derawan", region: "Kalimantan Timur", icon: "🐢" },

  // Sulawesi
  { city: "Manado", region: "Sulawesi Utara", icon: "🐟" },
  { city: "Bunaken", region: "Sulawesi Utara", icon: "🪸" },
  { city: "Gorontalo", region: "Gorontalo", icon: "🦈" },
  { city: "Palu", region: "Sulawesi Tengah", icon: "🌅" },
  { city: "Makassar", region: "Sulawesi Selatan", icon: "⛵" },
  { city: "Toraja", region: "Sulawesi Selatan", icon: "🏚️" },
  { city: "Kendari", region: "Sulawesi Tenggara", icon: "🌉" },
  { city: "Wakatobi", region: "Sulawesi Tenggara", icon: "🐬" },

  // Maluku & Papua
  { city: "Ambon", region: "Maluku", icon: "🎶" },
  { city: "Ternate", region: "Maluku Utara", icon: "🌋" },
  { city: "Raja Ampat", region: "Papua Barat Daya", icon: "🐠" },
  { city: "Manokwari", region: "Papua Barat", icon: "🌴" },
  { city: "Jayapura", region: "Papua", icon: "🏞️" },
  { city: "Merauke", region: "Papua Selatan", icon: "🦘" },
];
