import { useRef, type CSSProperties } from 'react';
import { forest } from '../../scenes/forest';
import { setExperience, useExperience } from '../../store/experienceStore';
import { requestOrientation, useParallax } from '../../hooks/useParallax';
import { useAudio } from '../../hooks/useAudio';
import { useEntryResources } from '../../hooks/useEntryResources';
import { useSceneTransition } from '../../hooks/useSceneTransition';
import { useSceneInteractions } from '../../hooks/useSceneInteractions';
import { useDiscoveryHint } from '../../hooks/useDiscoveryHint';
import { Character } from '../Character/Character';
import { Fireflies } from '../Fireflies/Fireflies';
import { LightString } from '../LightString/LightString';
import { AudioController } from '../AudioController/AudioController';
import { SceneSwitcher } from '../SceneSwitcher/SceneSwitcher';
import { Mushrooms } from '../Mushrooms/Mushrooms';
import { Water } from '../Water/Water';
import { Entry } from './Entry';
import './interactions.css';

export function Experience() {
  const state = useExperience(), root = useRef<HTMLDivElement>(null);
  const { scene, camera, arrival, error, go } = useSceneTransition(state.entered);
  const resources = useEntryResources(forest);
  const active = state.entered && !state.transitioning;
  const audio = useAudio(scene, state.entered, state.music);
  const interaction = useSceneInteractions(scene, active, arrival, audio.react);
  const hint = useDiscoveryHint(active, state.greeted);
  useParallax(root, active);
  const enter = () => {
    if (resources.status !== 'ready') return;
    audio.unlock(); requestOrientation(); setExperience({ entered: true, transitioning: true });
  };
  const toggleLights = () => {
    if (!active) return;
    setExperience({ lights: !state.lights }); audio.react('light');
    if (!state.lights) interaction.emit('lightOn');
  };
  return <main ref={root} className={`experience ${scene.lightMode} ${state.entered ? 'entered' : 'opening'}`}
    data-scene={scene.id} data-transitioning={state.transitioning} style={{ background: scene.background } as CSSProperties}>
    <div key={resources.attempt} ref={camera} className="camera">
      {scene.layers.filter(layer => layer.id !== 'foreground').map(layer =>
        <div key={layer.id} className={`scene-layer parallax ${layer.id}`}
          style={{ '--depth': layer.depth, backgroundImage: `url(${layer.src})` } as CSSProperties} />)}
      <div className="sun-rays" aria-hidden="true" />
      <Water key={'water-' + scene.id} config={scene.interactions.water} active={active} onInteract={() => interaction.emit('water')} />
      <LightString on={state.lights} toggle={toggleLights} active={active} />
      <Character scene={scene} active={active} request={interaction.request} onReact={audio.react} hint={hint}
        onInteract={() => setExperience({ greeted: true })} />
      <Mushrooms key={'mushroom-' + scene.id} config={scene.interactions.mushroom} active={active}
        onInteract={() => interaction.emit('mushroom')} />
      {scene.layers.filter(layer => layer.id === 'foreground').map(layer =>
        <div key={layer.id} className="scene-layer parallax foreground"
          style={{ '--depth': layer.depth, backgroundImage: `url(${layer.src})` } as CSSProperties} />)}
      <Fireflies count={scene.effects.fireflies} mobileCount={scene.effects.mobileFireflies} />
      <div className="vignette" aria-hidden="true" />
    </div>
    <header className="header">
      <a className="wordmark" href="./" aria-label="forest3D 首页"><span className="brand-symbol">✳</span> forest<span className="brand-small">3D</span><span className="edition">AN INTERACTIVE ESCAPE</span></a>
      {state.entered && <AudioController enabled={state.music} failed={audio.failed}
        toggle={() => { audio.unlock(); if (!audio.failed) setExperience({ music: !state.music }); }} />}
    </header>
    {!state.entered ? <Entry resources={resources} onEnter={enter} /> : <>
      <div className="scene-caption" aria-live="polite"><span className="eyebrow">{scene.subtitle}</span><h1>{scene.name}</h1><p>{scene.description}</p></div>
      <footer className="footer">
        <div className="explore-hint"><span className="tiny-dot" /><span className="desktop-hint">移动鼠标探索 · 轻触森林里的小惊喜</span><span className="mobile-hint">拖动探索 · 轻触森林里的小惊喜</span></div>
        <SceneSwitcher scene={scene} disabled={state.transitioning} onSwitch={id => void go(id)} />
      </footer>
      <div className="status" role="status">{error || (audio.failed ? '音乐尚未播放，轻触右上角重试' : '')}</div>
    </>}
  </main>;
}
