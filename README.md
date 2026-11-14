# ATOMIC

### A home for focused software projects—built to be useful, easy to run, and open to improvement.

ATOMIC brings together practical tools and experiments across desktop software, API development, and learning. Each project lives in its own folder with its own setup guide, dependencies, and contribution notes.

## Projects

| Project | What it does | Start here |
| --- | --- | --- |
| **[API RUNNER](projects/api-runner/README.md)** | Compose and run HTTP requests, inspect responses, reuse environments, and write safe assertions. | [Install and run](projects/api-runner/README.md#quick-start) |
| **[Atomic Desktop Assistant](projects/atomic-desktop-assistant/README.md)** | A Windows desktop AI assistant built with Electron and TypeScript. | [Project guide](projects/atomic-desktop-assistant/README.md) |
| **[StudyWithAtomic build prompt](studywithatomic-build-prompt.md)** | The planning prompt for a study platform. | [Read the prompt](studywithatomic-build-prompt.md) |

## Run API RUNNER

You’ll need [Node.js 20 or newer](https://nodejs.org/).

```bash
git clone https://github.com/gowshik18vk-del/ATOMIC.git
cd ATOMIC/projects/api-runner
npm install
npm run dev:all
```

Open **http://127.0.0.1:5173**. The `dev:all` command starts both the web interface and its local HTTP request executor. Press **Ctrl+C** in the terminal to stop them.

See the [API RUNNER guide](projects/api-runner/README.md) for troubleshooting, security details, and development commands.

## Repository map

```text
ATOMIC/
├── README.md
├── studywithatomic-build-prompt.md
└── projects/
    ├── api-runner/
    └── atomic-desktop-assistant/
```

## Contributing

Choose a project, read its setup and contribution guide, then send a focused change with reproducible steps. Keep credentials, personal data, local settings, and build output out of commits.
