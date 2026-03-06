# Contributing to OpenPerplexity

This guide explains how to work on the OpenPerplexity codebase without changing its public API surface.

## Project structure

- `src/app`: Next.js routes, layouts, and route handlers
- `src/components`: shared interface components
- `src/lib/agents/search`: classification, research, widgets, and writing
- `src/lib/models`: chat and embedding providers plus model registry
- `src/lib/db`: persistence layer for chats, messages, and uploads
- `src/lib/prompts`: prompt construction for search and answer generation
- `src/lib/uploads`: file ingestion and retrieval
- `docs/architecture`: architectural notes and request flow documentation

## Where to make changes

### Search behavior

- Classification and orchestration live in `src/lib/agents/search`.
- Research actions are in `src/lib/agents/search/researcher/actions`.
- Final answer generation is in `src/lib/prompts/search` and the writer flow.

### Widgets

- UI widgets live in `src/lib/agents/search/widgets`.
- Widgets run alongside research and return structured data to the interface.

### Model providers

- Provider implementations live in `src/lib/models/providers`.
- Register new providers through `src/lib/models/registry.ts`.

## Local development

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000` and complete the initial setup.

Database migrations run automatically on startup.

## Contribution practices

Before handing off changes:

1. Run `npm run build` for a production compile check.
2. Run `npm run format:write` if you touched formatting-sensitive files.
3. Verify the app still answers through the existing `/api/chat`, `/api/search`, and `/api/providers` routes.
4. Keep branding, docs, and runtime identifiers aligned with `OpenPerplexity` and `openperplexity`.
