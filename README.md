# Cosmic Daily

Cosmic Daily displays NASA's Astronomy Picture of the Day using the public APOD API.

## Prerequisites

- Node.js 20 or newer.
- A GitHub account if you want to publish the site with GitHub Pages.
- A NASA API key from [api.nasa.gov](https://api.nasa.gov/). Cosmic Daily uses `DEMO_KEY` by default while developing.

## Run locally

```shell
npm install
npm run dev
```

Open the localhost URL shown by Vite, usually `http://localhost:5173`. Do not open `index.html` directly or use a live-preview extension; Vite needs to run the project server so the module system and environment variables work correctly.

To use your own key, copy `.env.example` to `.env` and set `VITE_NASA_API_KEY`, then stop and restart the Vite server. Vite only exposes variables beginning with `VITE_`. The real `.env` file is ignored by Git and must never be committed.

For this public NASA API, a frontend key is acceptable for learning and deployment. Sensitive or paid APIs should use a backend so the key stays private.

## Features

- Loads the current NASA Astronomy Picture of the Day.
- Supports images, direct videos, and YouTube videos.
- Lets you browse by date, move to the previous or next day, and jump to a random day.
- Saves favorites in the browser with `localStorage`.

The date picker covers NASA APOD entries from June 16, 1995 onward. Favorites stay in the browser that saved them.

## Project map

- `index.html` — page shell and Google Fonts.
- `src/main.js` — APOD fetch, rendering, navigation, and favorites.
- `src/style.css` — responsive forest-green visual design.
- `.env.example` — environment variable template.
- `vite.config.js` — GitHub Pages base path.
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow.

## Deploying to GitHub Pages

The included workflow follows the Vite GitHub Pages deployment process:

1. Make sure `vite.config.js` uses the exact repository slug in its `base` path.
2. Add the repository secret `VITE_NASA_API_KEY` at **Settings → Secrets and variables → Actions** if you are using a personal NASA key. `DEMO_KEY` works as the fallback.
3. Enable **Settings → Pages → GitHub Actions**.
4. Push the `main` branch. GitHub Actions will install dependencies, build `dist`, and deploy it.

For future changes:

```shell
git add .
git commit -m "describe what changed"
git push
```
