# ELIXIR Ireland Website — Agent Instructions

## Project Overview

Static website for **ELIXIR Ireland** (the Irish node of ELIXIR Europe) built with **Jekyll 4.3.1**, hosted on **GitHub Pages** at [elixir-ireland.ie](https://elixir-ireland.ie).

## Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Static site generator | Jekyll 4.3.1 | Ruby-based, uses Liquid templates |
| Hosting | GitHub Pages | Auto-deploys from `main` branch |
| Navigation | Custom SPA (AJAX) | `navigation.js` intercepts internal links, swaps `<main>` content without full reload |
| Styling | Vanilla CSS | Single main stylesheet `assets/css/styles.css`, plus `vibe.css` for VIBE page |
| JavaScript | Vanilla JS | No frameworks — plain modules in `assets/js/` |
| Content data | JS arrays | News in `news_items.js`, Events in `events_items.js` (not Jekyll posts) |
| Fonts | Google Fonts CDN | Source Sans Pro (300, 400, 600, 700) |
| Icons | Unicode emoji + inline SVG | No icon font library for main site |

## Directory Structure

```
_config.yml          # Jekyll config
_layouts/default.html # Single layout template (all pages use this)
_includes/           # header.html, footer.html, vibe_pis.html
assets/
  css/styles.css     # Main stylesheet (~3000 lines)
  css/vibe.css       # VIBE page styles only
  js/                # All JavaScript modules
  images/            # All site images (PNG, JPEG, SVG, WebP)
about/index.html     # About page
events/index.html    # Events page
news/index.html      # News listing page
news/*.html          # Individual news story pages
participate/index.html
services/index.html
vibe/index.html      # VIBE (Virtual Institute) page
what-we-do/index.html
scripts/             # Utility scripts (front-matter validation)
.github/ISSUE_TEMPLATE/ # GitHub issue forms
```

## Branding — ELIXIR Ireland

### Colour Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Primary Blue (dark)** | `#023452` | Header, footer, headings, hero backgrounds |
| **Primary Blue (gradient)** | `#034a73` | Gradient overlays, hover states |
| **Orange (action)** | `#f47920` | Buttons, links, accents, CTAs, focus outlines |
| **Orange (light)** | `#ff9f50` | Loading bar gradient end |
| **Text** | `#333333` | Body text |
| **Text secondary** | `#495057` | Secondary/muted text |
| **Link** | `#0d47a1` | Default link colour |
| **Link hover** | `#1976d2` | Hovered links |
| **Section background** | `#e8eaed` | Alternating section backgrounds |
| **Card background** | `#f0f4f8` | Highlighted sections, card fills |
| **White** | `#ffffff` | Cards, main page background |

### Typography

- **Primary font:** `'Source Sans Pro'` (weights: 300, 400, 600, 700)
- **Fallback stack:** `'Helvetica Neue', Helvetica, Arial, sans-serif`
- Loaded via Google Fonts CDN with `display=swap`

### Design Tokens

- Container max-width: `1200px` (header: `1400px`)
- Border-radius: `4px` (buttons/small), `8–12px` (cards/large)
- Shadow: `0 2px 8px rgba(0,0,0,0.08)` (cards)
- Transition timing: `0.3s ease`
- Responsive breakpoints: `1200px`, `1024px`, `768px`, `480px`

## Critical Rules — DO NOT VIOLATE

### 1. YAML Front Matter

The `description` field in any YAML front matter **MUST** be on a single line. Multi-line descriptions break the Jekyll build and GitHub Pages deploy.

```yaml
# CORRECT
description: This is a long description that stays on one line even if it is very long.

# WRONG — will break the build
description: >
  This spans multiple lines
  and will cause a build failure.
```

Run `python3 scripts/validate_front_matter.py` after modifying any HTML file with front matter.

### 2. FOUC Prevention

The site uses a critical CSS pattern to prevent Flash of Unstyled Content:
- `<html>` has `background-color: #023452` (inline `<style>` in layout)
- `<body>` starts with `opacity: 0` (inline `<style>` in layout)
- `body.ready` class is added by a script at end of `<body>`, triggering `opacity: 1` with a fast transition
- The `<main>` fade animation (`main.navigated`) is **only** applied during SPA navigation, **not** on initial page load

**Never** add `animation` or `transition` to `<body>` or `<main>` that fires on initial page load. It causes the white flash.

### 3. SPA Navigation System

`navigation.js` is a custom single-page-app router:
- Intercepts internal `<a>` clicks, fetches the target page, extracts `<main>` content, and swaps it in
- Dynamically loads/reloads page-specific CSS and JS
- Uses History API for back/forward
- Has a 5-second watchdog timeout that falls back to full page reload

**Implications for agents:**
- Do not add `<script>` tags outside `<body>` or inside `<main>` content — they won't re-execute on SPA navigation
- Page-specific JS must expose `window.initializeXxx()` and `window.resetXxx()` functions
- New page-specific scripts must be registered in `_layouts/default.html` with the correct `page.url` condition
- All page-specific CSS must be linked in `<head>` via the `css_file` front matter variable, or included in `styles.css`

### 4. Content Data Pattern

News and events are **NOT Jekyll posts**. They are JavaScript arrays:
- `assets/js/news_items.js` → array of `{ title, date, summary, image, link }`
- `assets/js/events_items.js` → array of `{ title, date, location, summary, image, link, registrationLink }`

To add a news item or event, append to the relevant JS array. Do not create Jekyll post files.

### 5. Card Styling

- Cards that are **not** links should **not** have `cursor: pointer`
- Only interactive elements inside cards get pointer cursor
- Use `object-position` in circular avatar images to prevent face cropping

### 6. Image Handling

- All images go in `assets/images/`
- Optimise images before committing (keep under 500KB where possible)
- Use descriptive filenames (lowercase, hyphens, no spaces)

### 7. CSS Organisation

- All global styles are in `assets/css/styles.css` (single file, ~3000 lines)
- VIBE page-specific styles are in `assets/css/vibe.css`
- Footer styles are **inline** in `_includes/footer.html` (inside a `<style>` tag)
- Do not create new CSS files without good reason — keep consolidated
- Cache-bust the CSS link in `default.html` by incrementing the `?v=` parameter after CSS changes

## Build & Development

```bash
# Install dependencies
bundle install

# Local development
bundle exec jekyll serve --livereload

# Docker development (recommended)
docker compose up

# Validate front matter
python3 scripts/validate_front_matter.py

# Clean build cache
bundle exec jekyll clean
```

## Deployment

Push to `main` branch → GitHub Pages auto-builds and deploys. No CI/CD config needed beyond what GitHub Pages provides.

## Contact

- `elixir@ul.ie`
- `gavin.farrell@ul.ie`
