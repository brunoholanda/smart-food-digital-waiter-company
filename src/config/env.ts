function trimSlash(value: string) {
  return value.replace(/\/$/, '');
}

const apiBaseUrl = trimSlash(
  import.meta.env.VITE_API_BASE_URL?.toString() || '/api',
);
const uploadsBaseUrl = trimSlash(
  import.meta.env.VITE_UPLOADS_BASE_URL?.toString() || '',
);
const appUrl = trimSlash(
  import.meta.env.VITE_APP_URL?.toString() || window.location.origin,
);
const socketUrl = trimSlash(
  import.meta.env.VITE_SOCKET_URL?.toString() ||
    import.meta.env.VITE_UPLOADS_BASE_URL?.toString() ||
    `${window.location.protocol}//${window.location.hostname}:3000`,
);

export const env = {
  appName: import.meta.env.VITE_APP_NAME?.toString() || 'SmartFood',
  apiBaseUrl,
  uploadsBaseUrl,
  socketUrl,
  appUrl,
  isDev: import.meta.env.DEV,
} as const;
