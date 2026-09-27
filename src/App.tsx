import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CornerSettings } from './components/CornerSettings';
import { DisplayHelpers } from './components/DisplayHelpers';
import { FitControls } from './components/FitControls';
import { Icon } from './components/Icon';
import { PreviewPanel, type PreviewPanelHandle } from './components/PreviewPanel';
import { PresetSelector } from './components/PresetSelector';
import { TopToolbar } from './components/TopToolbar';
import { TransformControls } from './components/TransformControls';
import { CropWorkspace } from './components/CropWorkspace';
import { getPreset, type CropPreset } from './config/presets';
import type { FitMode, LoadedImage, PersistedSettings, Transform } from './types/crop';
import { clampTransform } from './utils/canvasRenderer';
import { copyExportToClipboard, downloadExport } from './utils/exportImage';
import { createInitialTransform, isSupportedImage, loadImageFile, revokeImage } from './utils/imageLoader';

const SETTINGS_KEY = 'sts2-card-cropper-settings-v1';

const defaultSettings: PersistedSettings = {
  presetId: 'original',
  roundCorners: true,
  showSafeArea: true,
  showGuides: true,
  fitMode: 'cover',
  customRadiusByPreset: {},
};

const loadSettings = (): PersistedSettings => {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    const presetId = parsed.presetId === 'alternate' ? 'alternate' : 'original';
    const fitMode: FitMode = parsed.fitMode === 'width' || parsed.fitMode === 'height' ? parsed.fitMode : 'cover';
    return {
      ...defaultSettings,
      ...parsed,
      presetId,
      fitMode,
      customRadiusByPreset: parsed.customRadiusByPreset ?? {},
    };
  } catch {
    return defaultSettings;
  }
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches('input, textarea, select, [contenteditable="true"]');
};

const sameTransform = (left: Transform, right: Transform): boolean =>
  left.x === right.x && left.y === right.y && left.scale === right.scale;

type Toast = { message: string; tone?: 'default' | 'error' };

export default function App() {
  const [settings, setSettings] = useState<PersistedSettings>(() => loadSettings());
  const [items, setItems] = useState<LoadedImage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>(createInitialTransform());
  const [themeIsDim, setThemeIsDim] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<PreviewPanelHandle>(null);
  const itemsRef = useRef<LoadedImage[]>([]);
  const transformRef = useRef<Transform>(transform);
  const lastCommittedTransformRef = useRef<Transform>(transform);
  const undoStackRef = useRef<Transform[]>([]);
  const redoStackRef = useRef<Transform[]>([]);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const activeImage = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items],
  );
  const preset = getPreset(settings.presetId);
  const borderRadius = Math.min(
    Math.floor(Math.min(preset.width, preset.height) / 2),
    Math.max(0, settings.customRadiusByPreset[preset.id] ?? preset.borderRadius),
  );

  const notify = useCallback((message: string, tone: Toast['tone'] = 'default') => {
    setToast({ message, tone });
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Private browsing modes can disable localStorage; editing still works.
    }
  }, [settings]);

  useEffect(() => () => {
    itemsRef.current.forEach(revokeImage);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const item = items.find((candidate) => candidate.id === activeId);
    const next = item?.transform ?? createInitialTransform();
    transformRef.current = next;
    lastCommittedTransformRef.current = next;
    setTransform(next);
    undoStackRef.current = [];
    redoStackRef.current = [];
  }, [activeId]);

  const updateItemTransform = useCallback((next: Transform) => {
    if (!activeId) return;
    setItems((current) => current.map((item) => (
      item.id === activeId ? { ...item, transform: next } : item
    )));
  }, [activeId]);

  const commitTransform = useCallback((next: Transform, recordHistory = true) => {
    if (!activeImage) return;
    const normalized = clampTransform(activeImage.image, next, preset, settings.fitMode);
    const previous = lastCommittedTransformRef.current;
    if (recordHistory && !sameTransform(previous, normalized)) {
      undoStackRef.current = [...undoStackRef.current.slice(-19), previous];
      redoStackRef.current = [];
    }
    transformRef.current = normalized;
    lastCommittedTransformRef.current = normalized;
    setTransform(normalized);
    updateItemTransform(normalized);
    previewRef.current?.draw(normalized);
  }, [activeImage, preset, settings.fitMode, updateItemTransform]);

  const handleTransformFrame = useCallback((next: Transform) => {
    transformRef.current = next;
    previewRef.current?.draw(next);
  }, []);

  const handleReset = useCallback(() => {
    commitTransform(createInitialTransform());
  }, [commitTransform]);

  const handleNudge = useCallback((direction: 'left' | 'right' | 'up' | 'down', large = false) => {
    const distance = large ? 16 : 2;
    const next = { ...transformRef.current };
    if (direction === 'left') next.x -= distance;
    if (direction === 'right') next.x += distance;
    if (direction === 'up') next.y -= distance;
    if (direction === 'down') next.y += distance;
    commitTransform(next);
  }, [commitTransform]);

  const handleScaleChange = useCallback((scale: number) => {
    commitTransform({ ...transformRef.current, scale });
  }, [commitTransform]);

  const handlePositionChange = useCallback((position: { x?: number; y?: number }) => {
    commitTransform({
      ...transformRef.current,
      x: position.x ?? transformRef.current.x,
      y: position.y ?? transformRef.current.y,
    });
  }, [commitTransform]);

  const addFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(isSupportedImage);
    if (!imageFiles.length) {
      notify('请选择 JPG、PNG 或 WebP 图片', 'error');
      return;
    }
    const results = await Promise.allSettled(imageFiles.map(loadImageFile));
    const loaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
    if (!loaded.length) {
      notify('图片读取失败，请换一张图片重试', 'error');
      return;
    }
    setItems((current) => [...current, ...loaded]);
    setActiveId(loaded[0].id);
    if (loaded.length < imageFiles.length) notify('部分图片无法读取，已跳过', 'error');
    else notify(`已加入 ${loaded.length} 张图片`);
  }, [notify]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles([...event.target.files]);
    event.target.value = '';
  };

  const handlePasteButton = useCallback(async () => {
    if (!navigator.clipboard?.read) {
      notify('请使用 Ctrl+V 粘贴图片', 'error');
      return;
    }
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await clipboardItem.getType(imageType);
          files.push(new File([blob], `pasted-${Date.now()}.png`, { type: imageType }));
        }
      }
      if (files.length) void addFiles(files);
      else notify('剪贴板中没有图片', 'error');
    } catch {
      notify('无法读取剪贴板，请使用 Ctrl+V 粘贴图片', 'error');
    }
  }, [addFiles, notify]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const files = [...(event.clipboardData?.files ?? [])].filter(isSupportedImage);
      if (files.length) {
        event.preventDefault();
        void addFiles(files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addFiles]);

  const handlePresetSelect = useCallback((nextPreset: CropPreset) => {
    setSettings((current) => ({ ...current, presetId: nextPreset.id }));
    if (activeImage) {
      const next = clampTransform(activeImage.image, createInitialTransform(), nextPreset, settings.fitMode);
      commitTransform(next);
    }
  }, [activeImage, commitTransform, settings.fitMode]);

  const handleFitModeChange = useCallback((fitMode: FitMode) => {
    setSettings((current) => ({ ...current, fitMode }));
    if (activeImage) {
      const next = clampTransform(activeImage.image, createInitialTransform(), preset, fitMode);
      commitTransform(next);
    }
  }, [activeImage, commitTransform, preset]);

  const handleRadiusChange = useCallback((radius: number) => {
    setSettings((current) => ({
      ...current,
      customRadiusByPreset: { ...current.customRadiusByPreset, [preset.id]: radius },
    }));
  }, [preset.id]);

  const selectImage = useCallback((id: string) => setActiveId(id), []);

  const goPrevious = useCallback(() => {
    const index = items.findIndex((item) => item.id === activeId);
    if (index > 0) setActiveId(items[index - 1].id);
  }, [activeId, items]);

  const goNext = useCallback(() => {
    const index = items.findIndex((item) => item.id === activeId);
    if (index >= 0 && index < items.length - 1) setActiveId(items[index + 1].id);
  }, [activeId, items]);

  const deleteCurrent = useCallback(() => {
    const index = items.findIndex((item) => item.id === activeId);
    if (index < 0) return;
    const target = items[index];
    revokeImage(target);
    const nextItems = items.filter((item) => item.id !== target.id);
    setItems(nextItems);
    setActiveId(nextItems[index]?.id ?? nextItems[index - 1]?.id ?? null);
    notify('已移除当前图片');
  }, [activeId, items, notify]);

  const handleUndo = useCallback(() => {
    const previous = undoStackRef.current.pop();
    if (!previous) return;
    redoStackRef.current.push(transformRef.current);
    commitTransform(previous, false);
  }, [commitTransform]);

  const handleRedo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    undoStackRef.current.push(transformRef.current);
    commitTransform(next, false);
  }, [commitTransform]);

  const handleDownload = useCallback(async () => {
    if (!activeImage) {
      notify('请先导入图片', 'error');
      return;
    }
    try {
      await downloadExport({
        sourceImage: activeImage.image,
        transform: transformRef.current,
        preset,
        borderRadius,
        roundCorners: settings.roundCorners,
        fitMode: settings.fitMode,
        fileName: activeImage.fileName,
      });
      notify('PNG 已下载');
    } catch {
      notify('PNG 导出失败，请重试', 'error');
    }
  }, [activeImage, borderRadius, notify, preset, settings.fitMode, settings.roundCorners]);

  const handleCopy = useCallback(async () => {
    if (!activeImage) return;
    try {
      await copyExportToClipboard({
        sourceImage: activeImage.image,
        transform: transformRef.current,
        preset,
        borderRadius,
        roundCorners: settings.roundCorners,
        fitMode: settings.fitMode,
      });
      notify('已复制到剪贴板');
    } catch {
      notify('当前浏览器不支持图片剪贴板，请使用下载 PNG', 'error');
    }
  }, [activeImage, borderRadius, notify, preset, settings.fitMode, settings.roundCorners]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        inputRef.current?.click();
        return;
      }
      if (modifier && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void handleDownload();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleReset();
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const direction = event.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down';
        handleNudge(direction, event.shiftKey);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload, handleNudge, handleRedo, handleReset, handleUndo]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (event.dataTransfer.files.length) void addFiles([...event.dataTransfer.files]);
  };

  return (
    <div
      className={`app-shell${themeIsDim ? ' is-dim' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setIsDraggingFiles(true); }}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDraggingFiles(false); }}
      onDrop={handleDrop}
    >
      <TopToolbar
        onOpen={() => inputRef.current?.click()}
        onPaste={() => void handlePasteButton()}
        onDownload={() => void handleDownload()}
        onReset={handleReset}
        onNudge={handleNudge}
        onTheme={() => setThemeIsDim((value) => !value)}
        onSettings={() => notify('设置会随浏览器自动保存')}
        themeIsDim={themeIsDim}
      />
      <main className="app-body">
        <aside className="left-column panel settings-panel">
          <PresetSelector selectedPresetId={preset.id} onSelect={handlePresetSelect} />
          <CornerSettings
            enabled={settings.roundCorners}
            radius={borderRadius}
            preset={preset}
            onEnabledChange={(roundCorners) => setSettings((current) => ({ ...current, roundCorners }))}
            onRadiusChange={handleRadiusChange}
          />
          <FitControls value={settings.fitMode} onChange={handleFitModeChange} />
          <TransformControls
            transform={transform}
            onScaleChange={handleScaleChange}
            onPositionChange={handlePositionChange}
            onReset={handleReset}
            onNudge={handleNudge}
          />
          <DisplayHelpers
            showSafeArea={settings.showSafeArea}
            showGuides={settings.showGuides}
            onSafeAreaChange={(showSafeArea) => setSettings((current) => ({ ...current, showSafeArea }))}
            onGuidesChange={(showGuides) => setSettings((current) => ({ ...current, showGuides }))}
          />
        </aside>

        <CropWorkspace
          activeImage={activeImage}
          items={items}
          activeId={activeId}
          preset={preset}
          transform={transform}
          borderRadius={borderRadius}
          roundCorners={settings.roundCorners}
          fitMode={settings.fitMode}
          showSafeArea={settings.showSafeArea}
          showGuides={settings.showGuides}
          onTransformFrame={handleTransformFrame}
          onTransformCommit={(next) => commitTransform(next)}
          onSelect={selectImage}
          onPrevious={goPrevious}
          onNext={goNext}
          onDelete={deleteCurrent}
        />

        <aside className="right-column">
          <PreviewPanel
            ref={previewRef}
            sourceImage={activeImage?.image ?? null}
            preset={preset}
            transform={transform}
            borderRadius={borderRadius}
            roundCorners={settings.roundCorners}
            fitMode={settings.fitMode}
            onDownload={() => void handleDownload()}
            onCopy={() => void handleCopy()}
          />
        </aside>
      </main>

      <input ref={inputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileInput} />
      {isDraggingFiles && <div className="drop-overlay"><Icon name="upload" size={34} /><strong>松开以加入图片队列</strong><span>支持多张 JPG、PNG、WebP</span></div>}
      {toast && <div className={`toast${toast.tone === 'error' ? ' is-error' : ''}`} role="status">{toast.message}</div>}
    </div>
  );
}
