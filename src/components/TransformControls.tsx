import { Icon } from './Icon';
import type { Transform } from '../types/crop';

type TransformControlsProps = {
  transform: Transform;
  onScaleChange: (scale: number) => void;
  onPositionChange: (position: { x?: number; y?: number }) => void;
  onReset: () => void;
  onNudge: (direction: 'left' | 'right' | 'up' | 'down', large?: boolean) => void;
};

export const TransformControls = ({
  transform,
  onScaleChange,
  onPositionChange,
  onReset,
  onNudge,
}: TransformControlsProps) => (
  <section className="settings-section transform-section">
    <h2 className="section-title"><span>4.</span> 图片调整</h2>
    <div className="control-label-row">
      <span>缩放</span>
      <strong>{Math.round(transform.scale * 100)}%</strong>
    </div>
    <div className="scale-row">
      <button className="square-button" type="button" onClick={() => onScaleChange(transform.scale - 0.05)} title="缩小" aria-label="缩小">
        <Icon name="minus" size={16} />
      </button>
      <input
        className="scale-range"
        type="range"
        min="1"
        max="3"
        step="0.01"
        value={transform.scale}
        onChange={(event) => onScaleChange(Number(event.target.value))}
        aria-label="图片缩放"
      />
      <button className="square-button" type="button" onClick={() => onScaleChange(transform.scale + 0.05)} title="放大" aria-label="放大">
        <Icon name="plus" size={16} />
      </button>
    </div>
    <div className="control-label-row position-heading">
      <span>位置</span>
      <div className="position-values">
        <span>X：{Math.round(transform.x)}</span>
        <span>Y：{Math.round(transform.y)}</span>
      </div>
      <button className="mini-button" type="button" onClick={onReset}>重置</button>
    </div>
    <div className="align-buttons">
      <button className="secondary-button" type="button" onClick={() => onPositionChange({ x: 0, y: 0 })}>居中</button>
      <button className="secondary-button" type="button" onClick={() => onPositionChange({ y: -40 })}>偏上</button>
      <button className="secondary-button" type="button" onClick={() => onPositionChange({ y: 40 })}>偏下</button>
    </div>
    <div className="nudge-grid" aria-label="方向键微调">
      <span />
      <button className="square-button" type="button" onClick={() => onNudge('up')} aria-label="向上移动"><Icon name="arrowUp" size={16} /></button>
      <span />
      <button className="square-button" type="button" onClick={() => onNudge('left')} aria-label="向左移动"><Icon name="arrowLeft" size={16} /></button>
      <span className="nudge-center" />
      <button className="square-button" type="button" onClick={() => onNudge('right')} aria-label="向右移动"><Icon name="arrowRight" size={16} /></button>
      <span />
      <button className="square-button" type="button" onClick={() => onNudge('down')} aria-label="向下移动"><Icon name="arrowDown" size={16} /></button>
      <span />
    </div>
  </section>
);
