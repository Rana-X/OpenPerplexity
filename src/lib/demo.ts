const truthyValues = new Set(['1', 'true', 'yes', 'on']);

export const isDemoModeEnabled = () => {
  const value = process.env.DEMO_MODE?.trim().toLowerCase() ?? '';
  return truthyValues.has(value);
};

export const getDemoSessionIdFromHeaders = (headers: Headers) => {
  const value = headers.get('x-demo-session-id')?.trim() ?? '';

  if (!value) {
    return null;
  }

  return /^[A-Za-z0-9_-]{8,128}$/.test(value) ? value : null;
};

export const getDemoUploadTtlMs = () => {
  const rawMinutes = Number(process.env.DEMO_UPLOAD_TTL_MINUTES ?? '60');

  if (!Number.isFinite(rawMinutes) || rawMinutes <= 0) {
    return 60 * 60 * 1000;
  }

  return rawMinutes * 60 * 1000;
};
