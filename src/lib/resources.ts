import type { SceneConfig } from '../scenes/types';
import { characterSprites } from '../character/types';

const ready = new Set<string>();
export function loadImage(src: string, signal: AbortSignal, timeout = 12000): Promise<void> {
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  if (ready.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const image = new Image();
    let done = false;
    const timer = setTimeout(() => finish(new Error('森林还没准备好，请重试。')), timeout);
    const abort = () => finish(new DOMException('Aborted', 'AbortError'));
    function finish(error?: Error) {
      if (done) return;
      done = true; clearTimeout(timer); signal.removeEventListener('abort', abort);
      image.onload = null; image.onerror = null;
      if (error) { image.src = ''; reject(error); }
      else { ready.add(src); resolve(); }
    }
    image.onload = () => { void image.decode().then(() => finish(), () => finish(new Error('图片解码失败，请重试。'))); };
    image.onerror = () => finish(new Error('森林素材暂时没有加载成功，请再试一次。'));
    signal.addEventListener('abort', abort, { once: true });
    image.src = src;
  });
}
export function coreAssets(scene: SceneConfig) {
  return [scene.layers.find(layer => layer.id === 'background')!.src, characterSprites.idle];
}
export function optionalAssets(scene: SceneConfig) {
  return [
    ...scene.layers.filter(layer => layer.id !== 'background').map(layer => layer.src),
    ...Object.values(characterSprites).filter(src => src !== characterSprites.idle),
    scene.interactions.mushroom.src,
  ];
}
export async function prepareScene(scene: SceneConfig, signal: AbortSignal, progress?: (done: number, total: number) => void) {
  const assets = coreAssets(scene);
  let complete = 0;
  progress?.(0, assets.length);
  await Promise.all(assets.map(async src => {
    await loadImage(src, signal);
    if (!signal.aborted) progress?.(++complete, assets.length);
  }));
}
export function warmOptionalAssets(scene: SceneConfig, signal: AbortSignal) {
  void Promise.allSettled(optionalAssets(scene).map(src => loadImage(src, signal)));
}
