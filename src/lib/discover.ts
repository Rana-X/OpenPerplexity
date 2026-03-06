const discoverPlaceholder = (label: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
        <radialGradient id="glowA" cx="18%" cy="24%" r="38%">
          <stop offset="0%" stop-color="rgba(96,165,250,0.55)" />
          <stop offset="100%" stop-color="rgba(96,165,250,0)" />
        </radialGradient>
        <radialGradient id="glowB" cx="82%" cy="76%" r="34%">
          <stop offset="0%" stop-color="rgba(45,212,191,0.45)" />
          <stop offset="100%" stop-color="rgba(45,212,191,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)" />
      <rect width="1200" height="675" fill="url(#glowA)" />
      <rect width="1200" height="675" fill="url(#glowB)" />
      <g fill="none" stroke="rgba(255,255,255,0.12)">
        <path d="M104 546C239 433 331 398 472 398c150 0 241 44 370 101" />
        <path d="M745 178c69 0 136 28 205 87" />
      </g>
      <text x="84" y="176" fill="white" font-size="44" font-family="Arial, sans-serif" font-weight="700" letter-spacing="8">OPENPERPLEXITY</text>
      <text x="84" y="248" fill="rgba(255,255,255,0.86)" font-size="74" font-family="Georgia, serif" font-style="italic">${label}</text>
    </svg>
  `)}`;

export const buildDiscoverThumbnailPlaceholder = (label: string) =>
  discoverPlaceholder(label.toUpperCase());

export const getDiscoverThumbnailSrc = (
  thumbnail?: string | null,
  fallbackLabel = 'Discover',
) => {
  if (!thumbnail) {
    return buildDiscoverThumbnailPlaceholder(fallbackLabel);
  }

  try {
    const url = new URL(thumbnail);
    if (url.pathname.includes('/image_proxy') && url.searchParams.get('id')) {
      return `${url.origin}${url.pathname}?id=${url.searchParams.get('id')}`;
    }

    return url.toString();
  } catch {
    return buildDiscoverThumbnailPlaceholder(fallbackLabel);
  }
};
