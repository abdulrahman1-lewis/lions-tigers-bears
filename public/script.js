/* =========================================================================
   LIONS, TIGERS, AND BEARS, OH MY! — SCRIPT
   Demonstrates: Fetch API, Promises, async/await, JSON processing,
   dynamic DOM updates (AJAX), and error handling.

   This version calls our own Node.js/Express endpoint (/api/dog), which in
   turn calls the public Dog CEO API on the server.

   Based on the educational concepts taught in Brad Schiff's tutorial
   "Dogs, JavaScript & An API 🐶 Fetch, Promises & Async Await".
   See README.md for full attribution.
   ========================================================================= */

// ---------- Element references ----------
const dogImage = document.getElementById("dogImage");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const breedName = document.getElementById("breedName");
const historyStatus = document.getElementById("historyStatus");

const newDogButton = document.getElementById("newDogButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

// Our Node.js endpoint. It proxies the public Dog CEO API and returns
// { imageUrl, breed }. See server.js and README.md.
const DOG_API_URL = "/api/dog";

// ---------- Image history ----------
// A simple array keeps track of every image ({ imageUrl, breed }) retrieved during this
// session so the Previous/Next buttons can move through past results
// without making a new API request every time.
let imageHistory = [];
let historyIndex = -1; // Points at the image currently on screen.

// ---------- UI state helpers ----------
function showLoading() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
  dogImage.hidden = true;
}

function showImage() {
  loadingMessage.hidden = true;
  errorMessage.hidden = true;
  dogImage.hidden = false;
}

function showError() {
  loadingMessage.hidden = true;
  errorMessage.hidden = false;
  dogImage.hidden = true;
}

// Enable/disable Previous and Next based on where we are in the history.
function updateNavButtons() {
  previousButton.disabled = historyIndex <= 0;
  nextButton.disabled = historyIndex >= imageHistory.length - 1;
  historyStatus.textContent = `Image ${imageHistory.length === 0 ? 0 : historyIndex + 1} of ${imageHistory.length}`;
}

// ---------- Display a specific image from history ----------
function displayImageAt(index) {
  const item = imageHistory[index];
  if (!item) return;

  dogImage.src = item.imageUrl;
  breedName.textContent = item.breed || "Information unavailable";
  showImage();

  historyIndex = index;
  updateNavButtons();
}

// ---------- getDogImage() ----------
// This function demonstrates the core concepts required by the assignment:
//
// 1. fetch() sends an HTTP GET request to our Node API and returns a
//    Promise that resolves once the server responds.
// 2. async/await lets us "pause" execution inside this function until
//    each Promise settles, so the code reads top-to-bottom like
//    synchronous code instead of using nested .then() callbacks.
// 3. Because the request happens in the background, the rest of the page
//    stays interactive and no full page reload is needed — this is the
//    AJAX concept: talking to a web service asynchronously and updating
//    the page's content dynamically once the data arrives.
async function getDogImage() {
  showLoading();

  try {
    // Send the HTTP request and wait for the response.
    const response = await fetch(DOG_API_URL);

    // Fetch only rejects on a network failure, not on HTTP error status
    // codes (like 404 or 500), so we check response.ok ourselves.
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    // The response body is read as text over the network; .json() parses
    // that text into a JavaScript object we can work with.
    const data = await response.json();

    // Our Node API returns JSON shaped like:
    // { "imageUrl": "https://images.dog.ceo/breeds/.../image.jpg", "breed": "Afghan Hound" }
    if (!data.imageUrl) {
      throw new Error("Unexpected API response format.");
    }

    // Save the new image in the history array, then display it.
    imageHistory.push({ imageUrl: data.imageUrl, breed: data.breed });
    displayImageAt(imageHistory.length - 1);
  } catch (error) {
    // Handles network errors, HTTP errors, and invalid JSON/response shape.
    console.error("Error retrieving dog image:", error);
    showError();
    updateNavButtons();
  }
}

// ---------- Button event listeners ----------

// "Get New Dog" always requests a fresh image from the API.
newDogButton.addEventListener("click", getDogImage);

// "Previous" moves backward through the history array without calling
// the API again, and never lets the index go below 0.
previousButton.addEventListener("click", () => {
  if (historyIndex > 0) {
    displayImageAt(historyIndex - 1);
  }
});

// "Next" moves forward through history if a later image already exists;
// otherwise it fetches a brand new image from the API.
nextButton.addEventListener("click", () => {
  if (historyIndex < imageHistory.length - 1) {
    displayImageAt(historyIndex + 1);
  } else {
    getDogImage();
  }
});

// ---------- Initial load ----------
// Retrieve the first dog image as soon as the page finishes loading.
window.addEventListener("DOMContentLoaded", () => {
  updateNavButtons();
  getDogImage();
});
