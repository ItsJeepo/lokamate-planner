type PhotoAttribution = { displayName?: string; uri?: string };

export type DestinationPhoto = {
  url: string;
  attributions: { name: string; url?: string }[];
};

// Google Places photos are retrieved when viewed, not copied into permanent storage.
export async function findDestinationPhoto(city: string): Promise<DestinationPhoto | null> {
  const key = process.env["GOOGLE_API_KEY"]?.trim();
  if (!key) return null;

  try {
    const search = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.photos",
      },
      body: JSON.stringify({
        textQuery: `tempat wisata terkenal di ${city}, Indonesia`,
        languageCode: "id",
        maxResultCount: 3,
      }),
    });
    if (!search.ok) {
      console.error("Google Places search failed", search.status);
      return null;
    }
    const data = (await search.json()) as {
      places?: { photos?: { name?: string; authorAttributions?: PhotoAttribution[] }[] }[];
    };
    const photo = data.places?.flatMap((place) => place.photos ?? []).find((item) =>
      /^places\/[^/]+\/photos\/[^/]+$/.test(item.name ?? ""),
    );
    if (!photo?.name) return null;

    const media = await fetch(
      `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=1600&skipHttpRedirect=true`,
      { headers: { "X-Goog-Api-Key": key } },
    );
    if (!media.ok) {
      console.error("Google Places photo failed", media.status);
      return null;
    }
    const response = (await media.json()) as { photoUri?: string };
    if (!response.photoUri) return null;
    const url = new URL(response.photoUri);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".googleusercontent.com")) return null;

    return {
      url: response.photoUri,
      attributions: (photo.authorAttributions ?? [])
        .filter((author) => author.displayName)
        .map((author) => ({
          name: author.displayName ?? "",
          ...(author.uri?.startsWith("https://") ? { url: author.uri } : {}),
        })),
    };
  } catch (error) {
    console.error("Google Places destination photo unavailable", error);
    return null;
  }
}