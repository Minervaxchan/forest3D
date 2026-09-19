import { forest } from './forest';
import type { SceneConfig, SceneId } from './types';

export const sceneCatalog: { id: SceneId; name: string; invitation: string; icon: string }[] = [
  { id: 'forest', name: '日光森林', invitation: '走向日光', icon: '☀' },
  { id: 'nightForest', name: '萤火之森', invitation: '去看萤火', icon: '☾' },
];
const loaders: Record<SceneId, () => Promise<SceneConfig>> = {
  forest: () => Promise.resolve(forest),
  nightForest: async () => (await import('./nightForest')).nightForest,
};
export function loadScene(id: SceneId) { return loaders[id](); }
export function nextScene(id: SceneId) {
  return sceneCatalog[(sceneCatalog.findIndex(scene => scene.id === id) + 1) % sceneCatalog.length];
}
