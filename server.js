// Based on the concepts in Brad Schiff's tutorial "Dogs, JavaScript & An API: Fetch,
// Promises & Async Await" (LearnWebCode). See README.md for full credit.

const path = require('path')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000 // Azure App Service sets PORT

const DOG_API_BASE = 'https://dog.ceo/api'
const REQUEST_TIMEOUT_MS = 8000
const MAX_SLIDES = 50
const NAME_PATTERN = /^[a-z]+$/

app.disable('x-powered-by')

// Never cache API responses so every request is fresh
app.use('/api', (req, res, next) => {
	res.set('Cache-Control', 'no-store')
	next()
})

// Turn ['hound', 'afghan'] into 'Afghan Hound' and ['labrador'] into 'Labrador'
function formatBreedName(parts) {
	const ordered = parts.length === 2 ? [parts[1], parts[0]] : parts
	return ordered.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Dog CEO image URLs look like https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg
function extractBreedFromUrl(url) {
	const match = String(url).match(/\/breeds\/([a-zA-Z-]+)\//)
	if (!match || !match[1]) {
		return 'Information unavailable'
	}
	return formatBreedName(match[1].split('-'))
}

// Return a shuffled copy of an array (Fisher-Yates)
function shuffle(items) {
	const copy = items.slice()
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = copy[i]
		copy[i] = copy[j]
		copy[j] = temp
	}
	return copy
}

// Call the public Dog CEO API. fetch() returns a Promise and await pauses until it settles.
async function fetchDogApi(url) {
	const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

	// fetch only rejects on network failure, so check the HTTP status ourselves
	if (!response.ok) {
		throw new Error(`Upstream HTTP error: ${response.status}`)
	}

	const data = await response.json()
	if (data.status !== 'success') {
		throw new Error('Unexpected API response format.')
	}
	return data
}

// GET /api/dog returns one random dog
app.get('/api/dog', async (req, res) => {
	try {
		const data = await fetchDogApi(`${DOG_API_BASE}/breeds/image/random`)
		if (typeof data.message !== 'string') {
			throw new Error('Unexpected API response format.')
		}
		res.json({ imageUrl: data.message, breed: extractBreedFromUrl(data.message) })
	} catch (error) {
		console.error('Error retrieving dog image:', error.message)
		res.status(502).json({ error: 'Unable to retrieve a dog image.' })
	}
})

// GET /api/breeds returns every breed (and sub-breed) for the dropdown
app.get('/api/breeds', async (req, res) => {
	try {
		const data = await fetchDogApi(`${DOG_API_BASE}/breeds/list/all`)
		const breeds = []

		for (const [breed, subBreeds] of Object.entries(data.message)) {
			if (subBreeds.length === 0) {
				breeds.push({ value: breed, label: formatBreedName([breed]) })
			} else {
				for (const subBreed of subBreeds) {
					breeds.push({
						value: `${breed}/${subBreed}`,
						label: formatBreedName([breed, subBreed])
					})
				}
			}
		}
		res.json({ breeds: breeds })
	} catch (error) {
		console.error('Error retrieving breeds:', error.message)
		res.status(502).json({ error: 'Unable to retrieve the breed list.' })
	}
})

// GET /api/breed/labrador/images and /api/breed/hound/afghan/images return slideshow images
async function sendBreedImages(req, res) {
	const parts = [req.params.breed, req.params.subBreed].filter(Boolean)

	// Only letters are allowed, so nobody can change the upstream URL path
	if (!parts.every((part) => NAME_PATTERN.test(part))) {
		return res.status(400).json({ error: 'Invalid breed name.' })
	}

	try {
		const data = await fetchDogApi(`${DOG_API_BASE}/breed/${parts.join('/')}/images`)
		if (!Array.isArray(data.message)) {
			throw new Error('Unexpected API response format.')
		}
		const imageUrls = shuffle(data.message).slice(0, MAX_SLIDES)
		res.json({ breed: formatBreedName(parts), imageUrls: imageUrls })
	} catch (error) {
		console.error('Error retrieving breed images:', error.message)
		res.status(502).json({ error: 'Unable to retrieve images for that breed.' })
	}
}

app.get('/api/breed/:breed/images', sendBreedImages)
app.get('/api/breed/:breed/:subBreed/images', sendBreedImages)

// Health check for Azure
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Static front end
app.use(express.static(path.join(__dirname, 'public')))

// Only start listening when run directly, so the app can be imported for tests
if (require.main === module) {
	app.listen(port, () => console.log(`Server running on port ${port}`))
}

module.exports = app
