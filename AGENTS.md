# AGENTS.md

Guidance for any coding agent working in this repo. Read this before
making changes — it exists to stop an agent from "helpfully" introducing
a framework or build step that breaks the deploy, or silently violating a
convention the rest of the codebase depends on.

## What this is

A Jekyll 4.3.1 static site (ELIXIR Ireland's public site), hosted on
**GitHub Pages via its native Jekyll build** — pushing to `main` deploys
automatically within minutes. There is **no CI / build-validation step**
(`.github/workflows/` only contains an issue-notification emailer, nothing
that builds or tests the site). A broken Liquid tag, malformed YAML front
matter, or a JS error ships straight to production with nothing to catch
it first. Test locally (see "Local dev" below) before pushing.

## Hard constraints — do not introduce

- **No JS build toolchain.** No `package.json`, npm/yarn/pnpm, webpack,
  vite, rollup, or any bundler. None exist anywhere in this repo today —
  `_config.yml` even explicitly excludes `node_modules/`. Don't add one.
- **No frontend framework.** No React, Vue, Svelte, Alpine, TypeScript.
  All JS is plain vanilla: global-scope IIFEs
  (`(function(){ ... })()` + `window.X = ...` exports), zero
  `import`/`export`/`require` anywhere. Match this style exactly.
- **No CSS preprocessor.** Plain CSS only — no Sass/Less, despite a
  leftover `.sass-cache/` entry in `_config.yml`'s exclude list (not
  actually in use).
- **News and Events are plain JS array data**, not Jekyll
  collections/posts: `assets/js/news_items.js` and
  `assets/js/events_items.js`. Don't "migrate" this to front-matter-driven
  collections as a drive-by refactor — see
  `.claude/skills/news-events-cards/SKILL.md` for the intended workflow.

## Architecture you're working inside

- **Custom SPA navigation** (`assets/js/navigation.js`): intercepts
  internal link clicks, fetches the target page via AJAX, and swaps only
  the `<main>` content — header and footer persist across navigations.
- **Per-page init pattern**: each page-specific script (`news.js`,
  `events.js`, `services.js`, `vibe.js`, `home.js`) self-registers
  `window.initializeXxx` (and usually `window.resetXxx`), called once on
  normal load and re-invoked by `navigation.js`'s `initializePage()` after
  every AJAX swap. **A new page script must follow this exact pattern**,
  or it will work on first load and silently stop working after the first
  in-app navigation.
- **Script inclusion is conditional per URL** in `_layouts/default.html`
  (e.g. `{% if page.url contains '/vibe/' %}`). Adding a new
  page-specific JS file means adding its conditional `<script>` tag there
  too — it won't be picked up automatically.
- **FOUC prevention**: `_layouts/default.html` sets `body{opacity:0}`
  inline, then an inline `<script>` at the end of `<body>` adds a
  `.ready` class that transitions it to `opacity:1`. If you're
  screenshotting a page with a headless browser to verify a change, a
  capture taken too early will show a dark/blended page — pass
  `--virtual-time-budget=3000`+ (or an equivalent wait) to
  `google-chrome --headless` so the fade-in finishes first.
- **Cache-busting is manual and inconsistent** — check `_layouts/default.html`
  when you edit these:
  - `styles.css?v=14` — bump `v` when you edit `assets/css/styles.css` or
    `assets/css/vibe.css`, or returning visitors may keep the stale CSS.
  - `navigation.js?v=4`, `services.js?v=2` — same, bump on edit.
  - `news_items.js` / `news.js` / `events_items.js` / `events.js` already
    auto-bust via `{{ site.time | date: '%s' }}` — no action needed.
  - `ei.js`, `ui.js`, `vibe.js`, `home.js` have **no** cache-busting at
    all currently. This is a known gap — don't "fix" it as a side effect
    of an unrelated change; mention it if it becomes relevant.

## Styling conventions — inconsistent by design, match the page you're in

- `assets/css/styles.css` (~3000 lines) is the main stylesheet, but heavy
  inline `style="..."` attributes coexist with it throughout page HTML
  (e.g. `participate/index.html`, `about/index.html`). There's no single
  hard rule here. `services/index.html`, by contrast, is fully
  class-based with zero inline styles. **Check how the page you're
  editing already does it and follow that**, rather than picking one
  approach globally.
- `assets/css/vibe.css` is smaller and more disciplined — BEM-ish
  component/modifier naming (`.pi-card`, `.pi-filter-btn--all`). Prefer
  this style as the model for *new* CSS components.
- `_includes/footer.html` inlines its own `<style>` block;
  `_includes/header.html` relies entirely on `styles.css` classes. This
  inconsistency is known — don't "fix" it incidentally while working on
  something else.
- Brand colors: navy `#023452`, orange `#f47920` (gradient stops
  `#0a5f8f` / `#ffae63` used in custom SVG card icons).

## Local dev & verification

See the README's **"Local Debugging & Container Checks"** section for the
Docker Compose workflow (`docker compose up -d --build`, `logs -f`,
`exec bash`, etc.) — verify changes against the running container before
pushing, since nothing else will catch a mistake.

Run `python3 scripts/validate_front_matter.py` after touching any page's
YAML front matter.

**GitHub Pages runs Liquid over every `.md` file, even ones with no front
matter** (via the `jekyll-optional-front-matter` plugin). A literal
`{% ... %}` or `{{ ... }}` written as a code example in a repo-root doc
like this one — even inside backticks — gets parsed as a real Liquid tag
and can break the *entire site build* with an unclosed-tag error, not
just fail to render that one file. This already happened once with the
`{% if %}` example on this page. Either wrap literal Liquid syntax in
`{% raw %}...{% endraw %}`, or add the file to `_config.yml`'s `exclude:`
list (as done for `AGENTS.md`, `README.md`) if it's pure repo tooling
docs with no reason to be a published page. After editing any root-level
`.md` file, rebuild locally (below) and confirm no `Liquid Exception`
appears in the output — don't just check the diff looks fine.

## Recurring tasks with dedicated skills

- Adding/updating a News or Event card: `.claude/skills/news-events-cards/SKILL.md`
- Adding/updating a VIBE Principal Investigator entry: `.claude/skills/vibe-pi-directory/SKILL.md`
- Turning a News or Event item into a LinkedIn post (copy + image asset,
  output to `linkedin_posts/`, not published anywhere by the agent):
  `.claude/skills/linkedin-post/SKILL.md`

Use these instead of re-deriving the pattern from scratch — they encode
gotchas (e.g. exact `data-affiliation` string matching for VIBE, or that
LinkedIn's composer needs literal Unicode-bold characters since it has no
markdown) that aren't obvious from the markup alone.
