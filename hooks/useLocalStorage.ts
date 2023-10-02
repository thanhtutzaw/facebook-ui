import { useCallback, useEffect } from "react";
/**
 * A hook that store , get and delete LocalStorage
 * @param key
 * @param value
 */
export default function useLocalStorage<T>(key: string, value: T) {
  const stringifiedValue = JSON.stringify(value);
  // useEffect(() => {
  //   function setLocal() {
  //     // if (!value) return;
  //     localStorage.setItem(key, stringifiedValue);
  //   }
  //   setLocal();
  //   return () => {
  //     setLocal();
  //   };
  // }, [stringifiedValue, key]);
  function setLocal(value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const getLocal = useCallback((): T | null => {
    const value = localStorage.getItem(key);
    // console.log(value ? JSON.parse(value) : null);
    return value ? JSON.parse(value) : null;
  }, [key]);
  function deleteLocal() {
    localStorage.removeItem(key);
  }
  return { getLocal, deleteLocal, setLocal };
}
