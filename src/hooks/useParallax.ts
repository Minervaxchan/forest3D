import {useEffect, type RefObject} from 'react';
export type OrientationPermission = typeof DeviceOrientationEvent & {requestPermission?:()=>Promise<string>};
export function requestOrientation(){
  const sensor = window.DeviceOrientationEvent as OrientationPermission | undefined;
  if(sensor?.requestPermission) void sensor.requestPermission().catch(()=>{});
}
export function useParallax(ref:RefObject<HTMLDivElement|null>,enabled:boolean){
  useEffect(()=>{
    const el=ref.current;
    if(!el || !enabled) return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let targetX=0,targetY=0,x=0,y=0,frame=0,drag=false,startX=0,startY=0,touchUntil=0;
    const move=(e:PointerEvent)=>{
      if(e.pointerType==='mouse'){
        targetX=(e.clientX/innerWidth-.5)*2;targetY=(e.clientY/innerHeight-.5)*2;
      }else if(drag){
        targetX=Math.max(-1,Math.min(1,(e.clientX-startX)/130));
        targetY=Math.max(-1,Math.min(1,(e.clientY-startY)/180));touchUntil=performance.now()+4000;
      }
    };
    const down=(e:PointerEvent)=>{drag=true;startX=e.clientX;startY=e.clientY;};
    const up=()=>{drag=false;};
    const leave=()=>{drag=false;targetX=0;targetY=0;};
    const orientation=(e:DeviceOrientationEvent)=>{
      if(drag || performance.now()<touchUntil || e.gamma===null || e.beta===null)return;
      targetX=Math.max(-1,Math.min(1,e.gamma/30));targetY=Math.max(-1,Math.min(1,(e.beta-45)/40));
    };
    const tick=()=>{
      x+=(targetX-x)*.055;y+=(targetY-y)*.055;
      el.style.setProperty('--px',String(x));el.style.setProperty('--py',String(y));
      frame=requestAnimationFrame(tick);
    };
    const sync=()=>{cancelAnimationFrame(frame);if(!document.hidden&&!media.matches)tick();else{el.style.setProperty('--px','0');el.style.setProperty('--py','0');}};
    sync();media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    el.addEventListener('pointermove',move);el.addEventListener('pointerdown',down);el.addEventListener('pointerleave',leave);
    window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);window.addEventListener('deviceorientation',orientation);
    return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);el.removeEventListener('pointermove',move);el.removeEventListener('pointerdown',down);el.removeEventListener('pointerleave',leave);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);window.removeEventListener('deviceorientation',orientation);};
  },[ref,enabled]);
}
