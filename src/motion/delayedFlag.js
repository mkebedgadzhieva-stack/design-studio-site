// Логика порога загрузчика без React — чтобы её можно было проверить тестами.
// Флаг становится видимым, только если ожидание длится дольше delayMs,
// и скрывается сразу, как только ожидание закончилось (без доигрывания анимации).

export const LOADER_DELAY_MS = 500;

export function createDelayedFlag({
  delayMs = LOADER_DELAY_MS,
  onChange,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  let timer = null;
  let visible = false;

  function setVisible(next) {
    if (next === visible) return;
    visible = next;
    onChange(next);
  }

  function cancel() {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  }

  return {
    // pending=true запускает отсчёт (повторный вызов его не перезапускает),
    // pending=false отменяет отсчёт и сразу скрывает флаг.
    update(pending) {
      if (pending) {
        if (timer === null && !visible) {
          timer = setTimer(() => {
            timer = null;
            setVisible(true);
          }, delayMs);
        }
        return;
      }
      cancel();
      setVisible(false);
    },
    // Размонтирование / отмена перехода: таймер больше не сработает.
    cancel,
    get visible() {
      return visible;
    },
  };
}
