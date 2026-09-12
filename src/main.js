import './style.css'

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const API_URL = 'https://api.nasa.gov/planetary/apod'
const FIRST_APOD_DATE = '1995-06-16'
const APOD_CACHE_PREFIX = 'cosmic-daily-apod:'
const APOD_CACHE_MAX_AGE = 10 * 60 * 1000
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function getLocalDate() {
  const now = new Date()
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')
}

const today = getLocalDate()
let selectedDate = today
let requestNumber = 0
let activeController = null
let transitionTimer = null
const apodCache = new Map()

document.querySelector('#app').innerHTML = `
  <main class="site-shell">
    <header class="site-header">
      <a class="brand" href="./" aria-label="Cosmic Daily home">
        <span>Cosmic Daily</span>
      </a>
    </header>

    <section class="controls" aria-label="Explore astronomy pictures">
      <button class="icon-button" id="previous-day" type="button" aria-label="View previous day">←</button>
      <div class="date-control">
        <span>Explore a date</span>
        <button class="date-picker-toggle" id="datepicker" type="button" aria-label="Explore a date: ${formatDate(today)}" aria-haspopup="dialog" aria-expanded="false" aria-controls="calendar-popover">
          <span class="date-value">${formatDate(today)}</span>
          <span class="calendar-icon" aria-hidden="true">▦</span>
        </button>
        <div class="calendar-popover" id="calendar-popover" role="dialog" aria-label="Choose an astronomy picture date" hidden>
          <div class="calendar-header">
            <button class="calendar-nav" id="previous-month" type="button" aria-label="Previous month">←</button>
            <span id="calendar-month"></span>
            <button class="calendar-nav" id="next-month" type="button" aria-label="Next month">→</button>
          </div>
          <div class="calendar-weekdays" aria-hidden="true">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div class="calendar-days" id="calendar-days"></div>
        </div>
      </div>
      <button class="icon-button" id="next-day" type="button" aria-label="View next day" disabled>→</button>
      <button class="random-button" id="random-day" type="button">Surprise me</button>
    </section>

    <section class="apod-card" aria-live="polite">
      <div class="apod-status" data-apod>
        <div class="loader" role="status" aria-label="Loading today's astronomy picture"></div>
      </div>
    </section>

    <footer class="site-footer">
      <span>Powered by NASA APOD</span>
    </footer>
  </main>
`

const datePicker = document.querySelector('#datepicker')
const dateValue = document.querySelector('.date-value')
const calendarPopover = document.querySelector('#calendar-popover')
const calendarMonth = document.querySelector('#calendar-month')
const calendarDays = document.querySelector('#calendar-days')
const previousMonthButton = document.querySelector('#previous-month')
const nextMonthButton = document.querySelector('#next-month')
const apodCard = document.querySelector('.apod-card')
const previousButton = document.querySelector('#previous-day')
const nextButton = document.querySelector('#next-day')
const randomButton = document.querySelector('#random-day')
let visibleMonth = new Date(`${today}T00:00:00Z`)
const firstApodDate = new Date(`${FIRST_APOD_DATE}T00:00:00Z`)
const todayDate = new Date(`${today}T00:00:00Z`)
const firstApodMonth = new Date(Date.UTC(firstApodDate.getUTCFullYear(), firstApodDate.getUTCMonth(), 1))
const lastApodMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1))

function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function formatMonth(date) {
  return monthFormatter.format(date)
}

function dateString(year, month, day) {
  return [year, month + 1, day]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')
}

function readCachedApod(date) {
  if (apodCache.has(date)) return apodCache.get(date)

  try {
    const saved = JSON.parse(sessionStorage.getItem(`${APOD_CACHE_PREFIX}${date}`))
    if (!saved || Date.now() - saved.savedAt > APOD_CACHE_MAX_AGE) return null
    if (saved.data?.date !== date || !saved.data?.title || !saved.data?.url) return null
    apodCache.set(date, saved.data)
    return saved.data
  } catch {
    return null
  }
}

function cacheApod(data) {
  if (!data?.date) return
  apodCache.set(data.date, data)

  try {
    sessionStorage.setItem(`${APOD_CACHE_PREFIX}${data.date}`, JSON.stringify({
      savedAt: Date.now(),
      data,
    }))
  } catch {
    // Private browsing can disable sessionStorage; the in-memory cache still works.
  }
}

function renderCalendar() {
  const year = visibleMonth.getUTCFullYear()
  const month = visibleMonth.getUTCMonth()
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const monthStart = new Date(Date.UTC(year, month, 1))
  const monthEnd = new Date(Date.UTC(year, month + 1, 0))

  calendarMonth.textContent = formatMonth(monthStart)
  previousMonthButton.disabled = monthStart <= firstApodMonth
  nextMonthButton.disabled = monthEnd >= lastApodMonth

  const emptyDays = Array.from(
    { length: firstDay },
    () => '<span class="calendar-empty" aria-hidden="true"></span>',
  )
  const days = []

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = dateString(year, month, day)
    const isSelected = date === selectedDate
    const isDisabled = date < FIRST_APOD_DATE || date > today
    days.push(`
      <button class="calendar-day${isSelected ? ' is-selected' : ''}" type="button" data-date="${date}"${isDisabled ? ' disabled' : ''} aria-label="${formatDate(date)}"${isSelected ? ' aria-current="date"' : ''}>${day}</button>
    `)
  }

  calendarDays.innerHTML = [...emptyDays, ...days].join('')
}

function closeCalendar(restoreFocus = false) {
  const wasOpen = !calendarPopover.hidden
  calendarPopover.hidden = true
  datePicker.setAttribute('aria-expanded', 'false')
  if (restoreFocus && wasOpen) datePicker.focus()
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

function renderMedia(data) {
  if (data.media_type === 'image') {
    const imageUrl = data.url || data.hdurl
    return `
      <figure class="media-frame image-frame">
        <img class="interactive-photo" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.title)}" loading="eager" decoding="async" fetchpriority="high" draggable="false" />
      </figure>
    `
  }

  if (data.url.includes('youtube') || data.url.includes('youtu.be')) {
    const embedUrl = data.url.includes('watch?v=')
      ? data.url.replace('watch?v=', 'embed/')
      : data.url.replace('youtu.be/', 'youtube.com/embed/')
    return `
      <div class="media-frame video-frame">
        <iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(data.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `
  }

  return `
    <div class="media-frame video-frame">
      <video src="${escapeHtml(data.url)}" controls></video>
    </div>
  `
}

function renderApod(data) {
  apodCard.setAttribute('aria-busy', 'false')
  document.querySelector('[data-apod]').innerHTML = `
    <div class="apod-content apod-content--reveal">
      <div class="apod-heading">
        <div>
          <p class="date-label">${formatDate(data.date)}</p>
          <h2>${escapeHtml(data.title)}</h2>
        </div>
      </div>
      ${renderMedia(data)}
      <div class="apod-details">
        <dl class="metadata">
          <div><dt>Captured</dt><dd>${formatDate(data.date)}</dd></div>
        </dl>
      </div>
      <a class="source-link" href="${escapeHtml(data.url)}" target="_blank" rel="noreferrer">View original transmission <span aria-hidden="true">↗</span></a>
    </div>
  `

  setupPhotoMotion()
}

function updateNavigation() {
  previousButton.disabled = selectedDate <= FIRST_APOD_DATE
  nextButton.disabled = selectedDate >= today
  dateValue.textContent = formatDate(selectedDate)
  datePicker.setAttribute('aria-label', `Explore a date: ${formatDate(selectedDate)}`)
  visibleMonth = new Date(`${selectedDate}T00:00:00Z`)
  if (!calendarPopover.hidden) renderCalendar()
}

function showLoading() {
  apodCard.setAttribute('aria-busy', 'true')
  document.querySelector('[data-apod]').innerHTML = `
    <div class="loader" role="status" aria-label="Loading astronomy picture"></div>
  `
}

function fetchApod(date = selectedDate) {
  selectedDate = date
  updateNavigation()
  const currentRequest = ++requestNumber
  const apodArea = document.querySelector('[data-apod]')
  const oldContent = apodArea.querySelector('.apod-content')
  const cachedData = readCachedApod(date)

  activeController?.abort()
  if (transitionTimer) window.clearTimeout(transitionTimer)

  const startRequest = () => {
    if (currentRequest !== requestNumber) return
    if (cachedData) {
      renderApod(cachedData)
      return
    }

    showLoading()
    const requestController = new AbortController()
    activeController = requestController

    const requestUrl = new URL(API_URL)
    requestUrl.searchParams.set('api_key', API_KEY)
    requestUrl.searchParams.set('date', date)

    fetch(requestUrl, { signal: requestController.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`NASA returned an error (${response.status}).`)
        return response.json()
      })
      .then((data) => {
        if (currentRequest !== requestNumber) return
        cacheApod(data)
        renderApod(data)
      })
      .catch(() => {
        // Keep the loading state quiet; the next navigation can request it again.
      })
  }

  if (oldContent) {
    oldContent.classList.add('apod-content--leaving')
    transitionTimer = window.setTimeout(() => {
      transitionTimer = null
      startRequest()
    }, 180)
  } else {
    startRequest()
  }
}

function setupPhotoMotion() {
  const frame = document.querySelector('.image-frame')
  const photo = document.querySelector('.interactive-photo')
  if (!frame || !photo) return

  let dragging = false
  let startX = 0
  let startY = 0
  let tiltY = 0
  let tiltX = 0
  let paintFrame = null

  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value))
  const updatePhoto = () => {
    if (paintFrame) return
    paintFrame = window.requestAnimationFrame(() => {
      photo.style.setProperty('--photo-rotate-y', `${tiltY}deg`)
      photo.style.setProperty('--photo-rotate-x', `${tiltX}deg`)
      paintFrame = null
    })
  }

  const resetPhoto = (event) => {
    if (!dragging) return
    dragging = false
    if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId)
    frame.classList.remove('is-dragging')
    tiltY = 0
    tiltX = 0
    updatePhoto()
  }

  frame.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    dragging = true
    startX = event.clientX
    startY = event.clientY
    frame.setPointerCapture(event.pointerId)
    frame.classList.add('is-dragging')
  })

  frame.addEventListener('pointermove', (event) => {
    if (!dragging) return
    tiltY = clamp((event.clientX - startX) * 0.16, 8)
    tiltX = clamp((event.clientY - startY) * -0.12, 6)
    updatePhoto()
  })

  frame.addEventListener('pointerup', resetPhoto)
  frame.addEventListener('pointercancel', resetPhoto)
  frame.addEventListener('lostpointercapture', () => {
    if (!dragging) return
    dragging = false
    frame.classList.remove('is-dragging')
    tiltY = 0
    tiltX = 0
    updatePhoto()
  })
}

datePicker.addEventListener('click', () => {
  const opening = calendarPopover.hidden
  if (opening) {
    visibleMonth = new Date(`${selectedDate}T00:00:00Z`)
    renderCalendar()
  }
  calendarPopover.hidden = !opening
  datePicker.setAttribute('aria-expanded', String(opening))
})
previousMonthButton.addEventListener('click', () => {
  visibleMonth = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() - 1, 1))
  renderCalendar()
})
nextMonthButton.addEventListener('click', () => {
  visibleMonth = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 1))
  renderCalendar()
})
calendarDays.addEventListener('click', (event) => {
  const dayButton = event.target.closest('[data-date]')
  if (!dayButton || dayButton.disabled) return
  closeCalendar(true)
  fetchApod(dayButton.dataset.date)
})
document.addEventListener('click', (event) => {
  if (!event.target.closest('.date-control')) closeCalendar()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !calendarPopover.hidden) closeCalendar(true)
})
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

renderCalendar()
fetchApod()
