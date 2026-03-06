# How OpenPerplexity Works

This document describes the high-level request flow used when OpenPerplexity answers a message.

For the component map, see [README.md](README.md). For implementation notes, see [../../CONTRIBUTING.md](../../CONTRIBUTING.md).

## Request lifecycle

When a user submits a prompt in the interface, the app calls `POST /api/chat`.

At a high level, the pipeline does three things:

1. Classifies the request and decides whether research is required.
2. Runs research actions and widgets in parallel when needed.
3. Writes the final answer with citations.

## Classification

The classifier decides:

- whether live research should run
- whether any widgets should render
- how to rewrite the prompt into a clearer standalone query

## Widgets

Widgets are structured helpers that can run alongside research. Examples include weather, stocks, finance, and simple calculations.

Widgets provide context to the interface, but they are not treated as cited sources in the final answer.

## Research

When research is enabled, the system collects context in the background. Depending on configuration, this can include web results, discussion sources, academic search, and file retrieval.

## Answer generation

After enough context has been gathered, the selected chat model writes the final response.

The `optimizationMode` flag controls the tradeoff between speed and depth:

- `speed`
- `balanced`
- `quality`

## Citations

The writer prompt instructs the model to cite the sources used. The UI renders those citations alongside the answer.

## Search API

The same retrieval pipeline is available through `POST /api/search`. The response returns:

- `message`: the generated answer
- `sources`: the supporting references used for that answer

If `stream: true` is supplied, the response is streamed as SSE.

## Media search

Image and video lookups use `POST /api/images` and `POST /api/videos`. The app generates a focused query first, then fetches matching results from the configured search backend.
