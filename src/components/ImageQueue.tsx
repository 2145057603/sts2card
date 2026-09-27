import type { LoadedImage } from '../types/crop';
import { Icon } from './Icon';

type ImageQueueProps = {
  items: LoadedImage[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onDelete: () => void;
};

export const ImageQueue = ({
  items,
  activeId,
  onSelect,
  onPrevious,
  onNext,
  onDelete,
}: ImageQueueProps) => {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const displayIndex = items.length ? activeIndex + 1 : 0;

  return (
    <section className="queue-panel panel">
      <div className="queue-header">
        <div className="queue-title"><strong>图片队列</strong><span>{displayIndex} / {items.length}</span></div>
        <div className="queue-actions">
          <button className="secondary-button queue-nav" type="button" onClick={onPrevious} disabled={activeIndex <= 0}>
            <Icon name="chevronLeft" size={16} /> 上一张
          </button>
          <button className="secondary-button queue-nav" type="button" onClick={onNext} disabled={activeIndex < 0 || activeIndex >= items.length - 1}>
            下一张 <Icon name="chevronRight" size={16} />
          </button>
          <span className="queue-divider" />
          <button className="square-button danger-button" type="button" onClick={onDelete} disabled={!items.length} title="删除当前图片" aria-label="删除当前图片">
            <Icon name="trash" size={17} />
          </button>
        </div>
      </div>
      <div className="thumbnail-strip" role="list" aria-label="图片队列">
        {items.length === 0 && <span className="queue-empty">导入图片后会显示在这里</span>}
        {items.map((item, index) => (
          <button
            key={item.id}
            className={`thumbnail-card${item.id === activeId ? ' is-active' : ''}`}
            type="button"
            onClick={() => onSelect(item.id)}
            role="listitem"
            aria-label={`第 ${index + 1} 张：${item.fileName}`}
            title={item.fileName}
          >
            <img src={item.thumbnailUrl} alt="" />
            <span>{index + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
