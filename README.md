Cosmic Daily

Cosmic daily is a website that shows you NASA’s astronomy picture of the day.

To use it you will need Node.js 20 or newer.
A GitHub account if you wish to publish your ow version of the site with Github pages.
A NASA API key that you can get for free.

To run it locally you will do this:

Npm install
Npm run dev

Open the localhost shown by Vite.

If you have your own API from NASA and wish to use it, you will copy .env.example to .env and set VITE_NASA_API_KEY, then stop and restart the Vite server.

What it does:
It load NASA’s Astronomy picture of the day.
It support Images and videos.
It lets you browse by date from June 16, 1995 onward.
And saves favorites in the browser with localStorage.

If you want to deploy it to Github Pages you will follow these steps:
Add the repository secret VITE_NASA_API_KEY at settings-secrets and variables-actions if you are using your own NASA API.
Enable settings-pages-github actions.
Push the main branch. Build list and deploy it.
