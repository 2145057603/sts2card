import type { CropPresetId } from '../config/presets';

export type FitMode = 'cover' | 'width' | 'height';

export type Transform = {
  x: number;
  y: number;
  scale: number;
};

export type PersistedSettings = {
  presetId: CropPresetId;
  roundCorners: boolean;
  showSafeArea: boolean;
  showGuides: boolean;
  fitMode: FitMode;
  customRadiusByPreset: Partial<Record<CropPresetId, number>>;
};

export type LoadedImage = {
  id: string;
  file: File;
  image: HTMLImageElement;
  objectUrl: string;
  thumbnailUrl: string;
  fileName: string;
  transform: Transform;
};
