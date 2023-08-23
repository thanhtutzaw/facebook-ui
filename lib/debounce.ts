export function debounce(fun: () => Promise<void>, time: number) {
  setTimeout(() => {
    fun();
  }, time);
}
