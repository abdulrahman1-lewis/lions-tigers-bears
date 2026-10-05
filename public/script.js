// AI use: Generated with Claude (Anthropic), then reviewed and tested by the author.
// Based on the concepts in Brad Schiff's tutorial "Dogs, JavaScript & An API: Fetch,
// Promises & Async Await" (LearnWebCode). See README.md for full credit.

// ---------- Constants ----------
const DOG_API_URL = '/api/dog'
const BREEDS_API_URL = '/api/breeds'
const SLIDE_DELAY_MS = 3000

// ---------- Element references ----------
const breedSelect = document.getElementById('breedSelect')
const dogImage = document.getElementById('dogImage')
const loadingMessage = document.getElementById('loadingMessage')
const errorMessage = document.getElementById('errorMessage')
const breedName = document.getElementById('breedName')
const slideStatus = document.getElementById('slideStatus')

const previousButton = document.getElementById('previousButton')
const playButton = document.getElementById('playButton')
const nextButton = document.getElementById('nextButton')
const randomButton = document.getElementById('randomButton')

// ---------- Slideshow state ----------
let slides = [] // image URLs for the current slideshow
let slideIndex = 0 // the slide on screen
let slideTimer = null // set while the slideshow is playing
let currentBreedName = 'Information unavailable'

// ---------- UI state helpers ----------
function showLoading() {
	loadingMessage.hidden = false
	errorMessage.hidden = true
	dogImage.hidden = true
}

function showImage() {
	loadingMessage.hidden = true
	errorMessage.hidden = true
	dogImage.hidden = false
}

function showError() {
	loadingMessage.hidden = true
	errorMessage.hidden = false
	dogImage.hidden = true
}

// Enable or disable the controls and update the "Image X of Y" text
function updateControls() {
	const hasSeveralSlides = slides.length > 1
	previousButton.disabled = !hasSeveralSlides
	nextButton.disabled = !hasSeveralSlides
	playButton.disabled = !hasSeveralSlides
	slideStatus.textContent = `Image ${slides.length === 0 ? 0 : slideIndex + 1} of ${slides.length}`
}

// ---------- Slideshow ----------
function displaySlide(index) {
	slideIndex = index
	dogImage.src = slides[slideIndex]
	breedName.textContent = currentBreedName
	showImage()
	updateControls()
}

function stopSlideshow() {
	clearInterval(slideTimer)
	slideTimer = null
	playButton.textContent = 'Play'
}

function startSlideshow() {
	stopSlideshow()
	if (slides.length < 2) {
		return
	}
	slideTimer = setInterval(() => {
		displaySlide((slideIndex + 1) % slides.length)
	}, SLIDE_DELAY_MS)
	playButton.textContent = 'Pause'
}

// Move forward (+1) or backward (-1) and wrap around at the ends
function moveSlide(step) {
	if (slides.length < 2) {
		return
	}
	const wasPlaying = slideTimer !== null
	displaySlide((slideIndex + step + slides.length) % slides.length)
	if (wasPlaying) {
		startSlideshow() // restart the timer so the slide is not skipped right away
	}
}

// ---------- fetchJson() ----------
// fetch() sends an HTTP GET request to our Node API and returns a Promise. async/await pauses
// this function until the Promise settles, so the code reads top to bottom. The page stays
// responsive and is updated when the data arrives, which is the AJAX idea.
async function fetchJson(url) {
	const response = await fetch(url)

	// fetch only rejects on a network failure, so check the HTTP status ourselves
	if (!response.ok) {
		throw new Error(`HTTP error: ${response.status}`)
	}

	// .json() parses the response text into a JavaScript object
	return response.json()
}

// ---------- Load the breed list into the dropdown ----------
async function loadBreeds() {
	try {
		const data = await fetchJson(BREEDS_API_URL)

		breedSelect.innerHTML = ''
		const placeholder = document.createElement('option')
		placeholder.value = ''
		placeholder.textContent = 'Select a breed'
		breedSelect.appendChild(placeholder)

		for (const breed of data.breeds) {
			const option = document.createElement('option')
			option.value = breed.value
			option.textContent = breed.label
			breedSelect.appendChild(option)
		}
	} catch (error) {
		console.error('Error retrieving breeds:', error)
		breedSelect.innerHTML = '<option value="">Breeds unavailable</option>'
	}
}

// ---------- Load a slideshow for the selected breed ----------
async function loadBreedSlideshow(breedValue) {
	if (breedValue === '') {
		return
	}

	stopSlideshow()
	showLoading()

	try {
		const data = await fetchJson(`/api/breed/${breedValue}/images`)

		if (!Array.isArray(data.imageUrls) || data.imageUrls.length === 0) {
			throw new Error('No images were returned for this breed.')
		}

		slides = data.imageUrls
		currentBreedName = data.breed
		displaySlide(0)
		startSlideshow()
	} catch (error) {
		console.error('Error retrieving breed images:', error)
		showError()
		updateControls()
	}
}

// ---------- Show one random dog ----------
async function loadRandomDog() {
	stopSlideshow()
	breedSelect.value = ''
	showLoading()

	try {
		const data = await fetchJson(DOG_API_URL)

		if (!data.imageUrl) {
			throw new Error('Unexpected API response format.')
		}

		slides = [data.imageUrl]
		currentBreedName = data.breed
		displaySlide(0)
		playButton.textContent = 'Play'
	} catch (error) {
		console.error('Error retrieving dog image:', error)
		showError()
		updateControls()
	}
}

// ---------- Event listeners ----------
breedSelect.addEventListener('change', () => loadBreedSlideshow(breedSelect.value))
previousButton.addEventListener('click', () => moveSlide(-1))
nextButton.addEventListener('click', () => moveSlide(1))
randomButton.addEventListener('click', loadRandomDog)

playButton.addEventListener('click', () => {
	if (slideTimer === null) {
		startSlideshow()
	} else {
		stopSlideshow()
	}
})

// If a photo fails to load, show the error message
dogImage.addEventListener('error', showError)

// ---------- Initial load ----------
window.addEventListener('DOMContentLoaded', () => {
	updateControls()
	loadBreeds()
	loadRandomDog()
})
