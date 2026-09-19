import type { SceneConfig } from '../scenes/types';

export type Reaction = 'wave' | 'jump' | 'land' | 'light';
type Source = OscillatorNode | AudioBufferSourceNode;
type Session = {
  bus: GainNode;
  music: GainNode;
  ambience: GainNode;
  nodes: AudioNode[];
  sources: Set<Source>;
  controller: AbortController;
  scheduler?: ReturnType<typeof setInterval>;
  cleanup?: ReturnType<typeof setTimeout>;
  disposed: boolean;
};

// One master controls music, ambience and reactions. Scene buses crossfade underneath it.
export class ForestAudio {
  context: AudioContext | null = null;
  master: GainNode | null = null;
  private current: Session | null = null;
  private pending: Session | null = null;
  private sessions = new Set<Session>();
  private generation = 0;
  private noise: AudioBuffer | null = null;
  private impulse: AudioBuffer | null = null;
  private effects = new Set<OscillatorNode>();

  async unlock() {
    this.context ??= new AudioContext();
    if (!this.master) {
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      const limiter = this.context.createDynamicsCompressor();
      limiter.threshold.value = -18;
      limiter.knee.value = 18;
      limiter.ratio.value = 3;
      limiter.attack.value = .02;
      limiter.release.value = .3;
      this.master.connect(limiter).connect(this.context.destination);
    }
    await this.context.resume();
  }

  private ramp(param: AudioParam, target: number, duration: number) {
    const now = this.context!.currentTime;
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now);
    else { param.cancelScheduledValues(now); param.setValueAtTime(param.value, now); }
    param.linearRampToValueAtTime(target, now + duration);
  }

  fade(volume: number, duration = .8) {
    if (this.master && this.context) this.ramp(this.master.gain, volume, duration);
  }

  private makeSession(scene: SceneConfig): Session {
    const ctx = this.context!;
    const bus = ctx.createGain(), music = ctx.createGain(), ambience = ctx.createGain();
    bus.gain.value = 0;
    music.gain.value = scene.bgm.volume ?? .65;
    ambience.gain.value = scene.ambient?.volume ?? .3;
    music.connect(bus); ambience.connect(bus); bus.connect(this.master!);
    const session: Session = {
      bus, music, ambience, nodes: [bus, music, ambience], sources: new Set(),
      controller: new AbortController(), disposed: false,
    };
    this.sessions.add(session);
    return session;
  }

  private track(session: Session, source: Source, nodes: AudioNode[] = []) {
    session.sources.add(source);
    source.onended = () => {
      session.sources.delete(source);
      source.disconnect();
      nodes.forEach(node => node.disconnect());
    };
  }

  private disposeSession(session: Session) {
    if (session.disposed) return;
    session.disposed = true;
    session.controller.abort();
    clearInterval(session.scheduler);
    clearTimeout(session.cleanup);
    session.sources.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); });
    session.sources.clear();
    session.nodes.forEach(node => node.disconnect());
    this.sessions.delete(session);
  }

  private retire(session: Session) {
    clearInterval(session.scheduler);
    session.controller.abort();
    this.ramp(session.bus.gain, 0, 1.2);
    session.cleanup = setTimeout(() => this.disposeSession(session), 1350);
  }

  private seededBuffer(seconds: number, impulse = false) {
    const ctx = this.context!;
    const sampleRate = impulse ? ctx.sampleRate : 22050;
    const buffer = ctx.createBuffer(2, Math.round(sampleRate * seconds), sampleRate);
    let seed = 37;
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        seed = (seed * 16807) % 2147483647;
        const envelope = impulse ? Math.pow(1 - i / data.length, 3) : .7;
        data[i] = ((seed - 1) / 1073741823 - 1) * envelope;
      }
    }
    return buffer;
  }

  private instrument(session: Session, output: AudioNode, frequency: number, time: number, pad = false) {
    const ctx = this.context!;
    const voice = ctx.createOscillator(), envelope = ctx.createGain(), filter = ctx.createBiquadFilter();
    voice.type = pad ? 'sine' : 'triangle';
    voice.frequency.value = frequency;
    filter.type = 'lowpass'; filter.frequency.value = pad ? 700 : 1800;
    const duration = pad ? 5.8 : 2.3;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(pad ? .034 : .085, time + (pad ? .8 : .018));
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    voice.connect(filter).connect(envelope).connect(output);
    voice.start(time); voice.stop(time + duration + .05);
    this.track(session, voice, [envelope, filter]);
  }

  private startSoundscape(session: Session, scene: SceneConfig, withMusic: boolean, withAmbience: boolean) {
    const ctx = this.context!;
    this.noise ??= this.seededBuffer(7);
    this.impulse ??= this.seededBuffer(1.8, true);
    const reverb = ctx.createConvolver(), wet = ctx.createGain();
    reverb.buffer = this.impulse; wet.gain.value = .2;
    session.music.connect(reverb).connect(wet).connect(session.bus);
    session.nodes.push(reverb, wet);

    if (withAmbience) {
      // Separate filtered layers suggest a nearby brook and a soft canopy breeze.
      for (const [frequency, gainValue, type] of [[850, .16, 'bandpass'], [250, .12, 'lowpass']] as const) {
        const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
        source.buffer = this.noise; source.loop = true;
        filter.type = type; filter.frequency.value = frequency; filter.Q.value = .45;
        gain.gain.value = gainValue;
        source.connect(filter).connect(gain).connect(session.ambience);
        source.start(); this.track(session, source);
        session.nodes.push(filter, gain);
        const breeze = ctx.createOscillator(), depth = ctx.createGain();
        breeze.frequency.value = type === 'lowpass' ? .075 : .13;
        depth.gain.value = gainValue * .22;
        breeze.connect(depth).connect(gain.gain); breeze.start();
        this.track(session, breeze); session.nodes.push(depth);
      }
    }

    const beatLength = scene.bgm.tempo / 4000;
    const melody: (number | null)[] = [12, null, 7, 9, null, 4, 7, null, 12, 14, null, 9, 7, null, 4, null];
    const chords = [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]];
    let beat = 0, nextBeat = ctx.currentTime + .08, nextBird = ctx.currentTime + 2.5;
    const schedule = () => {
      if (session.disposed || ctx.state !== 'running' || document.hidden) return;
      if (nextBeat < ctx.currentTime - .3) nextBeat = ctx.currentTime + .08;
      while (nextBeat < ctx.currentTime + .3) {
        if (withMusic) {
          const chord = chords[Math.floor(beat / 8) % chords.length];
          if (beat % 8 === 0) chord.forEach((note, i) =>
            this.instrument(session, session.music, scene.bgm.root / 2 * 2 ** (note / 12), nextBeat + i * .08, true));
          const note = melody[beat % melody.length];
          if (note !== null) this.instrument(session, session.music, scene.bgm.root * 2 ** (note / 12), nextBeat);
        }
        beat++; nextBeat += beatLength;
      }
      if (withAmbience && ctx.currentTime > nextBird) {
        this.bird(session, scene.lightMode === 'moon');
        nextBird = ctx.currentTime + (scene.lightMode === 'moon' ? 11 : 7) + Math.random() * 7;
      }
    };
    schedule();
    session.scheduler = setInterval(schedule, 150);
  }

  private bird(session: Session, night: boolean) {
    const ctx = this.context!, now = ctx.currentTime + .05;
    const chirps = night ? 4 : 2;
    for (let i = 0; i < chirps; i++) {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), pan = ctx.createStereoPanner();
      const time = now + i * (night ? .085 : .19);
      pan.pan.value = Math.sin(now * .11) * .65;
      osc.frequency.setValueAtTime(night ? 3300 : 2100, time);
      osc.frequency.exponentialRampToValueAtTime(night ? 3600 : 3200, time + .07);
      osc.frequency.exponentialRampToValueAtTime(night ? 3100 : 2400, time + .15);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(night ? .008 : .028, time + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, time + .16);
      osc.connect(gain).connect(pan).connect(session.ambience);
      osc.start(time); osc.stop(time + .18); this.track(session, osc, [gain, pan]);
    }
  }

  private async loadLoop(session: Session, src: string, output: AudioNode) {
    const ctx = this.context!;
    const timeout = setTimeout(() => session.controller.abort(), 8000);
    try {
      const response = await fetch(src, { signal: session.controller.signal });
      if (!response.ok) throw new Error('Audio asset unavailable');
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      if (session.disposed) return false;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true; source.connect(output);
      source.start(); this.track(session, source);
      return true;
    } finally { clearTimeout(timeout); }
  }

  async play(scene: SceneConfig) {
    if (!this.context || !this.master) return;
    const generation = ++this.generation;
    if (this.pending) this.disposeSession(this.pending);
    const session = this.makeSession(scene);
    this.pending = session;
    let musicLoaded = false, ambienceLoaded = false;
    if (scene.bgm.src) {
      try { musicLoaded = await this.loadLoop(session, scene.bgm.src, session.music); } catch { /* Procedural fallback. */ }
    }
    if (scene.ambient?.src && !session.disposed) {
      try { ambienceLoaded = await this.loadLoop(session, scene.ambient.src, session.ambience); } catch { /* Procedural fallback. */ }
    }
    if (generation !== this.generation || session.disposed) { this.disposeSession(session); return; }
    this.startSoundscape(session, scene, !musicLoaded, !!scene.ambient && !ambienceLoaded);
    const previous = this.current;
    this.current = session; this.pending = null;
    this.ramp(session.bus.gain, 1, 1.2);
    if (previous) this.retire(previous);
  }

  react(kind: Reaction) {
    const ctx = this.context;
    if (!ctx || !this.master || ctx.state !== 'running' || document.hidden || this.master.gain.value < .01) return;
    const notes = kind === 'wave' ? [660, 880] : kind === 'jump' ? [420, 740] : kind === 'land' ? [130] : [1046];
    notes.forEach((frequency, i) => {
      const voice = ctx.createOscillator(), gain = ctx.createGain(), time = ctx.currentTime + i * .12;
      voice.type = 'sine'; voice.frequency.setValueAtTime(frequency, time);
      voice.frequency.exponentialRampToValueAtTime(kind === 'land' ? 70 : frequency * 1.1, time + .12);
      gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.045, time + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, time + .25);
      voice.connect(gain).connect(this.master!); voice.start(time); voice.stop(time + .27);
      this.effects.add(voice); voice.onended = () => { this.effects.delete(voice); voice.disconnect(); gain.disconnect(); };
    });
  }

  dispose() {
    this.generation++;
    this.sessions.forEach(session => this.disposeSession(session));
    this.effects.forEach(voice => { try { voice.stop(); } catch { /* Already ended. */ } });
    this.effects.clear();
    void this.context?.close();
    this.context = null; this.master = null; this.current = null; this.pending = null;
    this.noise = null; this.impulse = null;
  }
}
