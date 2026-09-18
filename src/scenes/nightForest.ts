import type {SceneConfig} from './types';
export const nightForest: SceneConfig = {
  id:'nightForest',name:'萤火之森',subtitle:'AFTER THE BLUE HOUR',background:'#101f36',
  layers:[{id:'background',src:'/assets/scenes/night-reference.webp',depth:12},{id:'midground',src:'/assets/scenes/mist.webp',depth:26},{id:'foreground',src:'/assets/scenes/leaves-reference.webp',depth:44}],
  bgm:{root:164.81,tempo:3400},characterPosition:{x:50,y:78},characterScale:1,
  lightMode:'moon',effects:{fireflies:26,mobileFireflies:14},
};
