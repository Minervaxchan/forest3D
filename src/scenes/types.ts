export type SceneId = 'forest' | 'nightForest';
export interface SceneConfig {
  id: SceneId;
  name: string;
  subtitle: string;
  background: string;
  layers: {id: 'background'|'midground'|'foreground'; src: string; depth: number}[];
  bgm: {root: number; tempo: number; src?: string; volume?: number};
  ambient?: {src?: string; volume: number; profile?: 'brook' | 'night'};
  characterPosition: {x: number; y: number};
  characterScale: number;
  characterLighting: {filter: string; contactOpacity: number; rim: string};
  lightMode: 'warm'|'moon';
  effects: {fireflies: number; mobileFireflies: number};
}
