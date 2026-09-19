import type {SceneConfig} from './types';
export const forest: SceneConfig = {
  id:'forest',name:'日光森林',subtitle:'SUNLIT WOODS',background:'#78978b',
  layers:[{id:'background',src:'/assets/scenes/forest-reference.webp',depth:12},{id:'midground',src:'/assets/scenes/mist.webp',depth:26},{id:'foreground',src:'/assets/scenes/leaves-reference.webp',depth:44}],
  bgm:{root:196,tempo:2800},characterPosition:{x:50,y:78},characterScale:1,
  characterLighting:{filter:'brightness(.93) saturate(.83)',contactOpacity:.65,rim:'#fff2b744'},
  ambient:{profile:'brook',volume:.34},
  lightMode:'warm',effects:{fireflies:18,mobileFireflies:10},
};
