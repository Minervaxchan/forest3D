import type { useEntryResources } from '../../hooks/useEntryResources';

export function Entry({ resources, onEnter }: {
  resources: ReturnType<typeof useEntryResources>; onEnter: () => void;
}) {
  const failed = resources.status === 'error', loading = resources.status === 'loading';
  return <div className="entry"><div className="entry-copy">
    <span className="eyebrow">A LITTLE WONDER, JUST FOR YOU</span>
    <h1>把片刻，<br />留给森林。</h1>
    <p>风很轻。光很暖。<br />还有一个小家伙，正等着和你见面。</p>
    <button className="enter-button" disabled={loading} onClick={failed ? resources.retry : onEnter}>
      {failed ? '重新准备森林' : loading ? '森林正在苏醒…' : '点击进入森林'} <span aria-hidden="true">{failed ? '↻' : '↗'}</span>
    </button>
    <div className="entry-load-status" role="status">
      {loading && <span className="loading-line"><i style={{ width: `${Math.max(8, resources.progress * 100)}%` }} /></span>}
      {failed && <span>{resources.message}</span>}
    </div>
    <span className="sound-note">♫ &nbsp; 戴上耳机，让世界安静一会儿</span>
  </div><div className="entry-bottom"><span>慢下来，好奇心会带路</span><span>EST. 2026 &nbsp; / &nbsp; VOL. 01</span></div></div>;
}
