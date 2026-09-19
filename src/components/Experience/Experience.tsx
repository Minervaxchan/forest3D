import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import gsap from 'gsap';
import {forest} from '../../scenes/forest';
import type {SceneConfig} from '../../scenes/types';
import {getExperience,setExperience,useExperience} from '../../store/experienceStore';
import {requestOrientation,useParallax} from '../../hooks/useParallax';
import {useAudio} from '../../hooks/useAudio';
import {Character} from '../Character/Character';
import {Fireflies} from '../Fireflies/Fireflies';
import {LightString} from '../LightString/LightString';
import {AudioController} from '../AudioController/AudioController';
import {SceneSwitcher} from '../SceneSwitcher/SceneSwitcher';

const preload=(src:string)=>new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>reject(new Error('场景暂时没有加载成功，请再试一次。'));img.src=src;});
export function Experience(){
  const state=useExperience();
  const [scene,setScene]=useState<SceneConfig>(forest);
  const [error,setError]=useState('');
  const root=useRef<HTMLDivElement>(null),camera=useRef<HTMLDivElement>(null);
  const timeline=useRef<gsap.core.Tween|null>(null);
  const mounted=useRef(true);
  useParallax(root,state.entered);
  const audio=useAudio(scene,state.entered,state.music);
  useLayoutEffect(()=>{mounted.current=true;return()=>{mounted.current=false;timeline.current?.kill();};},[]);
  useLayoutEffect(()=>{
    if(!state.entered)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    timeline.current=gsap.fromTo(camera.current,{opacity:0,scale:reduced?1:1.065,filter:reduced?'none':'blur(5px)'},{opacity:1,scale:1,filter:'blur(0px)',duration:reduced?.18:1.1,ease:'power2.out',onComplete:()=>setExperience({transitioning:false})});
    return()=>{timeline.current?.kill();};
  },[scene,state.entered]);
  const enter=()=>{audio.unlock();requestOrientation();setExperience({entered:true,transitioning:true});};
  const switchScene=async()=>{
    if(getExperience().transitioning)return;
    setExperience({transitioning:true});setError('');
    try{
      const next=scene.id==='forest'?(await import('../../scenes/nightForest')).nightForest:forest;
      await Promise.all(next.layers.map(layer=>preload(layer.src)));
      if(!mounted.current)return;
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      timeline.current=gsap.to(camera.current,{opacity:0,scale:reduced?1:1.045,filter:reduced?'none':'blur(6px)',duration:reduced?.15:.6,onComplete:()=>{setScene(next);setExperience({scene:next.id});}});
    }catch(e){if(mounted.current){setError(e instanceof Error?e.message:'加载失败，请重试');setExperience({transitioning:false});}}
  };
  return <main ref={root} className={`experience ${scene.lightMode} ${state.entered?'entered':'opening'}`} style={{background:scene.background} as CSSProperties}>
    <div ref={camera} className="camera">
      {scene.layers.filter(l=>l.id!=='foreground').map(layer=><div key={layer.id} className={`scene-layer parallax ${layer.id}`} style={{'--depth':layer.depth,backgroundImage:`url(${layer.src})`} as CSSProperties}/>)}
      <div className="sun-rays" aria-hidden="true"/>
      <LightString on={state.lights} toggle={()=>{setExperience({lights:!state.lights});audio.react('light');}} active={state.entered&&!state.transitioning}/>
      <Character scene={scene} active={state.entered&&!state.transitioning} onReact={audio.react}/>
      {scene.layers.filter(l=>l.id==='foreground').map(layer=><div key={layer.id} className="scene-layer parallax foreground" style={{'--depth':layer.depth,backgroundImage:`url(${layer.src})`} as CSSProperties}/>)}
      <Fireflies count={scene.effects.fireflies} mobileCount={scene.effects.mobileFireflies}/>
      <div className="vignette" aria-hidden="true"/>
    </div>
    <header className="header"><a className="wordmark" href="./" aria-label="forest3D 首页"><span className="brand-symbol">✳</span> forest<span className="brand-small">3D</span><span className="edition">AN INTERACTIVE ESCAPE</span></a>
      {state.entered&&<AudioController enabled={state.music} failed={audio.failed} toggle={()=>{audio.unlock();if(!audio.failed)setExperience({music:!state.music});}}/>}
    </header>
    {!state.entered?<div className="entry"><div className="entry-copy"><span className="eyebrow">A LITTLE WONDER, JUST FOR YOU</span><h1>把片刻，<br/>留给森林。</h1><p>风很轻。光很暖。<br/>还有一个小家伙，正等着和你见面。</p><button className="enter-button" onClick={enter}>点击进入森林 <span>↗</span></button><span className="sound-note">♫ &nbsp; 戴上耳机，让世界安静一会儿</span></div><div className="entry-bottom"><span>慢下来，好奇心会带路</span><span>EST. 2026 &nbsp; / &nbsp; VOL. 01</span></div></div>:<>
      <div className="scene-caption" aria-live="polite"><span className="eyebrow">{scene.subtitle}</span><h1>{scene.name}</h1><p>{scene.id==='forest'?'阳光落在这里，时间也是。':'借一点萤火，做一个温柔的梦。'}</p></div>
      <footer className="footer"><div className="explore-hint"><span className="tiny-dot"/> <span className="desktop-hint">移动鼠标探索 · 点击小家伙与灯串</span><span className="mobile-hint">拖动探索 · 轻触小家伙与灯串</span></div><SceneSwitcher scene={scene} disabled={state.transitioning} onSwitch={()=>void switchScene()}/></footer>
      <div className="status" role="status">{error || (audio.failed?'音乐尚未播放，轻触右上角重试':'')}</div>
    </>}
  </main>;
}
