// Minimal dependency-aware bundle for this project's simple named ES modules.
// Every source module keeps its own scope in the output; no external npm runtime.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ART_NAMES,UI_ART_NAMES,CARD_ART_NAMES,CARD_TEMPLATES} from '../src/visuals.js';
import {readArtwork} from './lib/artwork.mjs';
import {readUIArtwork} from './lib/ui-artwork.mjs';

const isCardStudy=process.argv.includes('--cards');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const {art,cardArt}=readArtwork(root,{portraits:ART_NAMES,cards:CARD_ART_NAMES,templates:CARD_TEMPLATES});
const uiArt=readUIArtwork(root,UI_ART_NAMES);
const factories=new Map();
function resolve(origin,request){
 if(!request.startsWith('.'))throw Error('Import externe non pris en charge : '+request);
 const target=path.posix.normalize(path.posix.join(path.posix.dirname(origin),request));
 if(target.startsWith('../')||!target.startsWith('src/')||!target.endsWith('.js'))throw Error('Import hors du projet : '+request);
 return target;
}
function convert(filename, testing=false){
 if(factories.has(filename))return;
 let text=read(filename),deps=[];
 if(filename==='src/visuals.js')text=text.replace('export const INLINE_CREATURES={};','export const INLINE_CREATURES='+JSON.stringify(art)+';').replace('export const INLINE_CARDS={};','export const INLINE_CARDS='+JSON.stringify(cardArt)+';');
 text=text.replace(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*$/gm,(_all,items,request)=>{
  const dep=resolve(filename,request);deps.push(dep);
  return `const {${items}}=__load(${JSON.stringify(dep)});`;
 });
 text=text.replace(/^export\s+\*\s+from\s+['"]([^'"]+)['"];?\s*$/gm,(_all,request)=>{
  const dep=resolve(filename,request);deps.push(dep);
  return `Object.assign(__exports,__load(${JSON.stringify(dep)}));`;
 });
 const exported=[];
 text=text.replace(/^export\s+(async\s+function|function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm,(_all,kind,name)=>{
  exported.push(name);return kind+' '+name;
 });
 if(/^\s*(?:import|export)\b/m.test(text))throw Error('Syntaxe de module non gérée dans '+filename);
 if(testing && filename==='src/app.js')text+=`
// Only in the automated test bundle; never included in JOUER.html.
Object.defineProperties(window,{
 profile:{configurable:true,get:()=>profile,set:v=>profile=v},
 battle:{configurable:true,get:()=>battle,set:v=>battle=v},
 screen:{configurable:true,get:()=>screen,set:v=>screen=v},
 selectedCard:{configurable:true,get:()=>selectedCard,set:v=>selectedCard=v}
});
Object.assign(window,{render,save,load,loadBattle,persistBattle,settle,hideModal,showModal,startMission,startTower,startDungeonStage,startDungeon,navigate,act,createBattle,formationBonus,heroLevel,masteryRank,HERO_LEVEL_THRESHOLD,playPlayerCard,endPlayerTurn,usePower,heroShieldBonus,chooseHeroTalent});
`;
 text+='\nObject.assign(__exports,{'+exported.join(',')+'});\n';
 factories.set(filename,text);
 for(const dependency of deps)convert(dependency,testing);
}
const isTest=process.argv.includes('--test');
convert('src/app.js',isTest);
const factoriesJs=[...factories].map(([file,body])=>`${JSON.stringify(file)}:function(__exports,__load){\n${body}\n}`).join(',\n');
const js=`(function(){\n'use strict';\nconst __factories={\n${factoriesJs}\n};\nconst __cache=Object.create(null);\nfunction __load(name){\n if(Object.prototype.hasOwnProperty.call(__cache,name))return __cache[name];\n const factory=__factories[name];if(!factory)throw Error('Module non trouvé : '+name);\n const exports={};__cache[name]=exports;factory(exports,__load);return exports;\n}\n__load('src/app.js');\n})();`;
let html=read('index.html');
const css=read('styles.css');
const cardCss=read('assets/card-arena.css');
const previewCss=read('assets/card-preview.css');
const collectionCss=read('assets/collection.css');
const generatedCss=read('assets/generated-card.css');
const paintedArtCss=read('assets/backgrounds/arena-celeste-peinte.css');
const paintedLayoutCss=read('assets/backgrounds/arena-peinte-layout.css');
if(!html.includes('<link rel="stylesheet" href="./styles.css" />')||!html.includes('<script type="module" src="./src/app.js"></script>'))throw Error('Points d’entrée HTML non reconnus');
html=html.replace('<link rel="stylesheet" href="./styles.css" />','<style>\n'+css+'\n</style>');
html=html.replace('<link rel="stylesheet" href="./assets/backgrounds/arena-celeste-peinte.css" />','<style>\n'+paintedArtCss+'\n</style>');
html=html.replace('<link rel="stylesheet" href="./assets/backgrounds/arena-peinte-layout.css" />','<style>\n'+paintedLayoutCss+'\n</style>');
html=html.replace('<link rel="stylesheet" href="./assets/card-arena.css" />',()=>'<style>\n'+cardCss+'\n</style>');
html=html.replace('<link rel="stylesheet" href="./assets/card-preview.css" />',()=>'<style>\n'+previewCss+'\n</style>');
html=html.replace('<link rel="stylesheet" href="./assets/collection.css" />',()=>'<style>\n'+collectionCss+'\n</style>');
html=html.replace('<link rel="stylesheet" href="./assets/generated-card.css" />',()=>'<style>\n'+generatedCss+'\n</style>');
for(const [target,source] of Object.entries(uiArt)){
 const link=`<link rel="stylesheet" href="./${target}" />`;
 if(!html.includes(link))throw Error('Fond UI non relié à la page : '+target);
 html=html.replace(link,()=>'<style>\n'+source+'\n</style>');
}
if(isCardStudy)html=html.replace('<body>','<body data-card-combat="true">');
html=html.replace('<script type="module" src="./src/app.js"></script>','<script>\n'+js.replace(/<\/script/gi,'<\\/script')+'\n</script>');
const output=isTest?(isCardStudy?'tests/ESSAI_CARTES.test.html':'tests/JOUER.test.html'):(isCardStudy?'ESSAI_CARTES.html':'JOUER.html');
fs.writeFileSync(path.join(root,output),html);
console.log(`${output} généré (${Buffer.byteLength(html)} octets, ${factories.size} modules, ${Object.keys(art).length+Object.keys(cardArt).length} illustrations intégrées)`);
