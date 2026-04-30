<div align="center">

# 🎬 ArchiveX


![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)


[Live Demo](https://archivex-ivory.vercel.app/)

</div>

---

## 🚀 Quick Start — Use This as Your Own Archive Site

This project is a **template**. You can point it at **any Internet Archive account** 

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

