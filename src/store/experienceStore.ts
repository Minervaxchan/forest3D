import {useSyncExternalStore} from 'react';
import type {SceneId} from '../scenes/types';
type State = {entered: boolean; music: boolean; lights: boolean; scene: SceneId; transitioning: boolean};
let state: State = {entered:false,music:true,lights:true,scene:'forest',transitioning:false};
const listeners = new Set<()=>void>();
export function setExperience(patch: Partial<State>){state={...state,...patch};listeners.forEach(fn=>fn());}
export function getExperience(){return state;}
function subscribe(fn:()=>void){listeners.add(fn);return ()=>{listeners.delete(fn);};}
export function useExperience(){return useSyncExternalStore(subscribe,getExperience);}
