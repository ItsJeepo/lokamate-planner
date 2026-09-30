import type { ItineraryResult } from "./itinerary-types";

export type ItineraryInput = {
  style: string;
  city: string;
  budget: number;
  days: number;
  notes: string;
  lang: "id" | "en";
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "city", "days", "costs", "stays", "food", "tips"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    city: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "title", "morning", "afternoon", "evening"],
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          morning: { $ref: "#/$defs/activities" },
          afternoon: { $ref: "#/$defs/activities" },
          evening: { $ref: "#/$defs/activities" },
        },
      },
    },
    costs: {
      type: "object",
      additionalProperties: false,
      required: ["items", "total", "note"],
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "amount"],
            properties: { label: { type: "string" }, amount: { type: "number" } },
          },
        },
        total: { type: "number" },
        note: { type: "string" },
      },
    },
    stays: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "area", "pricePerNight", "why"],
        properties: {
          name: { type: "string" },
          area: { type: "string" },
          pricePerNight: { type: "number" },
          why: { type: "string" },
        },
      },
    },
    food: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "where", "price", "why"],
        properties: {
          name: { type: "string" },
          where: { type: "string" },
          price: { type: "number" },
          why: { type: "string" },
        },
      },
    },
    tips: {
      type: "object",
      additionalProperties: false,
      required: ["transport", "bestTime", "packing", "watchOut"],
      properties: {
        transport: { type: "array", items: { type: "string" } },
        bestTime: { type: "string" },
        packing: { type: "array", items: { type: "string" } },
        watchOut: { type: "array", items: { type: "string" } },
      },
    },
  },
  $defs: {
    activities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["time", "title", "location", "description", "cost"],
        properties: {
          time: { type: "string" },
          title: { type: "string" },
          location: { type: "string" },
          description: { type: "string" },
          cost: { type: "number" },
        },
      },
    },
  },
} as const;

const SYSTEM_PROMPT =
  "Kamu perencana perjalanan Indonesia yang teliti soal jarak, jam buka, dan harga lokal. Jawab hanya dengan JSON sesuai skema.";

function buildPrompt(data: ItineraryInput): string {
  const language =
    data.lang === "id"
      ? "Tulis seluruh isi dalam Bahasa Indonesia yang natural dan enak dibaca."
      : "Write everything in natural, fluent English.";

  return `Susun itinerary liburan untuk destinasi lokal di Indonesia.

Kota/daerah tujuan: ${data.city}
Gaya liburan: ${data.style}
Total budget: Rp ${data.budget.toLocaleString("id-ID")}
Lama liburan: ${data.days} hari
Catatan tambahan dari pengguna: ${data.notes || "-"}

Aturan:
- Hanya destinasi nyata di Indonesia yang relevan dengan kota/daerah tersebut.
- Untuk setiap hari, isi morning, afternoon, dan evening dengan 1-2 aktivitas masing-masing. Urutkan berdasarkan kedekatan lokasi supaya waktu tidak habis di jalan.
- "cost" dan seluruh angka dalam Rupiah, bilangan bulat, tanpa titik atau simbol.
- costs.items memuat kategori: Transport, Penginapan, Makan, Tiket masuk, Lain-lain. total = jumlah semua item, dan harus realistis terhadap budget.
- costs.note menjelaskan posisi total terhadap budget pengguna; jika melebihi budget, sebutkan bagian mana yang bisa dihemat.
- 3 rekomendasi penginapan yang masuk budget dan 4-6 kuliner khas.
- tips.transport, tips.packing, tips.watchOut masing-masing 3-4 poin praktis dan spesifik untuk daerah itu.
- Jumlah elemen pada "days" harus tepat ${data.days}.
- ${language}`;
}

async function callJsonSchemaChat(url: string, apiKey: string, model: string, data: ItineraryInput) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(data) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "itinerary", strict: true, schema: responseSchema },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("AI error", response.status, detail);
    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (response.status === 402) throw new Error("CREDITS");
    if (response.status === 401) throw new Error("AI_KEY");
    throw new Error("AI_ERROR");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI_EMPTY");

  try {
    return JSON.parse(content) as ItineraryResult;
  } catch {
    throw new Error("AI_PARSE");
  }
}

// Two paths, one result shape:
// - "lovable" (default): the AI bundled with the project, no key needed.
// - "openai": your own OpenAI key, entered once into the secret store as
//   OPENAI_API_KEY, then switch AI_PROVIDER to "openai".
export async function generateItineraryWithAi(data: ItineraryInput): Promise<ItineraryResult> {
  const openaiKey = process.env["OPENAI_API_KEY"];
  // Self-hosted: if an OpenAI key exists and no provider is set, use OpenAI automatically.
  const provider = (process.env["AI_PROVIDER"] ?? (openaiKey ? "openai" : "lovable"))
    .trim()
    .toLowerCase();

  if (provider === "openai") {
    if (!openaiKey) throw new Error("AI_KEY: set OPENAI_API_KEY in .env");
    const model = process.env["OPENAI_MODEL"]?.trim() || "gpt-4o-mini";
    return callJsonSchemaChat("https://api.openai.com/v1/chat/completions", openaiKey, model, data);
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!lovableKey)
    throw new Error("AI is not configured: self-hosted? set OPENAI_API_KEY in .env");
  return callJsonSchemaChat(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    lovableKey,
    "google/gemini-3.7-flash",
    data,
  );
}
