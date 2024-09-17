import { useState } from 'react';
import { generatePalette } from '../app/utils/colorUtils';

interface ControlsProps {
  colorCount: number;
  setColorCount: (count: number) => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  hueRange: number[];
  setHueRange: (range: number[]) => void;
  onGenerateNewPalette: (palette: string[]) => void;
  currentPalette: string[];
  lockedColors: boolean[];
}

export default function Controls({
  colorCount,
  setColorCount,
  brightness,
  setBrightness,
  hueRange,
  setHueRange,
  onGenerateNewPalette,
  currentPalette,
  lockedColors,
}: ControlsProps) {
  const [isFocused, setIsFocused] = useState(false);

  const incrementCount = () => {
    setColorCount(Math.min(colorCount + 1, 10));
  };

  const decrementCount = () => {
    setColorCount(Math.max(colorCount - 1, 1));
  };

  const handleGenerateNewPalette = () => {
    const newPalette = generatePalette(
      colorCount,
      brightness,
      hueRange,
      currentPalette,
      lockedColors
    );
    onGenerateNewPalette(newPalette);
  };

  return (
    <div className="w-full mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <label htmlFor="colorCount" className="block text-sm font-medium text-gray-300 mb-2">
            Number of Colors
          </label>
          <div className={`relative flex items-center bg-gray-800 rounded-md ${isFocused ? 'ring-2 ring-blue-500' : 'border border-gray-700'}`}>
            <button
              onClick={decrementCount}
              className="px-3 py-2 text-gray-400 hover:text-white focus:outline-none"
            >
              -
            </button>
            <input
              type="number"
              id="colorCount"
              min="1"
              max="10"
              value={colorCount}
              onChange={(e) => setColorCount(parseInt(e.target.value, 10))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent text-center text-white focus:outline-none"
            />
            <button
              onClick={incrementCount}
              className="px-3 py-2 text-gray-400 hover:text-white focus:outline-none"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="brightness" className="block text-sm font-medium text-gray-300 mb-2">
            Brightness
          </label>
          <input
            type="range"
            id="brightness"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor="hueRange" className="block text-sm font-medium text-gray-300 mb-2">
            Hue Range
          </label>
          <input
            type="range"
            id="hueRange"
            min="0"
            max="360"
            value={hueRange[1]}
            onChange={(e) => setHueRange([hueRange[0], parseInt(e.target.value, 10)])}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      <button
        onClick={handleGenerateNewPalette}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-300 ease-in-out tracking-wide"
      >
        Generate New Palette
      </button>
    </div>
  );
}
