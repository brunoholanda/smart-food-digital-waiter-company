const MAX_BYTES = 100 * 1024;
const MAX_EDGE = 1280;

export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível carregar a imagem'));
    image.src = src;
  });
}

function scaleCanvas(
  source: HTMLCanvasElement,
  maxEdge: number,
): HTMLCanvasElement {
  const longest = Math.max(source.width, source.height);
  if (longest <= maxEdge) return source;

  const ratio = maxEdge / longest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * ratio));
  canvas.height = Math.max(1, Math.round(source.height * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function cropImageToCanvas(
  imageSrc: string,
  crop: CropAreaPixels,
  maxEdge = MAX_EDGE,
): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc);
  const cropW = Math.max(1, Math.round(crop.width));
  const cropH = Math.max(1, Math.round(crop.height));
  const longest = Math.max(cropW, cropH);
  const ratio = longest > maxEdge ? maxEdge / longest : 1;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cropW * ratio));
  canvas.height = Math.max(1, Math.round(cropH * ratio));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function encodePreferWebp(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<{ blob: Blob; mime: 'image/webp' | 'image/jpeg' }> {
  const webp = await canvasToBlob(canvas, 'image/webp', quality);
  if (webp && webp.type === 'image/webp' && webp.size > 0) {
    return { blob: webp, mime: 'image/webp' };
  }

  const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality);
  if (!jpeg || jpeg.size <= 0) {
    throw new Error('Falha ao gerar a imagem otimizada');
  }
  return { blob: jpeg, mime: 'image/jpeg' };
}

/**
 * Converts a cropped canvas to WebP (JPEG fallback), keeping the highest
 * quality that still fits under maxBytes (default 100KB).
 */
export async function normalizeCanvasToWebpFile(
  source: HTMLCanvasElement,
  fileName = 'image.webp',
  maxBytes = MAX_BYTES,
): Promise<{
  file: File;
  bytes: number;
  quality: number;
  width: number;
  height: number;
}> {
  let canvas = scaleCanvas(source, MAX_EDGE);
  let edge = Math.max(canvas.width, canvas.height);
  let best: { blob: Blob; mime: 'image/webp' | 'image/jpeg'; quality: number } | null =
    null;

  while (edge >= 320) {
    canvas = scaleCanvas(source, edge);

    const qualities = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];
    for (const quality of qualities) {
      const encoded = await encodePreferWebp(canvas, quality);
      if (encoded.blob.size <= maxBytes) {
        best = { ...encoded, quality };
        break;
      }
    }

    if (best) break;
    edge = Math.round(edge * 0.8);
  }

  if (!best) {
    canvas = scaleCanvas(source, 320);
    const encoded = await encodePreferWebp(canvas, 0.35);
    best = { ...encoded, quality: 0.35 };
  }

  if (best.blob.size > maxBytes) {
    throw new Error(
      'Não foi possível reduzir a imagem para 100KB. Tente outra foto.',
    );
  }

  const extension = best.mime === 'image/webp' ? 'webp' : 'jpg';
  const safeName = fileName.replace(/\.[^.]+$/, '') || 'image';
  const file = new File([best.blob], `${safeName}.${extension}`, {
    type: best.mime,
    lastModified: Date.now(),
  });

  return {
    file,
    bytes: best.blob.size,
    quality: best.quality,
    width: canvas.width,
    height: canvas.height,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
