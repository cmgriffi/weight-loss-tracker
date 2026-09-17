# Weight Loss Tracker (static)

Dark-mode nutrition / weight dashboard for Chris. Pure static HTML/CSS/JS + Chart.js CDN. No build step.

## Files

- `index.html` — layout
- `styles.css` — dark phone UI (~390px)
- `app.js` — day navigation + Chart.js charts
- `data.js` — targets + seeded days (Sep 10–16, 2026)

## Open

**Option A — file URL**

```bash
xdg-open /home/box/agent-data/agents/f5185a90-8073-40d9-b14a-3277e9c29e7b/tracker/index.html
```

Or open that path in a browser (`file://…/tracker/index.html`). Chart.js loads from CDN, so you need network access.

**Option B — local server**

```bash
cd /home/box/agent-data/agents/f5185a90-8073-40d9-b14a-3277e9c29e7b/tracker
python3 -m http.server 8765
```

Then visit `http://127.0.0.1:8765/`.

## Data notes

- Targets: 2000 kcal, 160 g protein; fat soft ~70 g; sugar soft cap ~50 g (bar fill).
- Default day: **2026-09-16** — weight **169.7**, calories **2050**, protein **58 g**, fat ~90, sugar ~40.
- If calories exceed target, the ring shows **“X over”** (orange) instead of remaining.
