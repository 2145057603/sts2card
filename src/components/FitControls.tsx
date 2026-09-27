import type { FitMode } from '../types/crop';

type FitControlsProps = {
  value: FitMode;
  onChange: (mode: FitMode) => void;
};

const modes: Array<{ id: FitMode; label: string }> = [
  { id: 'cover', label: '填满' },
  { id: 'width', label: '适应宽度' },
  { id: 'height', label: '适应高度' },
];

export const FitControls = ({ value, onChange }: FitControlsProps) => (
  <section className="settings-section fit-section">
    <h2 className="section-title"><span>3.</span> 适配方式</h2>
    <div className="fit-buttons">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className={`secondary-button fit-button${value === mode.id ? ' is-active' : ''}`}
          onClick={() => onChange(mode.id)}
          aria-pressed={value === mode.id}
        >{mode.label}</button>
      ))}
    </div>
  </section>
);
