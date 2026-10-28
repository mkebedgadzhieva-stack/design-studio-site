import { useEffect, useState } from "react";
import { createDelayedFlag, LOADER_DELAY_MS } from "./delayedFlag.js";

// true, только если `pending` держится дольше delayMs.
// `pending` должен описывать ТОЛЬКО критичные для текущего экрана запросы
// (данные раздела, загрузку кода раздела) — не аналитику и не фоновые запросы.
// delayMs фиксируется при первом рендере.
export function useDelayedPending(pending, { delayMs = LOADER_DELAY_MS } = {}) {
  const [visible, setVisible] = useState(false);
  const [flag] = useState(() =>
    createDelayedFlag({ delayMs, onChange: setVisible })
  );

  useEffect(() => {
    flag.update(pending);
  }, [flag, pending]);

  useEffect(() => () => flag.cancel(), [flag]);

  // Готовый контент показывается сразу, даже до того как эффект сбросит флаг.
  return pending && visible;
}
