import { env } from '../config/env';

export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  if (path.startsWith('/uploads')) {
    return `${env.uploadsBaseUrl}${path}`;
  }
  return path;
}
