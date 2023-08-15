function useLocalStorage(key: string, value: string | undefined) {
  // const { key, value } = props;
  // useEffect(() => {
  //   localStorage.setItem(key, value!);
  // }, [key, value]);
  // if (typeof window !== "undefined") return;
  function setLocal(value: string) {
    localStorage.setItem(key, value!);
  }
  function deleteLocal() {
    localStorage.removeItem(key);
  }
  // const getLocal = window.localStorage?.getItem(key);
  return { setLocal, deleteLocal };
}

export default useLocalStorage;
