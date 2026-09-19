import { useCallback, useEffect, useRef, useState } from 'react';
import type { Reaction } from '../audio/ForestAudio';
import type { CharacterRequest } from '../character/types';
import type { InteractionEvent, SceneConfig } from '../scenes/types';

export function useSceneInteractions(scene: SceneConfig, active: boolean, arrival: number, sound: (kind: Reaction) => void) {
  const [request, setRequest] = useState<CharacterRequest | null>(null);
  const serial = useRef(0), handledArrival = useRef(0);
  const emit = useCallback((event: InteractionEvent) => {
    if (!active) return;
    if (event === 'mushroom' || event === 'water') sound(event);
    const action = scene.reactions[event];
    if (action) setRequest({ id: ++serial.current, action });
  }, [active, scene.reactions, sound]);
  useEffect(() => { if (!active) setRequest(null); }, [active]);
  useEffect(() => {
    if (!active || arrival === handledArrival.current) return;
    handledArrival.current = arrival; emit('enter');
  }, [active, arrival, emit]);
  return { request, emit };
}
