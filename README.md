# Cosmic Daily

Cosmic Daily displays NASA's Astronomy Picture of the Day using the public APOD API.

## Run locally

```shell
npm install
npm run dev
```

Open the localhost URL shown by Vite. The project uses NASA's `DEMO_KEY` by default. To use your own key, copy `.env.example` to `.env` and set `VITE_NASA_API_KEY`, then restart the Vite server.

## Features

- Loads the current NASA Astronomy Picture of the Day.
- Supports images, direct videos, and YouTube videos.
- Lets you browse by date, move to the previous or next day, and jump to a random day.
- Saves favorites in the browser with `localStorage`.

## Project map

- `index.html` — page shell and Google Fonts.
- `src/main.js` — APOD fetch, rendering, navigation, and favorites.
- `src/style.css` — responsive forest-green visual design.
- `.env.example` — environment variable template.
- `vite.config.js` — GitHub Pages base path.
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow.

## Deploying to GitHub Pages

Set the repository secret `VITE_NASA_API_KEY` in GitHub at **Settings → Secrets and variables → Actions**. Then enable **Settings → Pages → GitHub Actions**. Pushing to `main` will build and deploy the site.
