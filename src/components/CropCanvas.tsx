import { useCallback, useEffect, useRef } from 'react';
import type { CropPreset } from '../config/presets';
import type { FitMode, Transform } from '../types/crop';
import { clampTransform, getDrawMetrics, getFitScale, renderCroppedImage } from '../utils/canvasRenderer';

type Point = { x: number; y: number };

type CropCanvasProps = {
  sourceImage: HTMLImageElement | null;
  preset: CropPreset;
  transform: Transform;
  borderRadius: number;
  roundCorners: boolean;
  fitMode: FitMode;
  showSafeArea: boolean;
  showGuides: boolean;
  onTransformFrame: (transform: Transform) => void;
  onTransformCommit: (transform: Transform) => void;
};

type DragState = {
  pointerId: number;
  startPointer: Point;
  startTransform: Transform;
};

type PinchState = {
  distance: number;
  center: Point;
  startTransform: Transform;
};

const distanceBetween = (first: Point, second: Point): number =>
  Math.hypot(first.x - second.x, first.y - second.y);

const midpoint = (first: Point, second: Point): Point => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

export const CropCanvas = ({
  sourceImage,
  preset,
  transform,
  borderRadius,
  roundCorners,
  fitMode,
  showSafeArea,
  showGuides,
  onTransformFrame,
  onTransformCommit,
}: CropCanvasProps) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef<Transform>(transform);
  const dragRef = useRef<DragState | null>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const drawFrameRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (sourceImage) {
      renderCroppedImage({
        sourceImage,
        transform: transformRef.current,
        preset,
        borderRadius,
        roundCorners,
        fitMode,
        targetCanvas: canvas,
      });
    }
  }, [borderRadius, fitMode, preset, roundCorners, sourceImage]);

  const scheduleDraw = useCallback(() => {
    if (drawFrameRef.current !== null) return;
    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      draw();
      if (sourceImage) onTransformFrame(transformRef.current);
    });
  }, [draw, onTransformFrame, sourceImage]);

  useEffect(() => {
    transformRef.current = transform;
    scheduleDraw();
  }, [scheduleDraw, transform]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const observer = new ResizeObserver(scheduleDraw);
    observer.observe(surface);
    window.addEventListener('resize', scheduleDraw);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleDraw);
      if (drawFrameRef.current !== null) window.cancelAnimationFrame(drawFrameRef.current);
    };
  }, [scheduleDraw]);

  const toPresetPoint = useCallback((clientX: number, clientY: number): Point => {
    const surface = surfaceRef.current;
    if (!surface) return { x: 0, y: 0 };
    const bounds = surface.getBoundingClientRect();
    return {
      x: ((clientX - bounds.left) / Math.max(1, bounds.width)) * preset.width,
      y: ((clientY - bounds.top) / Math.max(1, bounds.height)) * preset.height,
    };
  }, [preset.height, preset.width]);

  const updateAroundPoint = useCallback((point: Point, nextScale: number, currentTransform: Transform): Transform => {
    if (!sourceImage) return currentTransform;
    const current = getDrawMetrics(sourceImage, currentTransform, preset, fitMode);
    const relativeX = (point.x - current.left) / Math.max(1, current.imageWidth);
    const relativeY = (point.y - current.top) / Math.max(1, current.imageHeight);
    const fitScale = getFitScale(sourceImage, preset, fitMode);
    const nextWidth = sourceImage.naturalWidth * fitScale * nextScale;
    const nextHeight = sourceImage.naturalHeight * fitScale * nextScale;
    const nextLeft = point.x - relativeX * nextWidth;
    const nextTop = point.y - relativeY * nextHeight;
    return clampTransform(sourceImage, {
      scale: nextScale,
      x: nextLeft - (preset.width - nextWidth) / 2,
      y: nextTop - (preset.height - nextHeight) / 2,
    }, preset, fitMode);
  }, [fitMode, preset, sourceImage]);

  const setFrameTransform = useCallback((next: Transform) => {
    transformRef.current = next;
    scheduleDraw();
  }, [scheduleDraw]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sourceImage) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        startPointer: point,
        startTransform: transformRef.current,
      };
    } else if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = {
        distance: Math.max(1, distanceBetween(first, second)),
        center: midpoint(first, second),
        startTransform: transformRef.current,
      };
      dragRef.current = null;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sourceImage || !pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = Math.max(1, distanceBetween(first, second));
      const point = toPresetPoint(pinchRef.current.center.x, pinchRef.current.center.y);
      const nextScale = Math.min(3, Math.max(1, pinchRef.current.startTransform.scale * (distance / pinchRef.current.distance)));
      setFrameTransform(updateAroundPoint(point, nextScale, pinchRef.current.startTransform));
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    const bounds = surface.getBoundingClientRect();
    const delta = {
      x: ((event.clientX - drag.startPointer.x) / Math.max(1, bounds.width)) * preset.width,
      y: ((event.clientY - drag.startPointer.y) / Math.max(1, bounds.height)) * preset.height,
    };
    setFrameTransform(clampTransform(sourceImage, {
      ...drag.startTransform,
      x: drag.startTransform.x + delta.x,
      y: drag.startTransform.y + delta.y,
    }, preset, fitMode));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size === 1) {
      const [remainingId, remainingPoint] = [...pointersRef.current.entries()][0];
      dragRef.current = {
        pointerId: remainingId,
        startPointer: remainingPoint,
        startTransform: transformRef.current,
      };
      pinchRef.current = null;
    } else {
      dragRef.current = null;
      pinchRef.current = null;
      onTransformCommit(transformRef.current);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!sourceImage) return;
    event.preventDefault();
    const point = toPresetPoint(event.clientX, event.clientY);
    const factor = Math.exp(-event.deltaY * 0.0012);
    const nextScale = Math.min(3, Math.max(1, transformRef.current.scale * factor));
    setFrameTransform(updateAroundPoint(point, nextScale, transformRef.current));
    onTransformCommit(transformRef.current);
  };

  return (
    <div className="crop-stage">
      <div
        ref={surfaceRef}
        className={`crop-surface${sourceImage ? '' : ' is-empty'}`}
        style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="crop-canvas" aria-label="图片裁剪画布" />
        {!sourceImage && (
          <div className="canvas-empty-state">
            <div className="empty-icon"><span>＋</span></div>
            <strong>拖入或打开图片</strong>
            <span>支持 JPG、PNG、WebP，也可以直接粘贴</span>
          </div>
        )}
        {sourceImage && (
          <div className="crop-visual-overlay" aria-hidden="true">
            {showSafeArea && <div className="safe-area-box" />}
            {showGuides && <><div className="guide-line guide-vertical" /><div className="guide-line guide-horizontal" /></>}
            <div className="crop-outline" />
            <span className="crop-handle handle-tl" />
            <span className="crop-handle handle-tm" />
            <span className="crop-handle handle-tr" />
            <span className="crop-handle handle-ml" />
            <span className="crop-handle handle-mr" />
            <span className="crop-handle handle-bl" />
            <span className="crop-handle handle-bm" />
            <span className="crop-handle handle-br" />
          </div>
        )}
      </div>
    </div>
  );
};
