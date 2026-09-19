import type { SceneConfig, SceneId } from '../../scenes/types';
import { nextScene } from '../../scenes/registry';
export function SceneSwitcher({ scene, disabled, onSwitch }: {
  scene: SceneConfig; disabled: boolean; onSwitch: (id: SceneId) => void;
}) {
  const next = nextScene(scene.id);
  return <button className="glass-button scene-switcher" disabled={disabled} onClick={() => onSwitch(next.id)}
    aria-label={`切换至${next.name}`}><span className="scene-icon" aria-hidden="true">{next.icon}</span>
    <span>{next.invitation}</span><span aria-hidden="true">↗</span></button>;
}
