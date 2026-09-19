import type {SceneConfig} from './types';
export const nightForest: SceneConfig = {
  id:'nightForest',name:'萤火之森',subtitle:'AFTER THE BLUE HOUR',background:'#101f36',
  description:'当森林安静下来，星光会替你说晚安。',
  interactions:{mushroom:{src:'/assets/scenes/mushrooms.webp',x:32,y:82,mobileX:20,mobileY:81,size:112,mobileSize:88,depth:34},water:{top:86,height:14,mobileTop:86,mobileHeight:14,depth:12}},
  reactions:{lightOn:'lookUp',mushroom:'listen',water:'listen',enter:'wave'},
  layers:[{id:'background',src:'/assets/scenes/night-reference.webp',depth:12},{id:'midground',src:'/assets/scenes/mist.webp',depth:26},{id:'foreground',src:'/assets/scenes/leaves-reference.webp',depth:44}],
  bgm:{root:164.81,tempo:3400},characterPosition:{x:50,y:78},characterScale:1,
  characterLighting:{filter:'brightness(.69) saturate(.75) hue-rotate(8deg)',contactOpacity:.8,rim:'#b4d8f544'},
  ambient:{profile:'night',volume:.4},
  lightMode:'moon',effects:{fireflies:26,mobileFireflies:14},
};
