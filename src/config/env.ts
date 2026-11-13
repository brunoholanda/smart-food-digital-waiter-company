function trimSlash(value: string) {
  return value.replace(/\/$/, '');
}

/** Garante URL absoluta; host sem protocolo vira https://host (evita path relativo no browser). */
function absoluteUrl(value: string | undefined, fallback: string): string {
  const raw = (value ?? '').trim();
  if (!raw) return trimSlash(fallback);

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('/') ||
    raw.startsWith('ws://') ||
    raw.startsWith('wss://')
  ) {
    return trimSlash(raw);
  }

  // Ex.: smartfood.api.brunoholanda.com/api → https://smartfood.api.brunoholanda.com/api
  return trimSlash(`https://${raw}`);
}

const apiBaseUrl = absoluteUrl(
  import.meta.env.VITE_API_BASE_URL?.toString(),
  '/api',
);
const uploadsBaseUrl = absoluteUrl(
  import.meta.env.VITE_UPLOADS_BASE_URL?.toString(),
  '',
);
const appUrl = absoluteUrl(
  import.meta.env.VITE_APP_URL?.toString(),
  typeof window !== 'undefined' ? window.location.origin : '',
);
const socketUrl = absoluteUrl(
  import.meta.env.VITE_SOCKET_URL?.toString() ||
    import.meta.env.VITE_UPLOADS_BASE_URL?.toString(),
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://localhost:3000',
);

export const env = {
  appName: import.meta.env.VITE_APP_NAME?.toString() || 'SmartFood',
  apiBaseUrl,
  uploadsBaseUrl,
  socketUrl,
  appUrl,
  isDev: import.meta.env.DEV,
} as const;
