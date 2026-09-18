export function AudioController({enabled,toggle,failed}:{enabled:boolean;toggle:()=>void;failed:boolean}){
  return <button className={`glass-button music-button ${enabled?'playing':''}`} aria-label={failed?'重试播放音乐':enabled?'关闭音乐':'打开音乐'} aria-pressed={enabled} onClick={toggle} title={failed?'点击重试音乐':enabled?'关闭音乐':'打开音乐'}>
    <span className="equalizer" aria-hidden="true"><i/><i/><i/><i/></span><span className="sr-only">音乐</span>
  </button>;
}
