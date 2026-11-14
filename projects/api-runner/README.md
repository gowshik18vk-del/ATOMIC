# API RUNNER

### A local-first workspace for building, sending, inspecting, and testing HTTP requests.

Compose real API calls, configure authentication and headers, reuse environment variables, and inspect responses in a focused dark workspace. A small local Node.js executor handles outbound HTTP so browser CORS rules don’t block requests.

## Quick start

### Requirements

- Node.js 20 or newer
- npm (included with Node.js)

### Install and run

From a terminal:

```bash
git clone https://github.com/gowshik18vk-del/ATOMIC.git
cd ATOMIC/projects/api-runner
npm install
npm run dev:all
```

Open **http://127.0.0.1:5173** in your browser. The first command downloads the project’s npm dependencies. `npm run dev:all` starts both the Vite interface and the local request executor.

To stop the app, focus the terminal and press **Ctrl+C**.

### Windows Command Prompt

The same commands work in Command Prompt:

```cmd
git clone https://github.com/gowshik18vk-del/ATOMIC.git
cd ATOMIC\projects\api-runner
npm install
npm run dev:all
```

If Windows says `node` or `npm` is not recognized, install Node.js 20+ from [nodejs.org](https://nodejs.org/), close and reopen the terminal, then retry.

### Run the services separately

If you prefer two terminals, start the executor in one:

```bash
npm run server
```

Then start the interface in a second terminal:

```bash
npm run dev
```

Open **http://127.0.0.1:5173**.

## What’s included

- HTTP methods, URL parameters, headers, Basic/Bearer/API key/custom-header authentication, and JSON/raw/form URL-encoded/XML request bodies.
- Real response status, elapsed time, size, headers, formatted JSON, raw text, image preview, download, cancellation, timeout, and retry.
- Saved requests, favorites, history, duplication, environment variables, and API RUNNER collection import/export.
- Safe JSON assertions for status, elapsed time, headers, JSON paths, and body text. The app does not evaluate user-provided JavaScript.
- cURL import/export and fetch, Axios, and Python requests snippets.
- Keyboard shortcuts: Ctrl/Cmd+Enter sends; Ctrl/Cmd+S saves; Ctrl/Cmd+K focuses workspace search.

## Development

```bash
npm run dev:all   # Start UI and executor together
npm run dev       # Start only the Vite UI
npm run server    # Start only the local executor
npm run lint      # Lint source files
npm run typecheck # TypeScript checks for the UI
npm test          # Run executor and security tests
npm run build     # Create the production frontend bundle in dist/
```

## Security and deployment

The executor binds to `127.0.0.1:8787`, accepts only HTTP(S), blocks private/reserved destinations, pins DNS resolution, does not follow redirects, and limits request time and response size. Keep it local; do not expose it directly to the public internet. Browser data is stored in local storage and is not encrypted.

The frontend alone can be hosted as static files, but API execution requires the executor too. A public deployment needs protected access and a secured backend; the local executor is not a public proxy.

## Current limitations

Folders, OAuth authorization-code flows, multipart file upload, WebSockets, GraphQL-specific editing, OpenAPI import/export, environment export, arbitrary JavaScript tests, and advanced syntax-editor features are not implemented. HTML/XML/text responses appear as text; images can be previewed and other responses can be downloaded.

## Project files

- `src/`: React/Vite application
- `server.mjs`: local HTTP execution service
- `dev.mjs`: one-command local startup helper
- `server.test.mjs`: executor and destination-security tests
- `.github/`: issue templates and CI workflow
