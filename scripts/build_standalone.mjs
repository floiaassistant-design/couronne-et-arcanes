// Minimal dependency-aware bundle for this project's simple named ES modules.
// Every source module keeps its own scope in the output; no external npm runtime.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const art=Object.fromEntries(fs.readdirSync(path.join(root,'assets/creatures'))
 .filter(n=>n.endsWith('.webp'))
 .map(n=>[n.slice(0,-5),'data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/creatures',n)).toString('base64')]));
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
 if(filename==='src/visuals.js')text=text.replace('export const INLINE_CREATURES={};','export const INLINE_CREATURES='+JSON.stringify(art)+';');
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
if(!html.includes('<link rel="stylesheet" href="./styles.css" />')||!html.includes('<script type="module" src="./src/app.js"></script>'))throw Error('Points d’entrée HTML non reconnus');
html=html.replace('<link rel="stylesheet" href="./styles.css" />','<style>\n'+css+'\n</style>');
html=html.replace('<script type="module" src="./src/app.js"></script>','<script>\n'+js.replace(/<\/script/gi,'<\\/script')+'\n</script>');
fs.writeFileSync(path.join(root,isTest?'tests/JOUER.test.html':'JOUER.html'),html);
console.log(`${isTest?'JOUER.test.html':'JOUER.html'} généré (${Buffer.byteLength(html)} octets, ${factories.size} modules, ${Object.keys(art).length} illustrations intégrées)`);
