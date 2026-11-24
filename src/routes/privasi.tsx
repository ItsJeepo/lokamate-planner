import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privasi")({
  head: () => ({
    meta: [
      { title: "Kebijakan Privasi | Lokamate.id" },
      { name: "description", content: "Bagaimana Lokamate.id mengumpulkan, memakai, dan menyimpan data pengguna." },
      { property: "og:title", content: "Kebijakan Privasi | Lokamate.id" },
      { property: "og:description", content: "Data apa yang disimpan Lokamate.id dan untuk apa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      id={{
        title: "Kebijakan Privasi",
        updated: "Terakhir diperbarui: 15 Oktober 2026",
        sections: [
          { title: "Data yang kami simpan", body: "Nama, alamat email, dan itinerary yang kamu buat, beserta preferensi perjalanan yang kamu isi." },
          { title: "Penggunaan data", body: "Data dipakai untuk menjalankan akunmu dan menyusun itinerary. Jawaban perjalananmu dikirim ke penyedia AI untuk membuat rencana." },
          { title: "Penyimpanan", body: "Itinerary disimpan paling lama 30 hari lalu dihapus otomatis. Data akun disimpan selama akunmu aktif." },
          { title: "Berbagi data", body: "Kami tidak menjual data pribadimu. Data hanya dibagikan ke penyedia layanan yang diperlukan untuk menjalankan aplikasi." },
          { title: "Hak kamu", body: "Kamu dapat mengubah data profil kapan saja dan meminta penghapusan akun melalui kontak kami." },
        ],
      }}
      en={{
        title: "Privacy Policy",
        updated: "Last updated: 15 October 2026",
        sections: [
          { title: "Data we store", body: "Your name, email address, and the itineraries you create, along with the travel preferences you enter." },
          { title: "How we use it", body: "Data is used to run your account and build itineraries. Your trip answers are sent to an AI provider to generate the plan." },
          { title: "Retention", body: "Itineraries are kept for up to 30 days and then deleted automatically. Account data is kept while your account is active." },
          { title: "Sharing", body: "We do not sell your personal data. It is only shared with service providers needed to run the app." },
          { title: "Your rights", body: "You can edit your profile at any time and request account deletion through our contact details." },
        ],
      }}
    />
  ),
});
