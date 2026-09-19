import { useSyncExternalStore } from 'react';
import type { SceneId } from '../scenes/types';
import { readPreference, writePreference } from '../lib/preferences';

type State = {
  entered: boolean; music: boolean; lights: boolean;
  scene: SceneId; transitioning: boolean; greeted: boolean;
};
let state: State = {
  entered: false, music: readPreference('music', true), lights: true,
  scene: 'forest', transitioning: false, greeted: readPreference('greeted', false),
};
const listeners = new Set<() => void>();
export function setExperience(patch: Partial<State>) {
  state = { ...state, ...patch };
  if (patch.music !== undefined) writePreference('music', patch.music);
  if (patch.greeted !== undefined) writePreference('greeted', patch.greeted);
  listeners.forEach(fn => fn());
}
export function getExperience() { return state; }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function useExperience() { return useSyncExternalStore(subscribe, getExperience); }
