import type { CropPreset } from '../config/presets';
import type { FitMode, LoadedImage, Transform } from '../types/crop';
import { CropCanvas } from './CropCanvas';
import { ImageQueue } from './ImageQueue';

type CropWorkspaceProps = {
  activeImage: LoadedImage | null;
  items: LoadedImage[];
  activeId: string | null;
  preset: CropPreset;
  transform: Transform;
  borderRadius: number;
  roundCorners: boolean;
  fitMode: FitMode;
  showSafeArea: boolean;
  showGuides: boolean;
  onTransformFrame: (transform: Transform) => void;
  onTransformCommit: (transform: Transform) => void;
  onSelect: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onDelete: () => void;
};

export const CropWorkspace = ({
  activeImage,
  items,
  activeId,
  preset,
  transform,
  borderRadius,
  roundCorners,
  fitMode,
  showSafeArea,
  showGuides,
  onTransformFrame,
  onTransformCommit,
  onSelect,
  onPrevious,
  onNext,
  onDelete,
}: CropWorkspaceProps) => (
  <div className="center-column">
    <section className="workspace-card panel">
      <p className="workspace-hint">拖动图片调整位置，滚轮缩放，或使用下方按钮快速适配。</p>
      <CropCanvas
        sourceImage={activeImage?.image ?? null}
        preset={preset}
        transform={transform}
        borderRadius={borderRadius}
        roundCorners={roundCorners}
        fitMode={fitMode}
        showSafeArea={showSafeArea}
        showGuides={showGuides}
        onTransformFrame={onTransformFrame}
        onTransformCommit={onTransformCommit}
      />
    </section>
    <ImageQueue
      items={items}
      activeId={activeId}
      onSelect={onSelect}
      onPrevious={onPrevious}
      onNext={onNext}
      onDelete={onDelete}
    />
  </div>
);
