import { useState, useCallback, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';

interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string;
  helperText?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
}

export function RangeSlider({
  label,
  helperText,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  className,
  ...props
}: RangeSliderProps) {
  const [displayValue, setDisplayValue] = useState(value);

  // Sync display value when value prop changes externally
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      setDisplayValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const formatDisplay = formatValue || ((val: number) => val.toString());
  const percentage = ((displayValue - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className || ''}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
          <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
            {formatDisplay(displayValue)}
          </span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          className="
            w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-blue-600
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-blue-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:bg-blue-600
            [&::-moz-range-thumb]:hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
          style={{
            background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${percentage}%, rgb(226, 232, 240) ${percentage}%, rgb(226, 232, 240) 100%)`,
          }}
          {...props}
        />
      </div>
      {helperText && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

