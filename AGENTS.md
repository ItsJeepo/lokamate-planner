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
- Store uploaded travel photographs as asset pointers under `src/assets` instead of committing binary uploads, so media remains portable in the workspace.
