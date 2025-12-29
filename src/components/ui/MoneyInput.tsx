import { useState, useCallback, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string;
  helperText?: string;
  value: number;
  onChange: (value: number) => void;
}

// Format number as currency string without $ symbol (e.g., 1234.56 -> "1,234")
// The $ symbol is shown as a prefix in the UI
function formatCurrency(value: number | string | object | undefined): string {
  // Handle non-number values
  if (typeof value !== 'number') {
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      value = num;
    } else {
      return '';
    }
  }
  if (isNaN(value) || value === 0) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Parse currency string to number (e.g., "$1,234.56" -> 1234.56)
function parseCurrency(value: string): number {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function MoneyInput({
  label,
  helperText,
  value,
  onChange,
  className,
  ...props
}: MoneyInputProps) {
  // Ensure value is always a number
  const numericValue = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0);
  
  const [displayValue, setDisplayValue] = useState(formatCurrency(numericValue));
  const [isFocused, setIsFocused] = useState(false);

  // Sync display value when value prop changes externally (when not focused)
  useEffect(() => {
    if (!isFocused) {
      const num = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0);
      setDisplayValue(formatCurrency(num));
    }
  }, [value, isFocused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      const numericValue = parseCurrency(inputValue);
      // Ensure we always pass a valid number
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        onChange(numericValue);
      } else {
        onChange(0);
      }
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Format the value on blur
    const num = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0);
    setDisplayValue(formatCurrency(num));
  }, [value]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    const num = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0);
    setDisplayValue(num === 0 ? '' : num.toString());
  }, [value]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-text-muted text-sm">$</span>
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={clsx(
            'fintech-input pl-7 pr-3 font-mono',
            className
          )}
          placeholder="0"
          {...props}
        />
      </div>
      {helperText && (
        <p className="mt-1.5 text-sm text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
