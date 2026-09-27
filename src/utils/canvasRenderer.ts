import type { CropPreset } from '../config/presets';
import type { FitMode, Transform } from '../types/crop';

export type RenderOptions = {
  sourceImage: HTMLImageElement;
  transform: Transform;
  preset: CropPreset;
  borderRadius: number;
  roundCorners: boolean;
  fitMode: FitMode;
  targetCanvas: HTMLCanvasElement;
};

export const getFitScale = (
  sourceImage: HTMLImageElement,
  preset: Pick<CropPreset, 'width' | 'height'>,
  fitMode: FitMode,
): number => {
  const widthScale = preset.width / sourceImage.naturalWidth;
  const heightScale = preset.height / sourceImage.naturalHeight;
  const coverScale = Math.max(widthScale, heightScale);

  if (fitMode === 'width') return widthScale;
  if (fitMode === 'height') return heightScale;
  return coverScale;
};

export const getDrawMetrics = (
  sourceImage: HTMLImageElement,
  transform: Transform,
  preset: CropPreset,
  fitMode: FitMode,
) => {
  const fitScale = getFitScale(sourceImage, preset, fitMode);
  const imageWidth = sourceImage.naturalWidth * fitScale * transform.scale;
  const imageHeight = sourceImage.naturalHeight * fitScale * transform.scale;
  const left = (preset.width - imageWidth) / 2 + transform.x;
  const top = (preset.height - imageHeight) / 2 + transform.y;
  return { fitScale, imageWidth, imageHeight, left, top };
};

export const clampTransform = (
  sourceImage: HTMLImageElement,
  transform: Transform,
  preset: CropPreset,
  fitMode: FitMode,
): Transform => {
  const scale = Math.min(3, Math.max(1, transform.scale));
  const metrics = getDrawMetrics(sourceImage, { ...transform, scale }, preset, fitMode);
  const maxX = Math.max(0, (metrics.imageWidth - preset.width) / 2);
  const maxY = Math.max(0, (metrics.imageHeight - preset.height) / 2);
  return {
    scale,
    x: Math.min(maxX, Math.max(-maxX, transform.x)),
    y: Math.min(maxY, Math.max(-maxY, transform.y)),
  };
};

const roundedRectPath = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
): void => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  if (typeof context.roundRect === 'function') {
    context.beginPath();
    context.roundRect(0, 0, width, height, safeRadius);
    return;
  }

  const x = 0;
  const y = 0;
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

/**
 * Shared renderer for the editor canvas, the lightweight preview and the
 * final export canvas. Coordinates always use preset pixels, so preview scale
 * never changes the exported composition.
 */
export const renderCroppedImage = ({
  sourceImage,
  transform,
  preset,
  borderRadius,
  roundCorners,
  fitMode,
  targetCanvas,
}: RenderOptions): void => {
  const context = targetCanvas.getContext('2d');
  if (!context) return;

  const pixelScale = targetCanvas.width / preset.width;
  const targetHeight = preset.height * pixelScale;
  context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.save();
  if (roundCorners) {
    roundedRectPath(context, targetCanvas.width, targetHeight, borderRadius * pixelScale);
    context.clip();
  }

  const metrics = getDrawMetrics(sourceImage, transform, preset, fitMode);
  context.drawImage(
    sourceImage,
    metrics.left * pixelScale,
    metrics.top * pixelScale,
    metrics.imageWidth * pixelScale,
    metrics.imageHeight * pixelScale,
  );
  context.restore();
};

export const renderOriginalPreview = (
  sourceImage: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
): void => {
  const context = targetCanvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const scale = Math.min(
    targetCanvas.width / sourceImage.naturalWidth,
    targetCanvas.height / sourceImage.naturalHeight,
  );
  const width = sourceImage.naturalWidth * scale;
  const height = sourceImage.naturalHeight * scale;
  context.drawImage(
    sourceImage,
    (targetCanvas.width - width) / 2,
    (targetCanvas.height - height) / 2,
    width,
    height,
  );
};

export const drawPreviewCanvas = (
  canvas: HTMLCanvasElement,
  sourceImage: HTMLImageElement,
  options: Omit<RenderOptions, 'targetCanvas' | 'sourceImage'>,
): void => {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width * window.devicePixelRatio));
  const height = Math.max(1, Math.round(bounds.height * window.devicePixelRatio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  renderCroppedImage({ ...options, sourceImage, targetCanvas: canvas });
};
