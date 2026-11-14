# Atomic

A simple home for my Atomic projects.

## Projects

- **[Atomic Desktop Assistant](projects/atomic-desktop-assistant/README.md)** — a Windows desktop AI assistant built with Electron and TypeScript.
- **[API RUNNER](projects/api-runner/README.md)** — a local-first API request workspace with a secure loopback executor.
- **[StudyWithAtomic build prompt](studywithatomic-build-prompt.md)** — the planning prompt for my study platform.

## Quick start

To run Atomic Desktop Assistant, open its project folder and follow the [setup guide](projects/atomic-desktop-assistant/README.md).

To run API RUNNER, open `projects/api-runner` and follow its [setup guide](projects/api-runner/README.md).

## Repository structure

```text
ATOMIC/
├── README.md
├── studywithatomic-build-prompt.md
└── projects/
    ├── api-runner/
    │   ├── README.md
    │   ├── package.json
    │   ├── server.mjs
    │   └── src/
    └── atomic-desktop-assistant/
        ├── README.md
        ├── .env.example
        ├── package.json
        ├── src/
        └── tests/
```

Each project has its own instructions. Secrets, local settings, and build output should not be committed.
