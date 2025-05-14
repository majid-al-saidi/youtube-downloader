# YouTube Downloader (Vue 3 + Hono + yt-dlp)

A simple, clean desktop-style YouTube downloader built with:

* ⚙️ **Backend**: [Hono](https://hono.dev) (Node.js), [yt-dlp](https://github.com/yt-dlp/yt-dlp)
* 🎨 **Frontend**: Vue 3 + Tailwind CSS
* 📦 **Bundle**: Electron-ready

---

## 📦 Features

* Paste a YouTube URL and fetch available video/audio formats
* Select resolution from a dropdown
* Download directly (no new tab)
* Displays video thumbnail, title, author
* Download history saved locally
* Electron-ready for desktop use

---

## 🚀 Getting Started

### 1. Install dependencies

From the root folder:

```bash
npm install
cd client && npm install
```

### 2. Run Dev Environment

From the root folder:

```bash
npm run dev
```

This starts both:

* Backend on [http://localhost:3000](http://localhost:3000)
* Frontend on [http://localhost:5173](http://localhost:5173)

---

## 🖥 Desktop App (Electron)

> Coming soon – run the app as a native desktop application with Electron.

```bash
npm run electron
```

---

## 📁 Project Structure

```
youtube-downloader/
├── client/          # Vue 3 frontend
│   └── src/
├── server.ts        # Hono backend entry
├── history.json     # Stores download logs
├── main.js          # Electron entry
├── package.json     # Project scripts
```

---

## ⚠️ Notes

* Make sure `yt-dlp` is installed globally or accessible in `PATH`
* For production, you can bundle the frontend and serve it from the backend
* CORS is enabled in development

---

## ✅ To-Do

* [x] Fetch & list video formats
* [x] Download with filename + resolution
* [x] Save download history
* [ ] Offline mode (bundle frontend in Electron)
* [ ] Cross-platform `.exe` build with `electron-builder`

---

## 🧑‍💻 Author

**Majid AlSaidi** – made with ❤️
