/* =========================================================================
   LIONS, TIGERS, AND BEARS, OH MY! — NODE.JS SERVER
   Express app that:
     1. Serves the static front end from /public
     2. Exposes GET /api/dog, which calls the public Dog CEO API from the
        server (using Node's built-in fetch) and returns trimmed JSON
     3. Exposes GET /health for Azure health checks

   Based on the educational concepts in Brad Schiff's tutorial
   "Dogs, JavaScript & An API 🐶 Fetch, Promises & Async Await".
   See README.md for full attribution.
   ========================================================================= */

const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000; // Azure App Service injects PORT.

const DOG_API_URL = "https://dog.ceo/api/breeds/image/random";
const REQUEST_TIMEOUT_MS = 8000;

app.disable("x-powered-by");

// ---------- Breed extraction ----------
// Dog CEO image URLs look like:
//   https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg
// The folder name encodes "breed-subbreed"; we reverse two-part names so
// "hound-afghan" reads naturally as "Afghan Hound".
function extractBreedFromUrl(url) {
  const match = String(url).match(/\/breeds\/([a-zA-Z-]+)\//);
  if (!match || !match[1]) return "Information unavailable";

  const parts = match[1].split("-");
  const ordered = parts.length === 2 ? [parts[1], parts[0]] : parts;
  return ordered.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ---------- API route ----------
app.get("/api/dog", async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    // fetch() returns a Promise; await pauses until the response arrives.
    const response = await fetch(DOG_API_URL, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    // fetch only rejects on network failure, so check HTTP status ourselves.
    if (!response.ok) {
      throw new Error(`Upstream HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "success" || typeof data.message !== "string") {
      throw new Error("Unexpected API response format.");
    }

    res.json({ imageUrl: data.message, breed: extractBreedFromUrl(data.message) });
  } catch (error) {
    console.error("Error retrieving dog image:", error.message);
    res.status(502).json({ error: "Unable to retrieve a dog image." });
  }
});

// ---------- Health check ----------
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---------- Static front end ----------
app.use(express.static(path.join(__dirname, "public")));

// Only start listening when run directly (keeps the app importable for tests).
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
