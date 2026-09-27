import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { formatRatio, type CropPreset } from '../config/presets';
import type { FitMode, Transform } from '../types/crop';
import { drawPreviewCanvas, renderOriginalPreview, renderCroppedImage } from '../utils/canvasRenderer';
import { Icon } from './Icon';

export type PreviewPanelHandle = {
  draw: (transform: Transform) => void;
};

type PreviewPanelProps = {
  sourceImage: HTMLImageElement | null;
  preset: CropPreset;
  transform: Transform;
  borderRadius: number;
  roundCorners: boolean;
  fitMode: FitMode;
  fileName?: string;
  onDownload: () => void;
  onCopy: () => void;
};

export const PreviewPanel = forwardRef<PreviewPanelHandle, PreviewPanelProps>(({
  sourceImage,
  preset,
  transform,
  borderRadius,
  roundCorners,
  fitMode,
  onDownload,
  onCopy,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'crop' | 'original'>('crop');

  const draw = useCallback((nextTransform: Transform) => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) {
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
        canvas.getContext('2d')?.clearRect(0, 0, 1, 1);
      }
      return;
    }
    if (activeTab === 'original') {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas.height = Math.max(1, Math.round(bounds.height * ratio));
      renderOriginalPreview(sourceImage, canvas);
      return;
    }
    drawPreviewCanvas(canvas, sourceImage, {
      transform: nextTransform,
      preset,
      borderRadius,
      roundCorners,
      fitMode,
    });
  }, [activeTab, borderRadius, fitMode, preset, roundCorners, sourceImage]);

  useImperativeHandle(ref, () => ({ draw }), [draw]);

  useEffect(() => {
    draw(transform);
  }, [draw, transform]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => draw(transform));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw, transform]);

  return (
    <>
      <section className="preview-card panel">
        <h2 className="panel-heading">实时预览</h2>
        <div className="preview-tabs" role="tablist">
          <button className={activeTab === 'crop' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'crop'} onClick={() => setActiveTab('crop')}>裁剪结果</button>
          <button className={activeTab === 'original' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'original'} onClick={() => setActiveTab('original')}>原图对比</button>
        </div>
        <div className="preview-checkerboard">
          {sourceImage ? <canvas ref={canvasRef} className="preview-canvas" style={{ aspectRatio: `${preset.width} / ${preset.height}` }} aria-label="裁剪预览" /> : <div className="preview-placeholder"><Icon name="image" size={28} /><span>暂无图片</span></div>}
        </div>
        <div className="preview-meta">
          <span>{preset.width} × {preset.height}</span>
          <i>·</i>
          <span>{formatRatio(preset)}</span>
          <i>·</i>
          <span>PNG（{roundCorners ? '透明背景' : '矩形'}）</span>
        </div>
        <div className="export-actions">
          <button className="primary-button export-button" type="button" onClick={onDownload} disabled={!sourceImage}>
            <Icon name="download" size={20} /> 下载 PNG
          </button>
          <button className="secondary-button copy-button" type="button" onClick={onCopy} disabled={!sourceImage}>
            <Icon name="copy" size={18} /> 复制到剪贴板
          </button>
        </div>
      </section>

      <section className="preset-info-card panel">
        <h2 className="panel-heading">预设信息</h2>
        <dl className="preset-info-list">
          <div><dt>名称</dt><dd>{preset.name}</dd></div>
          <div><dt>尺寸</dt><dd>{preset.width} × {preset.height}</dd></div>
          <div><dt>比例</dt><dd>{formatRatio(preset)}</dd></div>
          <div><dt>圆角半径</dt><dd>{roundCorners ? `${borderRadius} px` : '已关闭'}</dd></div>
        </dl>
      </section>
    </>
  );
});

PreviewPanel.displayName = 'PreviewPanel';
