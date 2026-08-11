---
name: linkedin-post
description: >
  Use this skill whenever the user wants an ELIXIR Ireland news item or event
  (one already on the site, or a fresh announcement/press release) turned into
  a LinkedIn post — e.g. "make a LinkedIn post for X", "create the LinkedIn
  asset for this event", "turn this news item into a LinkedIn post". Also
  offer it proactively right after adding a card with the news-events-cards
  skill — ask the user if they want a LinkedIn post generated for what was
  just added. Produces a dated folder under linkedin_posts/ containing
  ready-to-paste post copy (Unicode-bold formatted, since LinkedIn's composer
  has no markdown/rich-text) and a dedicated square LinkedIn image generated
  in ELIXIR Ireland's brand style, plus a copy of the item's existing image
  (site icon or real photo) if it has one.
---

# LinkedIn Post Generator

Turns a site news item or event into a LinkedIn-ready post: copy-paste text
plus a scroll-stopping square image. Pairs with
`.claude/skills/news-events-cards/SKILL.md` — after adding a card there,
offer to run this skill on the same item.

LinkedIn's composer cannot access LinkedIn directly (no posting API here) —
this skill only *prepares the asset*. The user pastes the text and uploads
the image themselves.

## 1. Gather the source material

Pull from the news/event entry already added to
`assets/js/news_items.js` / `assets/js/events_items.js`, or from whatever
draft/press-release text the user hands you directly:

- Headline / title
- Date (event date, or publish date for news)
- 2-4 sentence substance — what happened / what it is, why it matters
- Any person to credit by name + role + institution
- The canonical link (the site subpage, or the external event/registration
  page — whichever the site's `link` field points to)
- Existing image path, if the item has one (SVG icon, real photo, flyer)

Don't invent facts, quotes, or numbers not present in the source material.

## 2. Output location

Create `linkedin_posts/<YYYYMMDD>-<slug>/`, where `YYYYMMDD` is **today's
date** (the date the post is being prepared/posted), not the event date —
check the current date rather than assuming. `<slug>` is a short kebab-case
label for the item (e.g. `all-island-biobank-symposium`).

Each folder contains:

```
linkedin_posts/20260811-all-island-biobank-symposium/
├── post.txt                 # ready-to-paste text (see §3)
├── linkedin-image.png       # dedicated 1200x1200 generated graphic (see §4)
└── all-island-biobank-symposium-2026.jpeg   # copy of the item's existing
                                              # image asset, original filename,
                                              # only if one exists
```

If the item has no pre-existing image (a pure SVG-icon news card counts as
having one — copy it too), the folder just has `post.txt` and
`linkedin-image.png`.

## 3. Write the post copy

Style — calibrated for a professional research-infrastructure audience,
written so a non-technical reader can still follow it at a glance:

- **Hook first line.** LinkedIn truncates to ~200 characters before
  "…see more" — the opening line must stand alone and earn the click. Lead
  with the news, not a preamble ("ELIXIR Ireland is pleased to announce…"
  is weaker than stating the thing itself).
- **Short lines, generous line breaks.** Write in 1-2 sentence paragraphs
  with a blank line between them — dense unbroken paragraphs read as a wall
  of text and get scrolled past. Aim for roughly 80-150 words total body
  copy; this is a feed post, not the news subpage.
  - **Emoji, sparingly.** One emoji leading the hook line is usually enough,
  plus maybe one more marking a credit/spotlight or the closing link line.
  Pick emoji that match the content, not generic decoration: 🧬 genomics/
  biobanking, 🎥 video content, 📅 events, 🎓 training/education, 🤝
  partnership/collaboration, 🔗 the closing link line. Never stack more than
  one emoji in a row.
- **Bold key phrases only** — org names, the core subject, a person's name —
  using `**double asterisks**` in the draft. 2-4 bolded spans per post is
  plenty; bolding everything defeats the purpose. Do not bold whole
  sentences.
- **Credit people by name, role, and institution** when the source material
  names someone specifically (e.g. "Dr Maria Doyle, ELIXIR-IE Training
  Coordinator, University of Limerick") — this is what makes a post feel
  human rather than corporate.
- **End with the link on its own line**, after a short call-to-action
  ("Watch the videos:", "Full details and registration:"). Paste the URL as
  plain text — LinkedIn auto-links it; do not wrap it in markdown link
  syntax.
- **3-6 relevant hashtags** on the final line, mixing an org tag
  (`#ELIXIRIreland`) with 2-5 topical ones drawn from the actual content
  (`#OpenScience`, `#Bioinformatics`, `#Biobanking`, `#FAIRdata`,
  `#LifeSciences`, `#ResearchInfrastructure`, `#TrainTheTrainer` — pick
  what's true of *this* item, don't reuse a fixed set every time).

Write the draft with `**bold**` markers, then convert it to the literal
Unicode-bold characters LinkedIn actually needs — do not hand-substitute
these characters yourself, the codepoints are easy to get subtly wrong:

```bash
python3 .claude/skills/linkedin-post/scripts/format_post.py draft.md > \
  linkedin_posts/<slug-folder>/post.txt
```

(`draft.md` can be a scratch file — only `post.txt` needs to land in the
output folder.) Read `post.txt` back after generating it to confirm the
bold spans look right and nothing else was mangled.

## 4. Generate the image

Target **1200×1200px**, square — square/near-square images occupy more
vertical space in the LinkedIn feed than a landscape crop, which is what
makes a post stop the scroll. Legibility at small size is the whole point:
this is read as a thumbnail while scrolling, not studied up close.

Design rules (extends the card-icon house style in
`news-events-cards/SKILL.md` §5 — same brand colors, adapted for a square,
text-forward format):

- Brand gradients: navy `#023452` → `#0a5f8f`, orange `#f47920` → `#ffae63`,
  soft near-white background (`#f8fbff` → `#fff7f2`).
- **One headline, 4-8 words, large and bold** — the single thing a scrolling
  viewer should read. Not the full post copy, not a subhead-and-three-bullets
  layout. If it needs a second line, add one short supporting line in a
  visibly smaller weight/size underneath, not more headline text.
  For an event, the date is usually worth including as its own compact line
  (icon + short date string), since that's the second most-scanned fact
  after the headline.
- Small `ELIXIR Ireland` wordmark/lockup in a corner so the image is
  identifiable even reposted out of context.
- One simple central motif in the same style as the card-icon recipe
  (play-button, location pin, linked nodes, badge — whatever fits) built
  from basic shapes, not a stock photo pasted in.
- If the item's existing asset is a real photo (not a generated icon) and
  it's good quality, you may use it as a background treatment (e.g.
  darkened/gradient-overlaid, motif dropped on top) instead of inventing an
  unrelated motif — use judgement on which reads better; either is fine, but
  don't force a photo in if it makes the text hard to read at thumbnail size.

Build it as a self-contained HTML file (inline CSS, system sans-serif to
match the site's `Arial, Helvetica, sans-serif` stack — no external fonts,
no network requests), then rasterize with headless Chrome.

**Gotcha:** requesting `--window-size` exactly equal to the target
dimensions truncates the bottom ~80-90px of content (observed: a
1200×1200 page rendered with `--window-size=1200,1200` cuts off
everything below ~y=1113, composited black if the background isn't
opaque). Request extra height, screenshot, then crop to the exact target
size:

```bash
google-chrome --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/.../linkedin-image-raw.png \
  --window-size=1200,1320 --virtual-time-budget=3000 \
  file:///absolute/path/to/scratch-design.html

python3 -c "
from PIL import Image
Image.open('/tmp/.../linkedin-image-raw.png').convert('RGB') \
     .crop((0, 0, 1200, 1200)) \
     .save('linkedin_posts/<slug-folder>/linkedin-image.png')
"
```

Read the resulting PNG back afterward and actually look at it — check the
headline isn't clipped, contrast is strong enough to read on a phone
screen, nothing overlaps the wordmark, and there's no black band at the
bottom from the truncation bug above. Regenerate rather than shipping
something cluttered.

## 5. Copy over the existing image asset, if any

If the source news/event entry's `image` field points at a real file
(SVG icon or photo), copy that file into the same output folder unchanged
(same filename, same bytes) alongside the new `linkedin-image.png` — the
user may prefer the original for some posts (e.g. LinkedIn's own
link-preview card if they paste the URL instead of uploading an image).

## 6. Hand back to the user

Summarize what's in the folder and remind them this skill only prepares
the asset — nothing is posted automatically. Point them at `post.txt` to
copy and the PNG to upload.
