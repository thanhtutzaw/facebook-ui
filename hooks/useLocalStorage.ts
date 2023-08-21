function useLocalStorage(key: string, value: string | undefined) {
  function setLocal(value: string) {
    localStorage.setItem(key, value!);
  }
  function deleteLocal() {
    localStorage.removeItem(key);
  }
  return { setLocal, deleteLocal };
}

export default useLocalStorage;
