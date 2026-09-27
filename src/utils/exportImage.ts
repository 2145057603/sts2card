import type { CropPreset } from '../config/presets';
import type { FitMode, Transform } from '../types/crop';
import { renderCroppedImage } from './canvasRenderer';

type ExportOptions = {
  sourceImage: HTMLImageElement;
  transform: Transform;
  preset: CropPreset;
  borderRadius: number;
  roundCorners: boolean;
  fitMode: FitMode;
  fileName: string;
};

const fileStem = (fileName: string): string =>
  fileName.replace(/\.[^/.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'STS2卡面';

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG 导出失败'));
    }, 'image/png');
  });

export const createExportCanvas = ({
  sourceImage,
  transform,
  preset,
  borderRadius,
  roundCorners,
  fitMode,
}: Omit<ExportOptions, 'fileName'>): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = preset.width;
  canvas.height = preset.height;
  renderCroppedImage({
    sourceImage,
    transform,
    preset,
    borderRadius,
    roundCorners,
    fitMode,
    targetCanvas: canvas,
  });
  return canvas;
};

export const downloadExport = async (options: ExportOptions): Promise<void> => {
  const canvas = createExportCanvas(options);
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileStem(options.fileName)}_${options.preset.fileSuffix}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const copyExportToClipboard = async (options: Omit<ExportOptions, 'fileName'>): Promise<void> => {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('当前浏览器不支持图片剪贴板');
  }
  const canvas = createExportCanvas(options);
  const blob = await canvasToBlob(canvas);
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
};
