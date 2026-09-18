import type {CSSProperties} from 'react';
export function LightString({on,toggle,active}:{on:boolean;toggle:()=>void;active:boolean}){
  return <div className={`light-string parallax ${on?'lit':''}`} style={{'--depth':27} as CSSProperties}>
    <svg viewBox="0 0 1000 190" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 15 Q500 275 1020 15" fill="none" stroke="#24372c" strokeWidth="2"/></svg>
    {[9,22,36,50,64,78,91].map((x,i)=><button key={x} className="bulb" style={{left:`${x}%`,top:`${16+Math.sin(x/100*Math.PI)*62}%`,'--bulb-delay':`${i*.18}s`} as CSSProperties} aria-label={`灯串${on?'熄灭':'点亮'}，灯泡 ${i+1}`} aria-pressed={on} disabled={!active} onClick={toggle}><span/></button>)}
  </div>;
}
