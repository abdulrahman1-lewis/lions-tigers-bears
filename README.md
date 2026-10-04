# Lions, Tigers, and Bears, Oh My!

## Description

This application demonstrates JavaScript API integration by retrieving dog
images from a public API using the Fetch API, JSON parsing, Promises,
async/await, and dynamic DOM updates. The project is now a **Node.js (Express)
application**: the browser calls the app's own `/api/dog` endpoint, and the
Node server calls the public Dog CEO API and returns the image URL and breed
as JSON. Clicking "Get New Dog" (or "Next," once the history is exhausted)
displays a new image without reloading the page. "Previous" and "Next" step
through an in-memory history of images retrieved during the session.

## Original Tutorial / Attribution

This project was developed as part of a university assignment based on the
tutorial **"Dogs, JavaScript & An API 🐶 Fetch, Promises & Async Await"** by
**Brad Schiff**.

Tutorial link: https://www.youtube.com/watch?v=AVmGmLFcukM

Brad Schiff is credited as the original tutorial author. This project
implements the same educational concepts taught in that tutorial (Fetch,
Promises, async/await, JSON, dynamic DOM updates) as a course assignment. It
is **not** presented as Brad Schiff's original work — see `LICENSE` for
further licensing notes.

## Technologies

- Node.js (v20 or later) and Express
- HTML5, CSS3, JavaScript
- Fetch API (browser and Node's built-in `fetch`)
- JSON, Promises, Async/Await, AJAX concepts
- Public Dog API
- GitHub Actions + Azure App Service (CI/CD)

## API

**Dog CEO API** — https://dog.ceo/dog-api/

Upstream endpoint (called by the Node server):
```
https://dog.ceo/api/breeds/image/random
```

This app's own endpoints:

| Route | Description |
|-------|-------------|
| `GET /api/dog` | Returns `{ "imageUrl": "...", "breed": "..." }`; `502` with `{ "error": "..." }` if the upstream API fails |
| `GET /health` | Returns `{ "status": "ok" }` |

## Features

- Random dog image retrieval through a Node.js/Express API route
- JSON processing and async/await on both client and server
- Image history (Previous/Next)
- Breed extraction from the returned image URL (server-side)
- Error handling for network, timeout, and HTTP failures
- Responsive interface
- Automated deployment to Azure via GitHub Actions

## Project Structure

```
lions-tigers-bears/
│
├── .github/workflows/azure-deploy.yml
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── LICENSE
```

## How to Run Locally

1. Install [Node.js](https://nodejs.org/) v20 or later.
2. Download or clone this project and open the folder in a terminal.
3. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```
4. Visit http://localhost:3000. An internet connection is required, since the
   server calls the live Dog CEO API.

## Azure Deployment (App Service + GitHub Actions)

1. Push this project to a GitHub repository (branch `main`).
2. In the Azure Portal, create a **Web App**: Publish = Code, Runtime stack =
   Node 22 LTS, Operating System = Linux.
3. In the Web App, open **Overview → Get publish profile** and download the
   file. Under **Settings → Configuration → General settings**, set the
   Startup Command to `npm start` and set **SCM Basic Auth Publishing
   Credentials** to On (needed for publish-profile deployment).
4. In GitHub, go to **Settings → Secrets and variables → Actions** and create
   the secret `AZURE_WEBAPP_PUBLISH_PROFILE` containing the full contents of
   the downloaded file.
5. Edit `AZURE_WEBAPP_NAME` in `.github/workflows/azure-deploy.yml` to match
   your Web App name, then commit and push. The workflow builds and deploys
   automatically on each push.

**Live Website:** [AZURE HTTPS URL]

## Author

Abdul Rahman