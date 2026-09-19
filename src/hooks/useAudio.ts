import { useCallback, useEffect, useRef, useState } from 'react';
import type { SceneConfig } from '../scenes/types';
import { ForestAudio, type Reaction } from '../audio/ForestAudio';

export function useAudio(scene: SceneConfig, entered: boolean, music: boolean) {
  const engine = useRef<ForestAudio | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const unlock = useCallback(() => {
    engine.current ??= new ForestAudio();
    void engine.current.unlock().then(() => { setReady(true); setFailed(false); }).catch(() => setFailed(true));
  }, []);
  const react = useCallback((kind: Reaction) => engine.current?.react(kind), []);

  useEffect(() => () => { engine.current?.dispose(); engine.current = null; }, []);
  useEffect(() => {
    if (ready && entered) void engine.current?.play(scene).catch(() => setFailed(true));
  }, [scene, ready, entered]);
  useEffect(() => {
    const audio = engine.current;
    if (!ready || !audio) return;
    let suspend: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(suspend);
      if (document.hidden) {
        audio.fade(0, .2);
        suspend = setTimeout(() => { void audio.context?.suspend(); }, 250);
      } else {
        void audio.context?.resume().catch(() => setFailed(true));
        audio.fade(entered && music ? 1 : 0);
      }
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => { clearTimeout(suspend); document.removeEventListener('visibilitychange', update); };
  }, [entered, music, ready]);
  return { unlock, react, failed };
}
