# OpenPerplexity Search API

## Overview

The OpenPerplexity search API exposes the same search engine used by the web interface. You can choose providers, select models, enable sources, and receive cited answers with optional streaming.

## Endpoints

### `GET /api/providers`

Returns the active providers and the chat or embedding models available for each provider.

Full URL example:

```text
http://localhost:3000/api/providers
```

Response shape:

```json
{
  "providers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "OpenAI",
      "chatModels": [
        {
          "name": "GPT 4 Omni Mini",
          "key": "gpt-4o-mini"
        }
      ],
      "embeddingModels": [
        {
          "name": "Text Embedding 3 Large",
          "key": "text-embedding-3-large"
        }
      ]
    }
  ]
}
```

Use the provider `id` and model `key` values from this response when building search requests.

### `POST /api/search`

Run a search request with the sources, models, and optimization mode you want.

Full URL example:

```text
http://localhost:3000/api/search
```

If your deployment does not use `localhost:3000`, replace the host and port accordingly.

## Request body

```json
{
  "chatModel": {
    "providerId": "550e8400-e29b-41d4-a716-446655440000",
    "key": "gpt-4o-mini"
  },
  "embeddingModel": {
    "providerId": "550e8400-e29b-41d4-a716-446655440000",
    "key": "text-embedding-3-large"
  },
  "optimizationMode": "balanced",
  "sources": ["web"],
  "query": "Summarize the latest FOMC statement and note any inflation language.",
  "history": [
    ["human", "Track Federal Reserve communications for me."],
    ["assistant", "I can summarize statements, minutes, and speeches."]
  ],
  "systemInstructions": "Focus on monetary policy language and quote short source excerpts when useful.",
  "stream": false
}
```

## Parameters

- `chatModel` (required): provider and model used to generate the final answer.
- `embeddingModel` (required): provider and model used for semantic retrieval over uploads.
- `optimizationMode` (optional): `speed`, `balanced`, or `quality`.
- `sources` (required): search sources to enable. Supported values include `web`, `academic`, and `discussions`.
- `query` (required): the user request.
- `history` (optional): prior message pairs in `[role, content]` format.
- `systemInstructions` (optional): extra user-provided guidance applied after the system instructions.
- `stream` (optional): when `true`, returns a streamed event response.

## Standard response

When `stream` is `false`, the API returns a JSON object with the final answer and the supporting sources.

```json
{
  "message": "The latest FOMC statement kept the target range unchanged and maintained a restrictive policy stance while noting that inflation has eased but remains somewhat elevated.",
  "sources": [
    {
      "content": "The Committee seeks to achieve maximum employment and inflation at the rate of 2 percent over the longer run.",
      "metadata": {
        "title": "Federal Reserve issues FOMC statement",
        "url": "https://www.federalreserve.gov/newsevents/pressreleases/monetary20250129a.htm"
      }
    },
    {
      "content": "The all items index rose 2.9 percent for the 12 months ending in December.",
      "metadata": {
        "title": "Consumer Price Index Summary",
        "url": "https://www.bls.gov/news.release/cpi.nr0.htm"
      }
    }
  ]
}
```

## Streaming response

When `stream` is `true`, the response uses Server-Sent Events. Each line is a complete JSON object.

```text
{"type":"init","data":"Stream connected"}
{"type":"sources","data":[{"content":"...","metadata":{"title":"...","url":"..."}}]}
{"type":"response","data":"The latest FOMC statement "}
{"type":"response","data":"kept policy unchanged ..."}
{"type":"done"}
```

Event types:

- `init`: connection established
- `sources`: supporting references collected for the answer
- `response`: streamed answer text chunk
- `done`: generation finished

## Error handling

- `400`: malformed request or missing required fields
- `500`: internal failure while performing search or generating the response
