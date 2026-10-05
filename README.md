# Lions, Tigers, and Bears, Oh My!

@author Abdul Rahman

## Description

A dog breed slideshow. The user chooses a breed from a dropdown list and a slideshow of that
breed's photos plays, with Previous, Next, and Play/Pause buttons and a Random Dog button.
The project is a **Node.js (Express) application**: the browser calls the app's own API
routes, and the Node server calls the public Dog CEO API and returns JSON. JavaScript uses
`fetch`, Promises, `async`/`await`, and JSON to update the page without reloading it.

## Original tutorial and credit

This project is a university assignment based on the tutorial
**Dogs, JavaScript & An API: Fetch, Promises & Async Await** by **Brad Schiff**
(LearnWebCode): https://www.youtube.com/watch?v=AVmGmLFcukM

Brad Schiff is credited in full as the author of the tutorial and the original application
idea (choose a breed, load its images, and show them as a slideshow). The code in this
repository was written for the assignment and is not presented as Brad Schiff's work. See
`LICENSE` for the license and attribution notes.

## Technologies

- Node.js (v20 or later) and Express
- HTML5, CSS3, JavaScript
- Fetch API, JSON, Promises, async/await, AJAX
- Dog CEO API (https://dog.ceo/dog-api/)
- GitHub and Azure App Service

## API routes

| Route | Description |
| --- | --- |
| `GET /api/dog` | One random dog: `{ "imageUrl": "...", "breed": "..." }` |
| `GET /api/breeds` | All breeds for the dropdown: `{ "breeds": [{ "value": "...", "label": "..." }] }` |
| `GET /api/breed/:breed/images` | Up to 50 random images for a breed, for example `/api/breed/labrador/images` |
| `GET /api/breed/:breed/:subBreed/images` | Same for a sub-breed, for example `/api/breed/hound/afghan/images` |
| `GET /health` | `{ "status": "ok" }` |

If the public API fails, the routes return HTTP 502 with `{ "error": "..." }`.

## Project structure

```
lions-tigers-bears/
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

## Build and run locally

1. Install [Node.js](https://nodejs.org/) v20 or later.
2. Open this folder in a terminal.
3. Run `npm install`, then `npm start`.
4. Open http://localhost:3000 in a browser. An internet connection is needed because the
   server calls the live Dog CEO API.
5. Press Ctrl+C to stop the server.

## Azure deployment

1. Push this project to a public GitHub repository on the `main` branch.
2. In the Azure portal, create a **Web App**: Publish = Code, Runtime stack = Node LTS,
   Operating System = Linux, Pricing plan = Free F1.
3. In the Web App, open **Deployment Center**, choose **GitHub**, select the repository and the
   `main` branch, and save. Azure adds a GitHub Actions workflow and redeploys on every push.
4. If the deploy step fails, turn on **SCM Basic Auth Publishing Credentials** under
   **Settings > Configuration > General settings**, then re-run the failed job.

**Live website:** https://abdul-lions-tigers-bears-dcg9b3dxhqgxh5c4.westus3-01.azurewebsites.net

## Credits and AI use

- Brad Schiff (LearnWebCode) for the tutorial this project is based on.
- Dog CEO API (https://dog.ceo/dog-api/) for the dog images and breed list.
- Express (https://expressjs.com/).
- The code was generated with Claude (Anthropic), then reviewed, tested, and deployed by the
  author. Each source file states this at the top.
