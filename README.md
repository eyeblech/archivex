<div align="center">

# 🎬 ArchiveX

### A Netflix-style cinema showcase for your Internet Archive uploads

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)

**Point it at any Internet Archive account → get a beautiful, fully-featured movie site instantly.**

[Live Demo](https://archivex.vercel.app) · [Internet Archive](https://archive.org) · [Report Bug](https://github.com/eyeblech/archivex/issues)

</div>

---

## ✨ Features

- 🎥 **Netflix-style grid** — responsive card layout with smooth hover animations
- ▶️ **Custom video player** — built from scratch, no third-party player library
- ⌨️ **Full keyboard shortcuts** — Space, F, M, arrow keys, number scrubbing, speed control
- 📝 **Subtitle support** — auto-detects `.srt` / `.vtt` files from the archive item, CC picker in player
- 🔍 **Live search** — debounced search across your entire archive
- 📄 **Pagination** — handles archives of any size
- 🌐 **Zero backend** — pure API calls to archive.org, deploy anywhere
- ⚡ **ISR caching** — archive data cached at edge, fast everywhere
- 🎨 **Cinematic UI** — film grain, Bebas Neue, dark theme, smooth transitions
- 📱 **Fully responsive** — works on mobile, tablet, desktop

---

## 🖼️ Preview

| Home Grid | Movie Player |
|-----------|-------------|
| Netflix-style card grid with hover effects | Custom player with controls, speed, subtitles |

---

## 🚀 Quick Start — Use This as Your Own Archive Site

This project is a **template**. You can point it at **any Internet Archive account** in under 2 minutes.

### 1. Clone the repo

```bash
git clone https://github.com/eyeblech/archivex.git
cd archivex
npm install
```

### 2. Find your Archive.org uploader email

Go to any item you uploaded on archive.org, then run:

```bash
curl "https://archive.org/metadata/YOUR_ITEM_IDENTIFIER" | python3 -m json.tool | grep uploader
```

It will output something like:

```json
"uploader": "yourname@gmail.com"
```

### 3. Set your uploader

Open `src/lib/archive.ts` and change line 3:

```ts
// Before
const UPLOADER = "roarmdl12345@gmail.com";

// After — paste your own email
const UPLOADER = "your@email.com";
```

Also update the Archive.org profile link in `src/components/ui/Navbar.tsx`:

```tsx
// Change this URL to your own archive.org profile
href="https://archive.org/details/@YOUR_USERNAME"
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "my archive"
git push

# Then go to vercel.com → Import repo → Deploy
# No environment variables needed
```

---

## ⌨️ Player Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play / Pause |
| `←` / `→` | Seek -10s / +10s |
| `↑` / `↓` | Volume up / down |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `<` / `>` | Speed down / up |
| `0` – `9` | Jump to 0% – 90% of video |

---


## 🔧 Configuration Reference

All customization lives in **`src/lib/archive.ts`**:

```ts
const UPLOADER = "your@email.com";   // ← Your archive.org uploader email
```

| Function | What it does |
|----------|-------------|
| `fetchUploads(query, page, rows)` | Searches archive.org for your uploads |
| `fetchItemMetadata(id)` | Gets full metadata + file list for one item |
| `getBestVideoFile(files, id)` | Picks the best playable video format |
| `getSubtitleFiles(files, id)` | Extracts .srt / .vtt subtitle tracks |
| `getThumbUrl(id)` | Thumbnail image URL |
| `getEmbedUrl(id)` | Archive.org embed URL (fallback player) |

---

## 🌍 Pointing at Someone Else's Archive

You can showcase **any public archive.org account** — not just your own.

1. Find their archive page: `https://archive.org/details/@their_username`
2. Get one of their item identifiers from the URL
3. Run the curl command above to get their uploader email
4. Paste it into `src/lib/archive.ts`

Great for fan archives, film preservation projects, public domain collections, etc.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + inline styles + CSS variables |
| Styling | Tailwind CSS v3 + Google Fonts |
| Data | Internet Archive Search API (no key needed) |
| Player | Custom HTML5 `<video>` — no library |
| Deployment | Vercel (zero config) |

---

---

## 📄 License

MIT — do whatever you want with it. A star is appreciated. ⭐

---

<div align="center">
Built with ❤️ using Next.js + Internet Archive API
</div>
