import { useEffect, useRef, useState } from 'react';

export function useDiscoveryHint(active: boolean, completed: boolean) {
  const shown = useRef(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!active || completed) { setVisible(false); return; }
    if (shown.current) return;
    shown.current = true;
    const start = setTimeout(() => setVisible(true), 650);
    const end = setTimeout(() => setVisible(false), 6500);
    return () => { clearTimeout(start); clearTimeout(end); setVisible(false); };
  }, [active, completed]);
  return visible;
}
