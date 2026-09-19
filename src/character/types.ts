import { assetUrl } from '../lib/assetUrl';
export type CharacterAction = 'idle' | 'wave' | 'jump' | 'lookUp' | 'listen';
export type AutomaticAction = Exclude<CharacterAction, 'idle' | 'jump'>;
export interface CharacterRequest { id: number; action: AutomaticAction }
export const characterSprites = {
  idle: assetUrl('assets/character/friend-reference.webp'),
  blink: assetUrl('assets/character/friend-blink.webp'),
  wave: assetUrl('assets/character/friend-wave.webp'),
  lookUp: assetUrl('assets/character/friend-look-up.webp'),
};
