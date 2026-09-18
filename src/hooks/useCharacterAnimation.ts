import {useCallback,useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
export function useCharacterAnimation(){
  const body=useRef<HTMLDivElement>(null);
  const locked=useRef(false);
  const animation=useRef<gsap.core.Timeline|null>(null);
  const [state,setState]=useState<'idle'|'wave'|'jump'>('idle');
  const [blink,setBlink]=useState(false);
  useEffect(()=>{
    let timer:ReturnType<typeof setTimeout>,close:ReturnType<typeof setTimeout>;
    const schedule=()=>{timer=setTimeout(()=>{if(!document.hidden&&!locked.current){setBlink(true);close=setTimeout(()=>setBlink(false),140);}schedule();},2400+Math.random()*3200);};
    schedule();return()=>{clearTimeout(timer);clearTimeout(close);animation.current?.kill();};
  },[]);
  const interact=useCallback(()=>{
    if(locked.current||!body.current)return;
    locked.current=true;setBlink(false);
    const next=Math.random()<.5?'wave':'jump';setState(next);
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl=gsap.timeline({onComplete:()=>{locked.current=false;setState('idle');}});animation.current=tl;
    if(reduced){tl.to(body.current,{scale:1.025,duration:.18}).to(body.current,{scale:1,duration:.18});return;}
    if(next==='jump')tl.to(body.current,{scaleY:.88,scaleX:1.07,duration:.15}).to(body.current,{y:-65,scaleY:1.06,scaleX:.97,duration:.32,ease:'power2.out'}).to(body.current,{y:0,scaleY:.9,scaleX:1.05,duration:.32,ease:'power2.in'}).to(body.current,{scaleY:1,scaleX:1,duration:.24});
    else tl.to(body.current,{rotation:-9,y:-5,duration:.22}).to(body.current,{rotation:8,duration:.22,repeat:3,yoyo:true}).to(body.current,{rotation:0,y:0,duration:.25});
  },[]);
  return {body,state,blink,interact};
}
