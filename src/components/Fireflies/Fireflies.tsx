import {useMemo,type CSSProperties} from 'react';
export function Fireflies({count,mobileCount}:{count:number;mobileCount:number}){
  const particles=useMemo(()=>Array.from({length:count},(_,i)=>({x:8+((i*37.7)%84),y:22+((i*23.3)%66),duration:7+(i*1.7)%9,delay:-i*1.37,dx:Math.sin(i*4)*45,dy:Math.cos(i*3)*35})),[count]);
  return <div className="fireflies" aria-hidden="true">{particles.map((p,i)=><i key={i} className={i>=mobileCount?'desktop-particle':''} style={{left:`${p.x}%`,top:`${p.y}%`,'--duration':`${p.duration}s`,'--delay':`${p.delay}s`,'--dx':`${p.dx}px`,'--dy':`${p.dy}px`} as CSSProperties}/>)}</div>;
}
