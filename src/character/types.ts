export type CharacterAction = 'idle' | 'wave' | 'jump' | 'lookUp' | 'listen';
export type AutomaticAction = Exclude<CharacterAction, 'idle' | 'jump'>;
export interface CharacterRequest { id: number; action: AutomaticAction }
export const characterSprites = {
  idle: '/assets/character/friend-reference.webp',
  blink: '/assets/character/friend-blink.webp',
  wave: '/assets/character/friend-wave.webp',
  lookUp: '/assets/character/friend-look-up.webp',
};
