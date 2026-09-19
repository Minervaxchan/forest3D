import type { AutomaticAction } from '../character/types';
export type SceneId = 'forest' | 'nightForest';
export type InteractionEvent = 'lightOn' | 'mushroom' | 'water' | 'enter';
export interface SceneConfig {
  id: SceneId;
  name: string;
  subtitle: string;
  description: string;
  background: string;
  layers: { id: 'background' | 'midground' | 'foreground'; src: string; depth: number }[];
  bgm: { root: number; tempo: number; src?: string; volume?: number };
  ambient?: { src?: string; volume: number; profile?: 'brook' | 'night' };
  characterPosition: { x: number; y: number };
  characterScale: number;
  characterLighting: { filter: string; contactOpacity: number; rim: string };
  lightMode: 'warm' | 'moon';
  effects: { fireflies: number; mobileFireflies: number };
  interactions: {
    mushroom: { src: string; x: number; y: number; mobileX: number; mobileY: number; size: number; mobileSize: number; depth: number };
    water: { top: number; height: number; mobileTop: number; mobileHeight: number; depth: number };
  };
  reactions: Partial<Record<InteractionEvent, AutomaticAction>>;
}
