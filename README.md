# Atomic Projects

A home for projects and experiments built under the Atomic name.

## Projects

- [StudyWithAtomic build prompt](studywithatomic-build-prompt.md) — product specification for a chapter-based study video platform.
- [Atomic Desktop Assistant](projects/atomic-desktop-assistant/README.md) — Electron and TypeScript desktop assistant foundation.

## Repository layout

```text
.
├── README.md
├── studywithatomic-build-prompt.md
└── projects/
    └── atomic-desktop-assistant/
        ├── README.md
        ├── .env.example
        ├── package.json
        ├── tsconfig.json
        ├── src/
        └── tests/
```

Keep API credentials in a local `.env` file and never commit real keys. Each project documents its own setup and implementation status.
