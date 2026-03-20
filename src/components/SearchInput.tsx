import { useCallback, useEffect, useRef, useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

const DEFAULT_DEBOUNCE_DELAY_MS = 500;

type SearchInputProps = {
  onChange: (value: string) => void;
  delay?: number;
} & Omit<TextFieldProps, 'onChange'>;

export default function SearchInput({
  onChange,
  delay = DEFAULT_DEBOUNCE_DELAY_MS,
  ...textFieldProps
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const latestValueRef = useRef(value);

  const clearDebounce = useCallback(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  const flushDebounce = useCallback(() => {
    clearDebounce();
    onChangeRef.current(latestValueRef.current);
  }, [clearDebounce]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      latestValueRef.current = newValue;

      clearDebounce();
      debounceTimer.current = setTimeout(() => {
        onChangeRef.current(newValue);
      }, delay);
    },
    [clearDebounce, delay],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        flushDebounce();
      }
    },
    [flushDebounce],
  );

  useEffect(() => clearDebounce, [clearDebounce]);

  return (
    <TextField
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...textFieldProps}
    />
  );
}
