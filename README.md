# MERN Portfolio Generator — Starter Kit

This repository provides a minimal MERN-style starter kit for building and downloading static portfolio sites. The backend exposes
a small JSON API powered purely by Node's built-in `http` module, while the frontend delivers a lightweight vanilla JavaScript
interface for selecting templates, editing content, previewing the result, and downloading a ready-to-host ZIP bundle.

## Getting started

### Install dependencies

Only the server requires Node.js. The project avoids third-party packages, so installs complete instantly but still create
lockfiles for reproducibility.

```bash
cd server
npm install

cd ../client
npm install
```

### Running the backend

Start the HTTP API (defaults to port `4000`):

```bash
cd server
npm start
```

### Using the frontend

The client is a static site. You can open `client/index.html` directly in a browser or serve the folder with any static file
server, for example:

```bash
cd client
python -m http.server 5173
```

Then browse to `http://localhost:5173` (or whichever port you choose).

### Environment variables

Copy `server/.env.example` to `server/.env` if you need to override defaults such as the server port.

## API overview

The backend exposes a few helpful routes:

| Method | Route                 | Description                                           |
| ------ | --------------------- | ----------------------------------------------------- |
| GET    | `/api/templates`      | List the available portfolio templates.               |
| POST   | `/api/portfolios`     | Create and persist a portfolio draft.                 |
| PUT    | `/api/portfolios/:id` | Update an existing portfolio draft.                   |
| GET    | `/api/portfolios/:id` | Retrieve a saved portfolio draft.                     |
| POST   | `/api/build`          | Build and download a ZIP for a template + portfolio.  |

Saved portfolios are stored as JSON inside `server/uploads/` for simplicity.

## Templates

Template assets live inside `server/src/templates/` and each template includes:

- `index.ejs` — the HTML structure rendered with portfolio data via the local renderer.
- `style.css` — CSS styles bundled alongside the HTML file.
- `manifest.json` — metadata served to the frontend.
- `preview.png` — placeholder image used in the UI (replace with real screenshots as you iterate).

Feel free to add more templates by following the same folder structure.

## Frontend overview

The client lives in `client/` and is implemented with plain JavaScript (`client/main.js`) and CSS (`client/styles.css`). It:

- fetches template metadata from the API,
- renders a form for editing portfolio content,
- updates a live preview as you type, and
- triggers a download by posting to `/api/build`.

No bundler is required—deploy the static assets anywhere you like.

## Production notes

- The backend runs with `node src/index.js` and relies only on core Node modules.
- The frontend is already production-ready static HTML/CSS/JS; copy the `client/` folder to your hosting provider of choice.
