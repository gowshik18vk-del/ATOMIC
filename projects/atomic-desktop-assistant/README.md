# Atomic Desktop Assistant

Atomic is an early-stage Windows desktop assistant built with **Electron**, **TypeScript**, and **Claude**. It has a chat interface, permission-controlled tools, timers, basic system stats, and helper functions for ElevenLabs.

> **Status:** this is a foundation build, not a finished assistant. See [What's not ready yet](#whats-not-ready-yet).

## What it can do

- Chat with Claude using an API key and a model ID available to your account.
- Open valid HTTPS websites.
- Launch applications that you explicitly add to a local app registry.
- Create, list, check, and cancel timers.
- Create text notes without overwriting an existing note.
- Show basic CPU and memory usage.
- Check ElevenLabs voice configuration.
- Ask for permissions before using protected tools.

## Requirements

- Windows 10/11
- Node.js 20 or newer and npm
- An Anthropic API key and a model ID available to your account
- Optional: ElevenLabs API key and agent ID

## Run it

1. Open a terminal in this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in the values you want to use:

   ```env
   ANTHROPIC_API_KEY=
   ATOMIC_CLAUDE_MODEL=
   ELEVENLABS_API_KEY=
   ELEVENLABS_AGENT_ID=
   ```

4. Start Atomic:

   ```bash
   npm start
   ```

5. Review the permission panel and enable only the features you want.

## Useful commands

```bash
npm run typecheck
npm test
npm run build
npm start
```

Press **Ctrl+Alt+Space** to bring the app to the front while it is running.

## Allow an app to launch

Atomic only launches apps explicitly listed in an `apps.json` file in Electron's user-data directory. Add an app name and its executable path, for example:

```json
{
  "notepad": "C:\\Windows\\notepad.exe"
}
```

Only add applications you trust.

## Project map

| Path | Purpose |
| --- | --- |
| `src/main/` | Electron window, IPC handlers, and system integration |
| `src/preload/` | Limited API exposed to the UI |
| `src/renderer/` | Desktop interface |
| `src/agent/` | Claude conversation and tool-call loop |
| `src/tools/` | Tool definitions, input validation, and permission checks |
| `src/timers/` | Timer parsing and storage |
| `src/voice/` | ElevenLabs API helpers |
| `src/shared/` | Shared input schemas |
| `tests/` | Automated tests |

## What's not ready yet

This version does not have a complete voice-session interface, push-to-talk capture, wake-word detection, local file search, web search, focus sessions, persistent conversational memory, a full settings screen, alarm sounds, or packaged installers.

## Security and privacy

- Never commit your real `.env` file or paste API keys into source code.
- Keep API credentials on your own machine.
- Review permissions before enabling actions that affect your computer.
- The app is early-stage software; review and test it before relying on it.
- No license has been added yet. Choose a license before redistributing the project.
