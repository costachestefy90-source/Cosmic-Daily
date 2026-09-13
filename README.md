# Cosmic Launchpad

I made Cosmic Launchpad as a small start page for myself. I can search the web from the middle of the page and I can open my bookmarks underneath it.

I took the waterfall photo in the background myself.

## I ran it locally

I used Node.js 20 or newer. In the project folder I ran:

```text
npm install
npm run dev
```

I opened the localhost address that Vite showed me.

## I published it

I kept the GitHub Pages workflow in `.github/workflows/deploy.yml`. When I push the `main` branch, GitHub builds the page and publishes the `dist` folder.

I changed the Vite base path to `/Cosmic-Launchpad/` because I renamed the repository.

## I kept the project small

I used one HTML page, one stylesheet, one JavaScript file, and one photo. I did not need an API key for this version.
