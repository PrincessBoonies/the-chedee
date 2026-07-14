# The Chedee — Boutique Hotel Website

Static marketing site for **The Chedee**, a boutique hotel in Bangkok beside Wat Saket
and the Golden Mount (Ban Baat district, Old Town). Plain HTML/CSS/JS — **no build
step, no framework, no npm**. Every page is a hand-written `.html` file that shares
`css/style.css` and `js/main.js`.

## Site map & nav

Five pages, nav is identical on every page (header + mobile menu + footer):
**Home → Rooms → Gallery → Attraction → Contact**, plus a "Book Now" button.

| File | Purpose |
|---|---|
| `index.html` | Home — video hero, welcome, signature rooms, amenities, location, attraction teaser, testimonials, CTA |
| `rooms.html` | All 5 real room types with photos, specs, pricing |
| `gallery.html` | Filterable photo grid (All / Rooms / Property & Views) with lightbox |
| `attraction.html` | Golden Mount + Old Town heritage/food/nightlife guide, with clickable place-card modals |
| `contact.html` | Contact form (front-end only, no backend) + address/map card |

`dining.html`, `amenities.html`, and `about.html` **were deleted** earlier in the
project (user trimmed the nav from 7 items to 5). Don't recreate them unless asked —
if you see stray references to them anywhere, it's a leftover bug, not intentional.

## Design system

- **Palette**: deep navy ink (`--color-ink: #14252F`) + muted bronze/brass
  (`--color-gold: #8C7A52`) on warm ivory (`--color-ivory: #F5F2EA`). All tokens are
  CSS custom properties at the top of `css/style.css` — reuse them, don't hardcode hex.
- **Typography**: Cormorant Garamond (display, headings — uppercase, light/medium
  weight, wide letter-spacing) + Jost (body/nav/buttons, also wide-tracked). Loaded
  from Google Fonts via `@import` in `style.css`.
- **Reference/inspiration**: this look was deliberately modeled on
  `hotel-wellington.com` (old-world European luxury: navy+bronze, thin uppercase
  serif, minimal radius) after the user rejected an earlier gold/brown
  Playfair+Inter version as "not luxury enough." **Do not revert to gold/brown/Playfair.**
- **Radius scale is small** (2–4px, `--radius-sm/md/lg`) — architectural/editorial,
  not the rounded-bubbly look. Buttons are rectangular-ish with uppercase
  letter-spaced labels, not pills (except small tag chips).
- **Motion**: scroll-reveal via IntersectionObserver (`.reveal` / `.reveal-stagger`
  classes, driven by `js/main.js`), respects `prefers-reduced-motion`.
- Full design tokens/rationale also live in `design-system/the-chedee/MASTER.md`
  (generated earlier by a design-system skill; the CSS file is the source of truth,
  that doc is reference only).

## Real content — what's real vs. placeholder

**Real property photography** is used throughout (`assets/images/`, `assets/video/`),
sourced from a `Pic from Chedee/` folder the user uploads to locally (git-ignored —
see below). Room photos, hero video, lobby/facade shots, and Bangkok attraction
photos (Grand Palace, Loha Prasat, Giant Swing, Democracy Monument, Khaosan Road,
Chao Phraya/Phra Athit) are all genuine images the user supplied.

**Still placeholder / needs real data before going fully live:**
- Contact email (`stay@thechedee.example.com`) and phone (`+66 2 123 4567`) in
  `contact.html` and every footer
- Social links (`href="#"` for Facebook/Instagram/LINE)
- Room prices and specs (size/bed config) in `rooms.html` and the homepage room cards
  — flagged to the user as placeholders, not yet confirmed real numbers
- Privacy Policy / Terms of Service footer links (`#`)

**Real booking engine** is wired in: `https://book-directonline.com/properties/thechedeekrungthep`
— every "Book Now" button links there, and the homepage booking widget is a real
`<form method="get">` that submits `checkInDate`, `checkOutDate`,
`items[0][adults]`, `locale=en`, `from_widget=true`, `referrer=canvas`,
`currency=THB` as query params matching that engine's expected format.

## The Attraction page place-card modals (most complex feature)

`attraction.html` has 6 clickable "place cards" (Grand Palace, Loha Prasat, Wat
Suthat/Giant Swing, Democracy Monument, Khaosan Road, Chao Phraya River/Phra Athit).
Clicking one opens an animated modal (scale+fade+blur backdrop, staggered content
reveal) with photo, history, "what to do" checklist, and visit info. All content data
lives in a `<script type="application/json" id="placeData">` block near the bottom
of `attraction.html`, keyed by place id (`grand-palace`, `loha-prasat`, `giant-swing`,
`democracy`, `khaosan`, `chao-phraya`) — edit that JSON to change modal copy, don't
touch the `.place-card` HTML for content changes.

Two similarly-named images are both intentionally in use, not a duplicate bug:
- `assets/images/attraction-hero.avif` — older daylight balcony/coffee shot, used on
  the **homepage** teaser section and in the **gallery**
- `assets/images/attraction-hero-night.avif` — newer aerial night shot, used as the
  **Attraction page's own** page-hero background
- `assets/images/attractions/golden-mount-dusk.avif` exists but is currently
  **unused** (the alternate of a pair where the user said "pick whichever fits" —
  `golden-mount-aerial.avif` was chosen instead). Fine to leave, or ask the user
  before removing.

## Critical technical gotchas (learned the hard way this project)

1. **CSS custom properties + relative `url()` = broken paths.** If a CSS custom
   property (e.g. `--bg-photo`) holds a `url(...)` value and gets *consumed* inside
   an external stylesheet, the browser resolves that URL **relative to the
   stylesheet's folder**, not the HTML page. This silently 404s
   (`css/assets/images/...` instead of `assets/images/...`). Fix already applied:
   page-hero/hero background images are set as a **full inline `style="background-image:
   linear-gradient(...), url('assets/images/...')"` directly on the element**, not
   via a CSS custom property consumed in `style.css`. If you add a new photo-hero
   section, follow that same inline pattern — don't reintroduce the custom-property version.

2. **All asset paths are relative** (`assets/...`, not `/assets/...`) — deliberately
   converted so the site works from any subfolder depth (GitHub Pages *project*
   sites like `user.github.io/repo/`, not just root-served hosts). Keep new
   references relative too.

3. **Cache-busting query params on CSS/JS.** Both are currently
   `css/style.css?v=4` and `js/main.js?v=3` on every page. The local dev server /
   browser aggressively caches these files across edits. **Whenever you edit
   `css/style.css` or `js/main.js`, bump the `?v=N` on every HTML page** (a
   quick `sed` across `*.html` works) or changes may not visibly apply during
   testing, leading you to falsely conclude something is broken.

4. **PowerShell 5.1 + `gh.exe` stderr quirk.** Running `gh` commands via the
   PowerShell tool often surfaces a `NativeCommandError` even when the command
   fully succeeded — PowerShell wraps native stderr output as an error record.
   Don't trust the red error text alone; check the actual output content and/or
   verify independently (`git log`, `git remote -v`, `gh api ...`) before
   concluding a git/gh operation failed.

5. **Browser preview pane flakiness.** The `computer{action:"screenshot"}` tool in
   this environment times out unpredictably (sometimes for a whole session). When
   it does, don't spin on retries — fall back to `javascript_tool` checks
   (`img.complete`/`naturalWidth`, `getComputedStyle`, DOM text) and `curl`/`fetch`
   against the local server to verify correctness without a visual screenshot.
   `zoom` sometimes succeeds when plain `screenshot` doesn't.

6. **gh CLI path.** GitHub CLI is installed at
   `C:\Program Files\GitHub CLI\gh.exe` but was not yet on PATH as of the last
   session (fresh terminal may fix it — try `gh` directly first; if "not found,"
   fall back to the full path).

## Local dev / verification

- `.claude/launch.json` defines a `static-site` config: `python -m http.server 8090`.
  Use `preview_start {name: "static-site"}` (Browser tool) rather than raw Bash to
  serve/preview.
- Pure static files — any change is live on refresh (mind the cache-busting note above).
- No test suite; verification has been manual via the Browser pane + JS console checks.

## Git / deploy status

- Git repo initialized, **first commit already made and pushed**.
- Remote: `https://github.com/PrincessBoonies/the-chedee.git` (**private** repo).
- Commit identity used: `Boonies <boon2you@gmail.com>` — set **per-commit** via
  `git -c user.name=... -c user.email=...`, not saved to global/local git config
  (none was configured before; don't assume it's set globally on future commits —
  either keep using `-c` flags or ask the user if they want it persisted).
- `.gitignore` excludes: `Pic from Chedee/` (raw photo/video originals — large,
  not needed by the live site, the optimized copies in `assets/` are what's
  committed), `backups/`, temp/scratch files, editor configs, OS junk.
- `backups/index.html.pre-video.bak` and `backups/style.css.pre-video.bak` exist
  locally (pre-hero-video snapshot) as a manual safety net — not committed, purely local.
- **Not yet deployed to a live URL.** Natural next step (offered, not yet done):
  connect the GitHub repo to Vercel for a live URL + auto-deploy on push.

## Other artifacts from this project

- A **shareholder-review mockup** was published as a Claude Artifact — a single
  self-contained HTML file (fonts + images base64-embedded, ~7MB) simulating all 5
  pages with client-side nav switching, for sharing with people who shouldn't get
  raw file access. **It does not auto-sync** — it's a frozen snapshot from when it
  was last published and is likely **stale** now (missing later changes like the
  attraction place-card modals and aerial Golden Mount photo). If the user wants
  shareholders to see the current state, it needs to be rebuilt from the real
  `assets/` files and republished (same artifact URL, so ask "update the mockup" —
  don't just recreate blind, check what it currently shows first).

## Image/video processing tools available in this environment

No system-wide `ffmpeg`/ImageMagick, but these work and were used extensively:
- `pip install pillow` — image resize/re-encode (including AVIF), already installed
- `pip install imageio-ffmpeg` — bundles a **portable ffmpeg binary** (no admin/system
  install needed); find its path via
  `python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"`. Used
  to transcode the hero video: source was a 24MB HEVC `.mp4` (poor browser support,
  had audio) → re-encoded to `assets/video/hero.mp4` (H.264, ~3.3MB, muted, no audio
  track) + `assets/video/hero.webm` (VP9, ~2.5MB) + an extracted poster frame.
- **No image-generation tool is available.** If a page needs a photo of something
  real (a specific landmark, a specific dish) and there's no real photo for it,
  say so plainly rather than fabricating/hallucinating one — this was raised
  explicitly by the user once already (street food section) and handled with an
  honest text-forward layout instead of a fake photo.
- Windows path quirk: Bash tool's `/tmp/...` maps to a real Windows path
  (`C:\Users\User\AppData\Local\Temp\...`) — Python's `open()` needs the Windows-style
  path, not the posix one, when called from these tools.

## User preferences (apply without being asked again)

- **Wants luxury, elegant, concise — explicitly not busy/cluttered.** Has twice
  asked to cut generic filler (an amenities grid with things like "Wi-Fi" as a
  headline feature; testimonials that read like generic AI reviews) rather than
  pad it out further.
- **Dislikes manufactured urgency/scarcity marketing** (e.g. "rooms are limited,
  book now!") — asked for it to be removed as feeling cheap/off-brand for this tone.
- Wants **real photos used wherever available**; okay with generated images in
  principle but understands none are available in this tool environment — prefers
  an honest text-led design over a fabricated photo.
- Appreciates being **asked clarifying questions before large redesigns**
  (nav restructuring, page deletions, tone changes) rather than guessing.
- Cares about **not shipping fake/misleading content** — e.g. wouldn't want a
  generated image passed off as a real, named public landmark.
- Reviews changes **visually in the browser pane**, not just by reading code — when
  verifying UI changes, actually load the page and check it, don't just claim success.

## Suggested next steps (for the new session to raise, not act on unprompted)

1. **Fill in placeholder content** (contact info, social links, room prices) before
   treating the site as launch-ready.
2. **Deploy** — connect the GitHub repo to Vercel (or similar) for a live URL.
3. **Refresh the shareholder mockup artifact** if the user wants to share the
   current state with anyone.
4. Consider whether `design-system/the-chedee/MASTER.md` should be updated or is
   fine left as historical reference (it's not load-bearing for the site itself).
