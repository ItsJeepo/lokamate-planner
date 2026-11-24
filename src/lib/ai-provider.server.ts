import type { ItineraryResult } from "./itinerary-types";

export type ItineraryInput = {
  style: string;
  city: string;
  budget: number;
  days: number;
  notes: string;
  lang: "id" | "en";
  arrivalMode?: "airport" | "station" | "harbor" | undefined;
  arrivalHub?: string | undefined;
  adults?: number | undefined;
  children?: number | undefined;
};

const ARRIVAL_LABEL = { airport: "Bandara", station: "Stasiun", harbor: "Pelabuhan" } as const;

function tripContext(data: ItineraryInput) {
  const lines: string[] = [];
  if (data.arrivalHub) {
    const kind = data.arrivalMode ? ARRIVAL_LABEL[data.arrivalMode] : "Titik";
    lines.push(`Titik kedatangan: ${kind} ${data.arrivalHub}`);
  }
  if (data.adults) {
    lines.push(`Jumlah wisatawan: ${data.adults} dewasa, ${data.children ?? 0} anak-anak (total ${data.adults + (data.children ?? 0)} orang)`);
  }
  if (lines.length === 0) return "";
  return `${lines.join("\n")}

Aturan WAJIB soal kedatangan & rombongan:
- Aktivitas pertama hari pertama dimulai dari titik kedatangan di atas (sertakan transfer dari sana ke penginapan/aktivitas pertama, beserta biayanya), dan hari terakhir diakhiri kembali menuju titik tersebut.
- Semua biaya (tiket masuk, makan, transport, aktivitas) dihitung untuk SELURUH rombongan, bukan per orang. Penginapan harus muat untuk seluruh rombongan (tambah kamar bila perlu).
- Jika ada anak-anak, pilih aktivitas dan kuliner yang ramah anak.
`;
}

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
${tripContext(data)}

Aturan WAJIB soal lokasi:
- SEMUA aktivitas, penginapan, dan kuliner HARUS berada di dalam wilayah administratif ${data.city} (kota/kabupaten itu sendiri). DILARANG memasukkan tempat di kota/kabupaten/provinsi lain, sekalipun terkenal.
- Jarak antar-aktivitas dalam satu hari maksimal sekitar 30 km / 45 menit berkendara. Kelompokkan tiap hari per satu area/kecamatan yang berdekatan.
- Field "location" WAJIB berformat "Nama tempat spesifik, Kecamatan/Area, ${data.city}" agar bisa ditemukan di peta.
- Hanya tempat nyata yang benar-benar ada dan buka untuk umum.
- Untuk setiap hari, isi morning, afternoon, dan evening dengan 1-2 aktivitas masing-masing. Urutkan berdasarkan kedekatan lokasi (rute paling efisien, tidak bolak-balik).

Aturan WAJIB soal budget:
- "cost" dan seluruh angka dalam Rupiah, bilangan bulat, tanpa titik atau simbol.
- costs.items memuat kategori: Transport, Penginapan, Makan, Tiket masuk, Lain-lain. total = jumlah semua item.
- MAKSIMALKAN budget: total HARUS berada di antara 90% dan 100% dari Rp ${data.budget.toLocaleString("id-ID")} (yaitu Rp ${Math.round(data.budget * 0.9).toLocaleString("id-ID")} – Rp ${data.budget.toLocaleString("id-ID")}). Jangan menyisakan banyak uang; jika budget longgar, tingkatkan kualitas penginapan, restoran, aktivitas berbayar (tur, sewa kendaraan pribadi, spa, pengalaman premium), dan oleh-oleh. Jangan pernah melebihi budget.
- costs.note menjelaskan bagaimana budget dimanfaatkan dan sisa (jika ada).
- 3 rekomendasi penginapan yang sesuai porsi budget penginapan (harga per malam x jumlah malam ≈ item Penginapan) dan 4-6 kuliner khas di ${data.city}.
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
// Gemini rejects $ref in schemas, so inline the shared activity shape.
function inlineSchema(): unknown {
  const { $defs, ...rest } = responseSchema;
  return JSON.parse(JSON.stringify(rest).replaceAll('{"$ref":"#/$defs/activities"}', JSON.stringify($defs.activities)));
}

async function callGemini(apiKey: string, model: string, data: ItineraryInput): Promise<ItineraryResult> {
  const schema = inlineSchema() as Record<string, unknown>;
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip);
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) if (k !== "additionalProperties") out[k] = strip(v);
      return out;
    }
    return node;
  };
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: buildPrompt(data) }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: strip(schema) },
      }),
    },
  );
  if (!response.ok) {
    console.error("Gemini error", response.status, await response.text());
    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (response.status === 400 || response.status === 401 || response.status === 403) throw new Error("AI_KEY");
    throw new Error("AI_ERROR");
  }
  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new Error("AI_EMPTY");
  try {
    return JSON.parse(text) as ItineraryResult;
  } catch {
    throw new Error("AI_PARSE");
  }
}

// Collect every Gemini key: GEMINI_API_KEYS="key1,key2,..." plus the single
// GEMINI_API_KEY. Duplicates and empty entries are removed.
function geminiKeys(): string[] {
  const many = (process.env["GEMINI_API_KEYS"] ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const single = process.env["GEMINI_API_KEY"]?.trim();
  return [...new Set(single ? [single, ...many] : many)];
}

// Load balancing: each request starts from the next key in rotation, so with
// two keys the load splits roughly 50:50. If the starting key hits a quota
// limit or error, the loop below fails over to the other keys automatically.
let keyRotationCounter = 0;

function rotatedKeys(keys: string[]): string[] {
  if (keys.length < 2) return keys;
  const start = keyRotationCounter++ % keys.length;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

export async function generateItineraryWithAi(data: ItineraryInput): Promise<ItineraryResult> {
  // Gemini is Lokamate.id's primary brain whenever a Google key is present.
  const keys = geminiKeys();
  if (keys.length > 0 && (process.env["AI_PROVIDER"] ?? "gemini").trim().toLowerCase() === "gemini") {
    const model = process.env["GEMINI_MODEL"]?.trim() || "gemini-flash-latest";
    // Google sometimes answers 503 "high demand": retry briefly, then rotate
    // to the next API key, then try lighter models.
    const models = [...new Set([model, "gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest"])];
    let lastError: unknown;
    for (const m of models) {
      for (const key of rotatedKeys(keys)) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            return await callGemini(key, m, data);
          } catch (error) {
            lastError = error;
            const msg = (error as Error).message;
            // A bad key will never recover — skip straight to the next key.
            if (msg === "AI_KEY") break;
            if (msg !== "RATE_LIMIT" && msg !== "AI_ERROR") throw error;
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1) + Math.random() * 500));
          }
        }
      }
    }
    throw lastError;
  }
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
