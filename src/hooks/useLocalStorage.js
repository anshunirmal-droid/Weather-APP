import { useEffect, useState } from 'react';
import { load, save } from '../utils/storage.js';

/** Like useState, but the value is saved to localStorage and restored on reload. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => load(key, initialValue));

  useEffect(() => {
    save(key, value);
  }, [key, value]);

  return [value, setValue];
}
