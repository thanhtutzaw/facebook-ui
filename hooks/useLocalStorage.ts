import { useCallback } from "react";
/**
 * A hook that store , get and delete in LocalStorage
 * @param key
 * @param value
 */
export default function useLocalStorage<T>(key: string) {
  function setLocal<T>(value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const getLocal = useCallback((): T | null => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, [key]);
  const deleteLocal = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { getLocal, deleteLocal, setLocal };
}
