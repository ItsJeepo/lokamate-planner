<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the imported Lokamate app in TanStack file routes, with shared site chrome in `__root.tsx`, so its pages retain their existing paths.
- Keep account data and saved itineraries in Lovable Cloud, while the optional MySQL path remains for local hosting only, so the workspace works without external credentials.
- Keep editable personal profile fields in authenticated user metadata and manage them through the auth client on the profile route; this reuses account storage for hosted and self-hosted installations without a separate profile table.
- Store travel photographs as real image files under `src/assets` imported directly, so the app works fully offline when self-hosted.
- Bundle generated destination landmark illustrations as separate local image imports, so the destination gallery needs no external photo service.
- Retrieve optional Google Places destination photos directly with the owner's server-side GOOGLE_API_KEY at viewing time, with local travel photos as fallback; never cache Google photo content because Google's licensing forbids it, and always show attribution. This keeps third-party service credentials under the owner's control.
- Gemini (GEMINI_API_KEY) is the primary itinerary AI, with OpenAI and the Lovable gateway as fallbacks, so self-hosting needs only a Google key.
- Each user keeps at most 2 itineraries and rows older than 30 days are purged, to bound storage and AI cost.
- Self-hosted mode (DATA_SOURCE=mysql + VITE_AUTH_MODE=local) authenticates against the MySQL users table with signed HTTP-only cookies via requireAppAuth, so local installs need no Lovable Cloud.
- Keep itinerary reporting based on a pure helper over the authenticated user's existing itinerary store, so Cloud and self-hosted data share behavior without widening access.
