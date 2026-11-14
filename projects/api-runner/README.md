# API RUNNER

A local-first API workspace for composing, executing, saving, and inspecting HTTP requests. The React/Vite interface talks to a separate loopback Node execution service so requests are not subject to browser CORS. The service only accepts HTTP(S), resolves and rejects private/reserved destinations, pins the validated address for the connection, disables redirects, enforces timeouts and response-size limits, and binds only to loopback.

## Requirements and setup

- Node.js 20 or newer
- `npm install`
- Run `npm run dev:all`
- Open `http://127.0.0.1:5173`.

For separate terminals, use `npm run server` and `npm run dev` as before.

Use the Send button to make a real request. The execution service listens at `127.0.0.1:8787`; do not expose it to a network. Browser data is stored in local storage on this device. Credentials are not sent to any hosted service.

## Included

- HTTP methods, URL and query parameters, editable headers, Basic/Bearer/API key/custom-header auth, JSON/raw/urlencoded/XML bodies, timeout, cancellation, real response status/time/size/headers, JSON formatting, image preview, response download, and retry.
- Saved requests, local request history, favorites, request duplication, environments and `{{variable}}` substitution, secret masking, import/export of API RUNNER JSON collections.
- Status, elapsed-time, header, JSON-path and body-contains assertions using a constrained JSON assertion format (no user JavaScript evaluation).
- cURL import/export and code snippets for fetch, Axios, and Python requests.
- Keyboard shortcuts: Ctrl/Cmd+Enter sends; Ctrl/Cmd+S saves; Ctrl/Cmd+K focuses the URL field.

## Limitations and security

Folders, OAuth authorization-code flows, multipart file upload, WebSockets, GraphQL-specific editing, OpenAPI import/export, environment export, arbitrary JavaScript tests, and advanced syntax-editor features are not implemented. HTML/XML/text responses are shown as text; images are previewed and other response types can be downloaded. The API key and auth inputs are masked in the UI but browser local storage is not encrypted; use a dedicated OS credential store before using this as a shared or managed workstation. The execution service blocks loopback, private, link-local, multicast, and reserved IP ranges and does not follow redirects. It does not provide a public proxy or bypass network policy. Review target authorization before sending requests.

## Project

- `src/`: client application
- `server.mjs`: loopback HTTP execution service
- `server.test.mjs`: request destination and input security tests

## Development and checks

`npm run dev`, `npm run server`, `npm test`, `npm run build`. No telemetry or external account is required. Contributions should include a focused change, reproducible steps, and tests for security-sensitive behavior.
