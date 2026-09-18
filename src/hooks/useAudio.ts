import {useEffect,useRef,useState} from 'react';
import type {SceneConfig} from '../scenes/types';

// Created synchronously inside the entry gesture; no autoplay before user input.
class ForestAudio {
  context: AudioContext|null=null;
  master: GainNode|null=null;
  timer: ReturnType<typeof setTimeout>|undefined;
  voices=new Set<OscillatorNode>();
  buffers: AudioBufferSourceNode[]=[];
  sequence=0;
  generation=0;
  async unlock(){
    this.context??=new AudioContext();
    if(!this.master){this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);}
    await this.context.resume();
  }
  fade(volume:number,duration=.8){
    if(!this.context||!this.master)return;
    const gain=this.master.gain,now=this.context.currentTime;
    gain.cancelAndHoldAtTime(now);gain.linearRampToValueAtTime(volume,now+duration);
  }
  stopVoices(){clearTimeout(this.timer);this.voices.forEach(v=>{try{v.stop();}catch{/* Already ended. */}});this.voices.clear();this.buffers.forEach(b=>{try{b.stop();}catch{/* Already ended. */}});this.buffers=[];}
  async play(scene:SceneConfig){
    this.stopVoices();const generation=++this.generation;
    const ctx=this.context,master=this.master;if(!ctx||!master)return;
    const load=async(src:string,volume:number)=>{
      const response=await fetch(src);if(!response.ok)throw new Error('Audio asset unavailable');
      const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
      if(generation!==this.generation)return;
      const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=volume;source.connect(gain);gain.connect(master);source.start();this.buffers.push(source);
    };
    const synth=()=>{
      const notes=[0,7,12,4,9,7,4,2];
      const phrase=()=>{
        if(ctx.state!=='running'||document.hidden){this.timer=setTimeout(phrase,scene.bgm.tempo);return;}
        const now=ctx.currentTime;
        [0,7,12].forEach((offset,index)=>{
          const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';
          osc.frequency.value=scene.bgm.root*Math.pow(2,(offset+(index===2?notes[this.sequence%notes.length]:0))/12);
          const start=now+index*.16;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.055,start+.45);gain.gain.exponentialRampToValueAtTime(.0001,start+4.4);
          osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+4.5);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};
        });
        this.sequence++;this.timer=setTimeout(phrase,scene.bgm.tempo);
      };phrase();
    };
    if(scene.bgm.src){try{await load(scene.bgm.src,1);}catch{if(generation===this.generation)synth();}}else synth();
    if(scene.ambient)void load(scene.ambient.src,scene.ambient.volume).catch(()=>{});
  }
  dispose(){this.generation++;this.stopVoices();void this.context?.close();this.context=null;this.master=null;}
}
export function useAudio(scene:SceneConfig,entered:boolean,music:boolean){
  const engine=useRef<ForestAudio|null>(null);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);
  const unlock=()=>{
    engine.current??=new ForestAudio();
    void engine.current.unlock().then(()=>{setReady(true);setFailed(false);}).catch(()=>setFailed(true));
  };
  useEffect(()=>()=>{engine.current?.dispose();engine.current=null;},[]);
  useEffect(()=>{if(ready&&entered)void engine.current?.play(scene);},[scene,ready,entered]);
  useEffect(()=>{
    const audio=engine.current;if(!ready||!audio)return;
    let suspend:ReturnType<typeof setTimeout>|undefined;
    const update=()=>{
      clearTimeout(suspend);
      if(document.hidden){audio.fade(0,.2);suspend=setTimeout(()=>{void audio.context?.suspend();},250);}
      else{void audio.context?.resume().catch(()=>setFailed(true));audio.fade(entered&&music?1:0);}
    };
    update();document.addEventListener('visibilitychange',update);
    return()=>{clearTimeout(suspend);document.removeEventListener('visibilitychange',update);};
  },[entered,music,ready]);
  return {unlock,failed};
}
