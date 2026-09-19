import type {SceneConfig} from './types';
export const nightForest: SceneConfig = {
  id:'nightForest',name:'萤火之森',subtitle:'AFTER THE BLUE HOUR',background:'#101f36',
  layers:[{id:'background',src:'/assets/scenes/night-reference.webp',depth:12},{id:'midground',src:'/assets/scenes/mist.webp',depth:26},{id:'foreground',src:'/assets/scenes/leaves-reference.webp',depth:44}],
  bgm:{root:164.81,tempo:3400},characterPosition:{x:50,y:78},characterScale:1,
  characterLighting:{filter:'brightness(.69) saturate(.75) hue-rotate(8deg)',contactOpacity:.8,rim:'#b4d8f544'},
  ambient:{profile:'night',volume:.4},
  lightMode:'moon',effects:{fireflies:26,mobileFireflies:14},
};
