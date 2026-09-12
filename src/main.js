import './style.css'

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const API_URL = 'https://api.nasa.gov/planetary/apod'
const FIRST_APOD_DATE = '1995-06-16'

function getLocalDate() {
  const now = new Date()
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')
}

const today = getLocalDate()
let selectedDate = today
let currentData = null

document.querySelector('#app').innerHTML = `
  <main class="site-shell">
    <header class="site-header">
      <a class="brand" href="./" aria-label="Cosmic Daily home">
        <span class="brand-mark" aria-hidden="true">✦</span>
        <span>Cosmic Daily</span>
      </a>
      <p class="eyebrow">NASA / ASTRONOMY PICTURE OF THE DAY</p>
    </header>

    <section class="intro" aria-labelledby="page-title">
      <p class="kicker">YOUR DAILY WINDOW INTO THE UNIVERSE</p>
      <h1 id="page-title">Look up.<br /><span>Wonder more.</span></h1>
      <p class="intro-copy">A new corner of the cosmos, delivered by NASA every day.</p>
    </section>

    <section class="controls" aria-label="Explore astronomy pictures">
      <button class="icon-button" id="previous-day" type="button" aria-label="View previous day">←</button>
      <label class="date-control">
        <span>Explore a date</span>
        <input id="datepicker" type="date" min="${FIRST_APOD_DATE}" max="${today}" value="${today}" />
      </label>
      <button class="icon-button" id="next-day" type="button" aria-label="View next day" disabled>→</button>
      <button class="random-button" id="random-day" type="button">Surprise me <span aria-hidden="true">✧</span></button>
    </section>

    <section class="apod-card" aria-live="polite">
      <div class="apod-status" data-apod>
        <div class="loader" aria-label="Loading today's astronomy picture"></div>
        <p>Receiving today’s transmission…</p>
      </div>
    </section>

    <footer class="site-footer">
      <span>Powered by NASA APOD</span>
      <span class="footer-dot" aria-hidden="true">•</span>
      <span>Made for curious minds</span>
    </footer>
  </main>
`

const datePicker = document.querySelector('#datepicker')
const previousButton = document.querySelector('#previous-day')
const nextButton = document.querySelector('#next-day')
const randomButton = document.querySelector('#random-day')

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character])
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('cosmic-daily-favorites') || '[]')
  } catch {
    return []
  }
}

function isFavorite(date) {
  return getFavorites().includes(date)
}

function toggleFavorite(date) {
  const favorites = getFavorites()
  const nextFavorites = isFavorite(date)
    ? favorites.filter((favorite) => favorite !== date)
    : [...favorites, date]
  localStorage.setItem('cosmic-daily-favorites', JSON.stringify(nextFavorites))
  renderApod(currentData)
}

function renderMedia(data) {
  if (data.media_type === 'image') {
    return `
      <figure class="media-frame image-frame">
        <img src="${data.hdurl || data.url}" alt="${escapeHtml(data.title)}" />
        <figcaption>NASA image · ${escapeHtml(data.date)}</figcaption>
      </figure>
    `
  }

  if (data.url.includes('youtube') || data.url.includes('youtu.be')) {
    const embedUrl = data.url.includes('watch?v=')
      ? data.url.replace('watch?v=', 'embed/')
      : data.url.replace('youtu.be/', 'youtube.com/embed/')
    return `
      <div class="media-frame video-frame">
        <iframe src="${embedUrl}" title="${escapeHtml(data.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `
  }

  return `
    <div class="media-frame video-frame">
      <video src="${data.url}" controls></video>
    </div>
  `
}

function renderApod(data) {
  const favorite = isFavorite(data.date)
  document.querySelector('[data-apod]').innerHTML = `
    <div class="apod-heading">
      <div>
        <p class="date-label">${formatDate(data.date)}</p>
        <h2>${escapeHtml(data.title)}</h2>
      </div>
      <button class="favorite-button ${favorite ? 'is-favorite' : ''}" id="favorite-button" type="button" aria-pressed="${favorite}" aria-label="${favorite ? 'Remove from' : 'Save to'} favorites">
        <span aria-hidden="true">${favorite ? '★' : '☆'}</span> ${favorite ? 'Saved' : 'Save'}
      </button>
    </div>
    ${renderMedia(data)}
    <div class="apod-details">
      <div class="explanation-block">
        <p class="section-label">The story behind the sky</p>
        <p class="explanation">${escapeHtml(data.explanation)}</p>
      </div>
      <dl class="metadata">
        <div><dt>Captured</dt><dd>${escapeHtml(data.date)}</dd></div>
        <div><dt>Media</dt><dd>${escapeHtml(data.media_type)}</dd></div>
        ${data.copyright ? `<div><dt>Credit</dt><dd>${escapeHtml(data.copyright)}</dd></div>` : ''}
      </dl>
    </div>
    <a class="source-link" href="${data.url}" target="_blank" rel="noreferrer">View original transmission <span aria-hidden="true">↗</span></a>
  `

  document.querySelector('#favorite-button').addEventListener('click', () => toggleFavorite(data.date))
}

function showError(error) {
  document.querySelector('[data-apod]').innerHTML = `
    <div class="error-state">
      <span class="error-icon" aria-hidden="true">!</span>
      <p class="section-label">Transmission interrupted</p>
      <h2>We couldn’t reach the stars.</h2>
      <p>${escapeHtml(error.message)} Try again or choose another date.</p>
      <button class="retry-button" id="retry-button" type="button">Try again</button>
    </div>
  `
  document.querySelector('#retry-button').addEventListener('click', () => fetchApod(selectedDate))
}

function updateNavigation() {
  previousButton.disabled = selectedDate <= FIRST_APOD_DATE
  nextButton.disabled = selectedDate >= today
  datePicker.value = selectedDate
}

function fetchApod(date = selectedDate) {
  selectedDate = date
  updateNavigation()
  document.querySelector('[data-apod]').innerHTML = `
    <div class="loader" aria-label="Loading astronomy picture"></div>
    <p>Receiving the ${formatDate(date)} transmission…</p>
  `

  fetch(`${API_URL}?api_key=${API_KEY}&date=${date}`)
    .then((response) => {
      if (!response.ok) throw new Error(`NASA returned an error (${response.status}).`)
      return response.json()
    })
    .then((data) => {
      currentData = data
      renderApod(data)
    })
    .catch(showError)
}

datePicker.addEventListener('change', (event) => fetchApod(event.target.value))
previousButton.addEventListener('click', () => {
  const previousDate = new Date(`${selectedDate}T00:00:00Z`)
  previousDate.setUTCDate(previousDate.getUTCDate() - 1)
  fetchApod(previousDate.toISOString().split('T')[0])
})
nextButton.addEventListener('click', () => {
  const nextDate = new Date(`${selectedDate}T00:00:00Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  fetchApod(nextDate.toISOString().split('T')[0])
})
randomButton.addEventListener('click', () => {
  const firstDate = new Date(`${FIRST_APOD_DATE}T00:00:00Z`).getTime()
  const lastDate = new Date(`${today}T00:00:00Z`).getTime()
  const randomTime = firstDate + Math.random() * (lastDate - firstDate)
  fetchApod(new Date(randomTime).toISOString().split('T')[0])
})

fetchApod()
