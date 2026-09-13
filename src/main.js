import './style.css'
import waterfallPhoto from './assets/waterfall.jpg'

document.body.style.setProperty('--waterfall-photo', `url("${waterfallPhoto}")`)

const form = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const searchText = searchInput.value.trim()
  if (!searchText) {
    searchInput.focus()
    return
  }

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`
  window.location.href = searchUrl
})
