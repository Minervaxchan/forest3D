export type SceneId = 'forest' | 'nightForest';
export interface SceneConfig {
  id: SceneId;
  name: string;
  subtitle: string;
  background: string;
  layers: {id: 'background'|'midground'|'foreground'; src: string; depth: number}[];
  bgm: {root: number; tempo: number; src?: string};
  ambient?: {src: string; volume: number};
  characterPosition: {x: number; y: number};
  characterScale: number;
  lightMode: 'warm'|'moon';
  effects: {fireflies: number; mobileFireflies: number};
}
