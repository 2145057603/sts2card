export type CropPresetId = 'original' | 'alternate';

export type CropPreset = {
  id: CropPresetId;
  name: string;
  width: number;
  height: number;
  borderRadius: number;
  description: string;
  icon: 'spire' | 'image';
  fileSuffix: string;
};

/**
 * The only source of truth for output dimensions. UI and Canvas code should
 * always read from this record instead of duplicating width/height literals.
 */
export const cropPresets: Record<CropPresetId, CropPreset> = {
  original: {
    id: 'original',
    name: '杀戮尖塔2 原版卡图',
    width: 1000,
    height: 760,
    borderRadius: 50,
    description: '原版卡图',
    icon: 'spire',
    fileSuffix: '1000x760',
  },
  alternate: {
    id: 'alternate',
    name: '异画卡面',
    width: 1180,
    height: 760,
    borderRadius: 60,
    description: '异画示例',
    icon: 'image',
    fileSuffix: '异画',
  },
};

export const presetList = Object.values(cropPresets);

export const getPreset = (id: string): CropPreset =>
  cropPresets[id as CropPresetId] ?? cropPresets.original;

export const formatRatio = (preset: Pick<CropPreset, 'width' | 'height'>): string => {
  const gcd = (left: number, right: number): number => (right === 0 ? left : gcd(right, left % right));
  const divisor = gcd(preset.width, preset.height);
  return `${preset.width / divisor}:${preset.height / divisor}`;
};
