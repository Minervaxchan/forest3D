import { useEffect, useState } from 'react';
import type { SceneConfig } from '../scenes/types';
import { prepareScene, warmOptionalAssets } from '../lib/resources';

export function useEntryResources(scene: SceneConfig) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading'); setMessage(''); setProgress(0);
    void prepareScene(scene, controller.signal, (done, total) => setProgress(done / total))
      .then(() => {
        if (controller.signal.aborted) return;
        setStatus('ready'); warmOptionalAssets(scene, controller.signal);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setStatus('error'); setMessage(error instanceof Error ? error.message : '加载失败，请重试。');
        controller.abort();
      });
    return () => controller.abort();
  }, [scene, attempt]);
  return { attempt, status, progress, message, retry: () => setAttempt(value => value + 1) };
}
