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
          <label className="block text-sm font-medium text-text-primary">
            {label}
          </label>
          <span className="text-sm font-semibold text-text-primary bg-background-subtle/50 px-2.5 py-1 rounded-md font-mono">
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
            w-full h-2 bg-background-subtle/30 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-blue-600
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:bg-blue-600
            [&::-moz-range-thumb]:hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background
          "
          style={{
            background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${percentage}%, rgba(51, 65, 85, 0.3) ${percentage}%, rgba(51, 65, 85, 0.3) 100%)`,
          }}
          {...props}
        />
      </div>
      {helperText && (
        <p className="mt-1.5 text-sm text-text-muted">{helperText}</p>
      )}
    </div>
  );
}

