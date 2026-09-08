---
name: news-events-cards
description: >
  Use this skill whenever the user asks to add, create, or draft a news item
  or event for the ELIXIR Ireland website (elixir-ireland.ie), e.g. "make
  a news card for X", "add this announcement to the news page", "add an
  event for Y", "post this to the news feed", or when given a press
  release / announcement draft (title, subtitle, body, SEO fields, socials
  copy) that should be turned into a site news card. Also use it when asked
  to create a matching icon/graphic for a news or event card that has no
  photo yet. Covers both linking out to an external announcement (no local
  subpage) and creating a full local news story page.
---

# News & Events Cards

This site (Jekyll, `assets/js/news_items.js` + `assets/js/events_items.js`)
renders News and Events entirely from two JS data arrays; there are no
Jekyll collections/posts for these. Both `news/index.html` and the homepage
recent-news widget read `newsItems` directly; `events/index.html` reads
`eventsItems`. Adding a card is a **data-only** change unless a dedicated
subpage is explicitly requested.

## 1. Decide: link out, or dedicated subpage?

- **Default / most common**: point `link` straight at the external URL
  (the org's own site, Eventbrite, a partner Node's news page, etc.). Do
  **not** create a local subpage unless the user asks for one or the
  content has no canonical home elsewhere.
- **Dedicated subpage**: only when asked, or the story is native to
  ELIXIR Ireland and has nowhere else to live. See §4.

## 2. Add a News item

Edit `assets/js/news_items.js`. Insert the new object. Position doesn't
matter for rendering (both pages sort by `date` descending at runtime),
but conventionally add it near the top for readability:

```js
{
  title: "Exact headline",
  date: "YYYY-MM-DD",          // drives sort order; see the embargo note below
  summary: "1-3 sentences. Reuse the SEO meta/excerpt description if one was supplied.",
  image: "/assets/images/some-icon.svg",
  link: "https://example.org/the-announcement/"   // or "/news/local-slug/" for a subpage
}
```

Field notes:
- `summary`: if the source material includes an SEO "meta/excerpt
  description", use that verbatim; it's already been tuned to length.
- `image`: prefer a real photo if the user supplied one. If not, generate
  a custom SVG icon (see §3).
- `link`: if the destination isn't live yet (e.g. embargoed partner-Node
  announcement), still use the real final URL/slug if the user has
  confirmed it. It's fine for it to 404 until the other side publishes.
  Don't invent a URL if no slug/domain was given; ask.

### House style: no em dashes

**Do not use em dashes (`—`) in any card summary, title, or page copy.**
They were overused in earlier entries and the site owner has asked for
them gone. Reach for ordinary punctuation instead, picking whatever fits
the sentence:

| Instead of an em dash | Use |
|---|---|
| Introducing a list or gloss | a colon: `by service type: compute, data, tools` |
| An aside inside a sentence | commas, or parentheses if it's a true aside |
| Joining two related clauses | a full stop and a new sentence |
| `Term — definition` in a list | `Term: definition` |

**En dashes (`–`) are fine, but only for genuine ranges** such as
`10:00–12:00`, `8–9 October`, `2029–2033`, `1–9`. Never use an en dash
as a substitute for the em dash you just removed.

Before finishing, check your own additions:

```bash
grep -n '—' assets/js/news_items.js assets/js/events_items.js news/<slug>/index.html
```

Only pre-existing entries you didn't touch may still contain them; leave
those alone unless asked.

## 3. Add an Event

Edit `assets/js/events_items.js`. Same pattern, plus location and an
optional separate registration link:

```js
{
  title: "Event Name",
  date: "YYYY-MM-DD",
  location: "Venue, City, Country",
  summary: "1-3 sentences.",
  image: "/assets/images/event-icon.svg",
  link: "https://event-website.com",
  registrationLink: "https://registration-link.com"   // omit if same as link
}
```

## 4. Full local news story (only if requested / no external home)

Create `news/<slug>/index.html`:

```yaml
---
layout: default
title: Story Title - ELIXIR Ireland
description: One single-line description (front matter must stay single-line, see scripts/validate_front_matter.py).
---
```
Then write the body content below the front matter, following the
markup patterns in an existing `news/<slug>/index.html` (e.g.
`news/lars-jermiin-rdm-coordinator/index.html`). Point the news_items.js
`link` at `/news/<slug>/`.

## 5. No real photo? Generate a matching SVG icon

The site has an established house style for icon-only news/event cards
(no stock photo). Reuse it rather than inventing a new look. See
`assets/images/qub-joins-elixir-uk.svg` and
`assets/images/elixir-ie-uk-webinars.svg` as reference templates.

Recipe (1200×630 viewBox, matches card aspect ratio):
- Brand colours: navy `#023452` → `#0a5f8f` gradient; orange `#f47920` →
  `#ffae63` gradient. Background is a soft near-white gradient
  (`#f8fbff` → `#fff7f2`) with a couple of large low-opacity brand-colour
  circles for texture.
- A rounded navy (or orange) banner bar near the top holding the
  org/programme name in bold white text, with a lighter subtitle line
  beneath it.
- One central motif relevant to the story (a location pin for a new
  institutional member / geographic expansion, two linked circles for a
  collaboration/webinar, a badge/seal for an award or publication, etc.)
  built from basic shapes, with no external assets and no `<image>` embeds.
  `<filter id="shadow">` with `feDropShadow` gives it depth consistently.
- Large bold navy headline text + a smaller grey subhead beneath the
  motif, centred.
- Always include `<title>` and `<desc>` for accessibility, matching the
  card's actual headline/summary.

Save as `assets/images/<descriptive-slug>.svg` and reference it as the
`image` field.

## 6. Verify before calling it done

This is a static Jekyll site with a Docker dev setup (see the README's
"Local Debugging & Container Checks" section). Before reporting the card
as done:

```bash
docker compose up -d --build     # if not already running
docker compose logs jekyll --tail 100 | grep -i "exception\|error"   # must be empty
curl -s http://localhost:4000/assets/js/news_items.js | grep -A6 "the new title"
```

**Always check the build log, not just the data file.** GitHub Pages runs
one Jekyll build for the whole site, so a Liquid/YAML error in a completely
unrelated file (a stray `{% %}` in some other `.md`, broken front matter
elsewhere) fails the *entire* deploy, and grepping only your own diff
will never catch that. This has actually happened (an unrelated repo-root
`.md` broke a production deploy that shipped alongside a news card
change). See `AGENTS.md`'s note on Liquid-in-markdown for the specific
gotcha. A clean `docker compose logs` with no `Liquid Exception` /
`Error` lines is the real signal the site will build, not just that your
new entry parses.

Then take a headless screenshot of `/news/` (or `/events/`) and actually
look at it. Confirm the icon renders, text isn't clipped, and the
greyscale/pending or other styling (if relevant) reads correctly:

```bash
google-chrome --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/.../check.png --window-size=1400,1600 \
  http://localhost:4000/news/
```

## 7. Embargo / future-dated items: important caveat

There is **no publish-scheduling mechanism** in this codebase. Every
entry in `news_items.js` / `events_items.js` renders immediately once
deployed, regardless of its `date` value. Dates only control sort
order, they don't gate visibility. If the user gives an embargo date in
the future, add the entry as normal but explicitly flag to them: don't
merge/deploy until the embargo lifts, since adding it now makes it live
on push to `main` (GitHub Pages auto-deploys).

## 8. Offer a LinkedIn post

Once a card is added (and, for a dedicated subpage, verified), offer to
generate a LinkedIn post for it via `.claude/skills/linkedin-post/SKILL.md`
It turns the same item into ready-to-paste post copy and a matching
square image asset under `linkedin_posts/`. Don't run it unprompted; just
ask.
