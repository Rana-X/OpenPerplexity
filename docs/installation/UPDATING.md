# Update OpenPerplexity

These steps refresh an existing OpenPerplexity deployment without changing the app's runtime identifiers.

## Docker deployment with bundled SearXNG

Rebuild the image from the current source tree:

```bash
docker build -t openperplexity:latest .
```

Replace the running container:

```bash
docker stop openperplexity
docker rm openperplexity
docker run -d \
  -p 3000:3000 \
  -v openperplexity-data:/home/openperplexity/data \
  --name openperplexity \
  openperplexity:latest
```

## Slim Docker deployment

If you use an external SearXNG instance, rebuild the slim image:

```bash
docker build -f Dockerfile.slim -t openperplexity:slim-latest .
```

Then replace the running container:

```bash
docker stop openperplexity
docker rm openperplexity
docker run -d \
  -p 3000:3000 \
  -e SEARXNG_API_URL=http://your-searxng-url:8080 \
  -v openperplexity-data:/home/openperplexity/data \
  --name openperplexity \
  openperplexity:slim-latest
```

## Source deployment

1. Refresh the local source tree with your updated fork contents.
2. Install dependencies:

```bash
npm install
```

3. Build the app:

```bash
npm run build
```

4. Restart the process:

```bash
npm run start
```

5. Open `http://localhost:3000` and verify the update.
