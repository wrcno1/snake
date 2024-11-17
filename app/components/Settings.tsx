import { GameSettings } from '../types';

interface SettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ settings, onSettingsChange, isOpen, onClose }: SettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Game Settings
        </h2>
        
        <div className="setting-group">
          <label>Board Size:</label>
          <input
            type="range"
            min="10"
            max="30"
            value={settings.boardSize}
            title="Board Size"
            onChange={(e) => onSettingsChange({
              ...settings,
              boardSize: parseInt(e.target.value)
            })}
          />
          <span>{settings.boardSize}x{settings.boardSize}</span>
        </div>

        <div className="setting-group">
          <label>Game Speed:</label>
          <input
            type="range"
            min="50"
            max="300"
            step="50"
            value={settings.gameSpeed}
            title="Game Speed"
            onChange={(e) => onSettingsChange({
              ...settings,
              gameSpeed: parseInt(e.target.value)
            })}
          />
          <span>{settings.gameSpeed}ms</span>
        </div>

        <div className="setting-group">
          <label>Snake Color:</label>
          <input
            type="color"
            value={settings.snakeColor}
            title="Snake Color"
            onChange={(e) => onSettingsChange({
              ...settings,
              snakeColor: e.target.value
            })}
          />
        </div>

        <div className="setting-group">
          <label htmlFor="controlType">Controls:</label>
          <select
            id="controlType"
            value={settings.controlType}
            onChange={(e) => onSettingsChange({
              ...settings,
              controlType: e.target.value as 'arrows' | 'wasd' | 'gamepad'
            })}
          >
            <option value="arrows">Arrow Keys</option>
            <option value="wasd">WASD</option>
            <option value="gamepad">Xbox Controller</option>
          </select>
          {settings.controlType === 'gamepad' && (
            <p className="text-sm text-gray-600 mt-1">
              Use left stick or D-pad to control the snake
            </p>
          )}
        </div>

        <div className="setting-group">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) => onSettingsChange({
                ...settings,
                musicEnabled: e.target.checked
              })}
              className="w-4 h-4 rounded"
            />
            Background Music
          </label>
          {settings.musicEnabled && (
            <div className="mt-2">
              <label className="text-sm mb-1 block">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.musicVolume}
                title="Music Volume"
                onChange={(e) => onSettingsChange({
                  ...settings,
                  musicVolume: parseFloat(e.target.value)
                })}
                className="w-full"
              />
            </div>
          )}
        </div>

        <button
          className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                   text-white rounded-lg hover:from-blue-600 hover:to-blue-700 
                   transition-all duration-200 font-semibold shadow-lg 
                   hover:shadow-blue-500/25"
          onClick={onClose}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}