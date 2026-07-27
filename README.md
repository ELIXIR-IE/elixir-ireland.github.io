# ELIXIR Ireland Website

The official website for [ELIXIR Ireland](https://elixir-ireland.ie) — the Irish node of ELIXIR Europe, an intergovernmental organisation that brings together life-science resources from across Europe.

Built with **Jekyll 4.3.1** and hosted on **GitHub Pages**.

---

## Quick Start (Docker — recommended)

```bash
git clone https://github.com/ELIXIR-IE/elixir-ireland.github.io.git
cd elixir-ireland.github.io
docker compose up
```

Site available at **http://localhost:4000** with live-reload.

## Quick Start (Native Ruby)

### Prerequisites

- Ruby ≥ 2.7 with RubyGems
- Bundler (`gem install bundler`)
- GCC and Make (for native gem extensions)

### Install & Run

```bash
bundle install
bundle exec jekyll serve --livereload
```

Site available at **http://localhost:4000**.

---

## Directory Structure

```
_config.yml              # Jekyll configuration
_layouts/default.html    # Single layout used by all pages
_includes/               # Reusable partials
    header.html          #   Site header + navigation
    footer.html          #   Site footer (with inline styles)
    vibe_pis.html        #   VIBE PIs grid partial
assets/
    css/styles.css       #   Main stylesheet (~3000 lines)
    css/vibe.css         #   VIBE page styles
    js/                  #   All JavaScript modules
        navigation.js    #     SPA navigation router
        news_items.js    #     News content data
        events_items.js  #     Events content data
        home.js          #     Homepage logic
        news.js          #     News page logic
        events.js        #     Events page logic
        services.js      #     Services page logic
        vibe.js          #     VIBE page logic
        ei.js            #     Core initialisation
        ui.js            #     Mobile menu / UI
    images/              #   All site images
about/index.html         # About page
events/index.html        # Events page
news/index.html          # News listing
news/*.html              # Individual news stories
participate/index.html   # Participate page
services/index.html      # Services page
vibe/index.html          # VIBE (Virtual Institute) page
what-we-do/index.html    # Our Work page
scripts/                 # Utility scripts
    validate_front_matter.py
```

## Architecture

The site uses a **custom SPA (Single-Page Application) navigation** system — `navigation.js` intercepts internal link clicks, fetches the target page via AJAX, and swaps the `<main>` content without a full page reload. The header and footer persist across navigations.

Content data for **News** and **Events** is stored in JavaScript arrays (`news_items.js`, `events_items.js`), not Jekyll posts.

## Adding Content

### News Item

Edit `assets/js/news_items.js` and add an object to the array:
```js
{
    title: "Your Title",
    date: "2026-04-02",
    summary: "Brief summary text.",
    image: "/assets/images/your-image.png",
    link: "/news/your-story/"
}
```

### Event

Edit `assets/js/events_items.js` and add an object to the array:
```js
{
    title: "Event Name",
    date: "2026-06-15",
    location: "Dublin, Ireland",
    summary: "Brief summary.",
    image: "/assets/images/event-image.png",
    link: "https://event-website.com",
    registrationLink: "https://registration-link.com"
}
```

### Full News Story

Create a new HTML file (e.g. `news/my-story/index.html`) with layout and front matter:
```yaml
---
layout: default
title: My Story - ELIXIR Ireland
description: A one-line description (must be single line).
---
```

## Useful Commands

```bash
# Docker development
docker compose up              # Start with live-reload
docker compose down            # Stop

# Native development
bundle install                 # Install dependencies
bundle exec jekyll serve       # Start local server
bundle exec jekyll clean       # Clear build cache

# Validation
python3 scripts/validate_front_matter.py   # Check YAML front matter
```

## Local Debugging & Container Checks

Once `docker compose up` (or `docker compose up -d --build` to run detached) is running, the container is
named `elixir-ie_website-jekyll-1` (based on the `elixir-ie_website` project/folder name — Compose derives this
from the directory, so it may differ if you cloned into a different folder name; check with `docker compose ps`).

```bash
# Check the container is up and see port mappings
docker compose ps

# Tail Jekyll's build/serve output (regeneration errors, Liquid errors, etc.)
docker compose logs -f jekyll

# Confirm the site is actually responding
curl -I http://localhost:4000/

# Shell into the running container
docker compose exec jekyll bash

# Rebuild after a Gemfile change, then restart
docker compose up -d --build

# Stop and remove the container
docker compose down
```

If a page isn't updating, check the `docker compose logs -f jekyll` output first — live-reload watches the
mounted volume, but a Liquid/YAML front-matter error will silently fail the regeneration until fixed.

## Deployment

Push to `main` → GitHub Pages auto-builds and deploys within minutes.

## Submitting Issues

Use the repository issue templates:

- [Submit a news item](https://github.com/ELIXIR-IE/elixir-ireland.github.io/issues/new?template=news_submission.yml)
- [Submit an event](https://github.com/ELIXIR-IE/elixir-ireland.github.io/issues/new?template=event_submission.yml)
- [Report a bug or suggest an improvement](https://github.com/ELIXIR-IE/elixir-ireland.github.io/issues/new?template=general_website_issue.yml)

## Contact

- **ELIXIR Ireland:** elixir@ul.ie
- **Gavin Farrell:** gavin.farrell@ul.ie

## License

This project is maintained by ELIXIR Ireland.
