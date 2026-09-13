# Cosmic Launchpad

I made Cosmic Launchpad as a small start page for myself. I can search the web from the middle of the page and I can open my bookmarks underneath it.

I took the waterfall photo in the background myself.

I made the first YouTube bookmark open YouTube and the second one open my subscriptions. I added Wikipedia because I use it when I want a quick place to look something up.

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

I published my site at https://costachestefy90-source.github.io/Cosmic-Launchpad/.

## I kept the project small

I used one HTML page, one stylesheet, one JavaScript file, and one photo. I did not need an API key for this version.

I tested the production build before I pushed it.
