import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
await mkdir('public/assets/character',{recursive:true});
await mkdir('public/assets/scenes',{recursive:true});
await sharp('src/assets/character/friend-source.png').trim().resize(600,600,{fit:'contain',background:'#00000000'}).extend({top:20,bottom:20,left:20,right:20,background:'#00000000'}).webp({quality:92,alphaQuality:100}).toFile('public/assets/character/friend-reference.webp');
for(const [source,target] of [['forest-source','forest-reference'],['night-source','night-reference'],['leaves-source','leaves-reference']]){
await sharp('src/assets/scenes/'+source+'.png').resize(1600).webp({quality:86,alphaQuality:100}).toFile('public/assets/scenes/'+target+'.webp');
}
const mist='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100"><defs><radialGradient id="m"><stop stop-color="#ffffe1" stop-opacity=".15"/><stop offset="1" stop-color="#ffffe1" stop-opacity="0"/></radialGradient></defs><ellipse cx="1040" cy="250" rx="450" ry="500" fill="url(#m)"/><ellipse cx="360" cy="700" rx="300" ry="100" fill="url(#m)"/></svg>';
await sharp(Buffer.from(mist)).webp().toFile('public/assets/scenes/mist.webp');
console.log('Optimized reference assets.');
for(const pose of ['blink','wave']){await sharp('src/assets/character/friend-'+pose+'-source.png').resize(640,640).webp({quality:90,alphaQuality:100}).toFile('public/assets/character/friend-'+pose+'.webp');}
