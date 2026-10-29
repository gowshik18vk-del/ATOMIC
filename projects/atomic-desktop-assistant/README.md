# Atomic Desktop Assistant

A Windows-oriented desktop assistant foundation built with Electron, TypeScript, and Node.js. It provides a local desktop UI, Claude-powered tool calling, permission-gated actions, persisted timers, and helper functions for the ElevenLabs API.

> **Status:** foundation build, not a complete personal-assistant product. Features listed under “Not implemented yet” are not available in this version.

## Features in this build

- Electron window with renderer/preload/main-process separation.
- Claude API integration with model ID verification.
- Typed tool schemas and permission checks.
- HTTPS website opening and launching apps listed in the local app registry.
- Persistent timers, notifications, and timer management.
- Text-note creation without silently overwriting existing notes.
- Basic CPU/memory statistics.
- ElevenLabs voice-list status helper.
- Vitest tests for timer parsing, persistence, URL validation, permissions, and note safety.

## Requirements

- Windows 11 (the project is designed for Windows).
- Node.js 20 or newer and npm.
- An Anthropic API key and a model ID available to your account.
- Optional: ElevenLabs API key and agent ID.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set the values you need: `ANTHROPIC_API_KEY`, `ATOMIC_CLAUDE_MODEL`, `ELEVENLABS_API_KEY`, and `ELEVENLABS_AGENT_ID`.
3. Run `npm start`.
4. Review the permission panel and grant only the permissions you need.

Never commit your real `.env` file or paste API keys into source code, issues, screenshots, or logs.

## Development commands

```bash
npm run typecheck
npm test
npm run build
npm start
```

The global shortcut registered by this build is **Ctrl+Alt+Space**.

## Local app registry

To enable `launch_app`, create an `apps.json` file in Electron's user-data directory. Map trusted app names to executable paths, for example:

```json
{
  "notepad": "C:\\Windows\\notepad.exe"
}
```

## Project structure

```text
src/
├── agent/       # Claude conversation/tool-call loop
├── main/        # Electron main process and IPC handlers
├── preload/     # Narrow renderer API via contextBridge
├── renderer/    # HTML UI and renderer logic
├── shared/      # Shared input schemas
├── timers/      # Time parsing and persisted timer store
├── tools/       # Tool registry, validation, and permission enforcement
└── voice/       # ElevenLabs API helpers
tests/           # Vitest test suite
```

## Not implemented yet

This foundation does not yet include a complete voice-session UI, push-to-talk capture, wake-word detection, local file search/read, web search, focus sessions, persistent conversational memory, a full app-settings UI, alarm tones, or packaged installers.

## Security notes

- The renderer uses context isolation and disables Node integration.
- IPC calls are restricted to the app's own file-based renderer.
- Keep provider keys in local environment variables.
- Review permissions before enabling tools that can affect your computer.
- This is early-stage software; review and test it before relying on it for important tasks.

## License

No license has been added yet. Choose one before redistributing this project.
