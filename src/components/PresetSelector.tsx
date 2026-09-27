import { formatRatio, type CropPreset, presetList } from '../config/presets';
import { Icon } from './Icon';

type PresetSelectorProps = {
  selectedPresetId: string;
  onSelect: (preset: CropPreset) => void;
};

export const PresetSelector = ({ selectedPresetId, onSelect }: PresetSelectorProps) => (
  <section className="settings-section preset-section">
    <h2 className="section-title"><span>1.</span> 选择尺寸预设</h2>
    <div className="preset-list">
      {presetList.map((preset) => {
        const selected = preset.id === selectedPresetId;
        return (
          <button
            key={preset.id}
            className={`preset-card${selected ? ' is-selected' : ''}`}
            type="button"
            onClick={() => onSelect(preset)}
            aria-pressed={selected}
          >
            <span className="preset-icon"><Icon name={preset.icon} size={24} /></span>
            <span className="preset-copy">
              <strong>{preset.name}</strong>
              <span>{preset.width} × {preset.height} <em>({formatRatio(preset)})</em></span>
              <span>圆角：{preset.borderRadius} px</span>
            </span>
          </button>
        );
      })}
    </div>
  </section>
);
