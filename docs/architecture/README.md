# OpenPerplexity Architecture

OpenPerplexity is a Next.js application that combines chat, live search, citations, and local document retrieval.

For the request flow, see [WORKING.md](WORKING.md). For implementation guidance, see [../../CONTRIBUTING.md](../../CONTRIBUTING.md).

## Key components

1. **User interface**
   - The app shell, chat surface, setup flow, library, and supporting widgets live under `src/app` and `src/components`.
2. **API routes**
   - `POST /api/chat` powers the interactive chat flow.
   - `POST /api/search` exposes a programmatic search endpoint.
   - `GET /api/providers` lists configured providers and their available model keys.
3. **Search orchestration**
   - The system classifies the request, optionally runs research, runs widgets in parallel, and composes the final answer.
4. **Search backend**
   - A metasearch backend supplies web results when research is enabled.
5. **LLMs**
   - Chat models classify tasks, rewrite questions, and write grounded answers.
6. **Embeddings**
   - Embedding models index and search uploaded files.
7. **Storage**
   - Chats, messages, uploads, and configuration are persisted locally.
