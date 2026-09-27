import type { LoadedImage, Transform } from '../types/crop';

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const isSupportedImage = (file: File): boolean =>
  supportedImageTypes.has(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);

export const createInitialTransform = (): Transform => ({
  x: 0,
  y: 0,
  scale: 1.2,
});

const createThumbnail = (image: HTMLImageElement, maxSize = 220): string => {
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const ratio = longestSide > maxSize ? maxSize / longestSide : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const context = canvas.getContext('2d');
  if (!context) return '';
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
};

const readImage = (objectUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片读取失败'));
    image.src = objectUrl;
  });

export const loadImageFile = async (file: File): Promise<LoadedImage> => {
  if (!isSupportedImage(file)) {
    throw new Error(`不支持的图片格式：${file.name}`);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await readImage(objectUrl);
    return {
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      image,
      objectUrl,
      thumbnailUrl: createThumbnail(image),
      fileName: file.name,
      transform: createInitialTransform(),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
};

export const revokeImage = (item: LoadedImage): void => {
  URL.revokeObjectURL(item.objectUrl);
};
