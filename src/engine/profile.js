// Profil, équipements, maîtrise et construction du deck. Sans DOM.
import {CARDS,CLASSES,TOWER_MAX} from '../data.js';
import {dungeonById} from '../dungeons.js';
import {TALENT_LEVELS,talentInfo,normalizeTalentChoices} from '../talents.js';
import {cardId,cardReference,cardKey,playableCardReference,ownedCardCopies,normalizeEvolutionInventory,completedEvolutionTrials} from '../cards/references.js';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const safeCount=(n,fallback=0,max=1000000000)=>Number.isSafeInteger(n)&&n>=0?Math.min(n,max):fallback;
const objectOf=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
export const ownedCopies=ownedCardCopies;
export function freshProfile(){return {
 version:1,name:'Souverain des Couronnes',heroClass:'gardien',gold:110,shards:50,stars:0,heroXp:0,mastery:{},talents:{},
 unlocked:1,towerUnlocked:1,towerCleared:[],dungeonCleared:[],dungeonRun:null,reputation:{aube:0,sylve:0,ombre:0,forge:0,ether:0},equipmentOwned:[],equipped:{arme:null,armure:null,relique:null},wins:0,losses:0,collection:{militia:4,shield:2,archer:2,ranger:2,wolf:2,firebolt:2,healing:2,smith:1,spark:1,bone:1,drill:1,thorn:1},
 deck:['militia','militia','militia','militia','shield','shield','archer','archer','ranger','ranger','wolf','wolf','firebolt','firebolt','healing','healing','smith','spark'],
 upgrades:{},buildings:{bastion:0,forge:0,bibliotheque:0},completed:[],guideSeen:false
};}
export function normalizeProfile(raw){
 const base=freshProfile();if(!raw||typeof raw!=='object')return base;
 const p={...base,...raw,collection:{...base.collection,...objectOf(raw.collection)},
   upgrades:{...objectOf(raw.upgrades)},buildings:{...base.buildings,...objectOf(raw.buildings)},
   reputation:{...base.reputation,...objectOf(raw.reputation)},equipped:{...base.equipped,...objectOf(raw.equipped)}};
 for(const key of ['gold','shards','stars','wins','losses'])p[key]=safeCount(raw[key],base[key]);
 for(const [id,qty] of Object.entries(p.collection)){
  if(!CARDS[id])delete p.collection[id];
  else p.collection[id]=safeCount(qty,0,100000);
 }
 for(const [id,level] of Object.entries(p.upgrades)){
  if(!CARDS[id]||CARDS[id].type==='sort')delete p.upgrades[id];
  else p.upgrades[id]=safeCount(level,0,3);
 }
 for(const [name,max] of Object.entries({bastion:3,forge:3,bibliotheque:2}))
  p.buildings[name]=safeCount(p.buildings[name],0,max);
 for(const faction of Object.keys(base.reputation))p.reputation[faction]=safeCount(p.reputation[faction],0,100000);
 p.name=typeof raw.name==='string'?raw.name.slice(0,80):base.name;
 if(typeof raw.lastBattleSettlementId!=='string')delete p.lastBattleSettlementId;
 else p.lastBattleSettlementId=raw.lastBattleSettlementId.slice(0,256);
 p.heroXp=Number.isFinite(raw.heroXp)?clamp(Math.floor(raw.heroXp),0,1000000):0;
 p.talents=normalizeTalentChoices(raw.talents);
 p.mastery={};
 if(raw.mastery&&typeof raw.mastery==='object'&&!Array.isArray(raw.mastery))for(const [id,xp] of Object.entries(raw.mastery)){
  if(CARDS[id]&&Number.isFinite(xp)&&xp>0)p.mastery[id]=clamp(Math.floor(xp),0,500);
 }
 p.towerUnlocked=clamp(Number(p.towerUnlocked)||1,1,TOWER_MAX);
 p.towerCleared=Array.isArray(raw.towerCleared)?raw.towerCleared.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOWER_MAX):[];
 p.equipmentOwned=Array.isArray(raw.equipmentOwned)?raw.equipmentOwned.filter(k=>EQUIPMENT[k]):[];
 p.dungeonCleared=Array.isArray(raw.dungeonCleared)?[...new Set(raw.dungeonCleared.filter(id=>dungeonById(id)))]:[];
 const run=raw.dungeonRun,dun=run&&dungeonById(run.id);
 p.dungeonRun=dun&&Number.isInteger(run.stage)&&run.stage>=0&&run.stage<dun.stages.length
  ?{id:run.id,stage:run.stage,hp:Number.isFinite(run.hp)?Math.max(1,Math.floor(run.hp)):null,maxhp:Number.isFinite(run.maxhp)?Math.max(1,Math.floor(run.maxhp)):null,phase:['ready','choice','bonus'].includes(run.phase)&&run.stage>0?run.phase:'ready'}
  :null;
 for(const slot of ['arme','armure','relique'])if(!p.equipmentOwned.includes(p.equipped[slot])||EQUIPMENT[p.equipped[slot]]?.slot!==slot)p.equipped[slot]=null;
 if(raw.evolvedCollection!==undefined)p.evolvedCollection=normalizeEvolutionInventory(raw.evolvedCollection);
 if(raw.completedTrials!==undefined)p.completedTrials=completedEvolutionTrials(raw.completedTrials);
 p.deck=(Array.isArray(raw.deck)?raw.deck:base.deck).map(cardReference).filter(playableCardReference).slice(0,24);
 if(!['gardien','arcaniste','rodeur','clerc'].includes(p.heroClass))p.heroClass='gardien';
 p.unlocked=clamp(Number(p.unlocked)||1,1,12);
 if(!Array.isArray(p.completed))p.completed=[];
 return p;
}
// Progression plafonnée : l'expérience du héros accorde au maximum 2 boucliers
// de départ, la maîtrise d'une carte au maximum 1 PV. Aucune attaque passive.
export const HERO_MAX_LEVEL=12;
export const HERO_LEVEL_THRESHOLD=level=>{
 const n=clamp(Math.floor(Number(level)||1)-1,0,HERO_MAX_LEVEL-1);
 return n*40+n*(n-1)*6;
};
export function heroLevel(profile){
 const xp=Math.max(0,Number(profile?.heroXp)||0);
 let level=1;
 while(level<HERO_MAX_LEVEL&&xp>=HERO_LEVEL_THRESHOLD(level+1))level++;
 return level;
}
export const heroShieldBonus=profile=>Math.min(2,Math.floor((heroLevel(profile)-1)/4));
// Reconfiguration libre entre les combats, sans monnaie ni cumul de deux talents au même palier.
export function chooseHeroTalent(profile,id){
 const talent=talentInfo(id);
 if(!talent||talent.hero!==profile.heroClass)return {ok:false,reason:'Talent réservé à une autre classe.'};
 if(heroLevel(profile)<TALENT_LEVELS[talent.tier])return {ok:false,reason:`Talent disponible au niveau ${TALENT_LEVELS[talent.tier]}.`};
 profile.talents=normalizeTalentChoices(profile.talents);
 profile.talents[talent.hero]??={};
 profile.talents[talent.hero][talent.tier]=id;
 return {ok:true};
}

export const MASTERY_THRESHOLDS=[0,4,10,22];
export function masteryRank(profile,id){
 const xp=Number(profile?.mastery?.[id])||0;
 if(!CARDS[id]||xp<0)return 0;
 return xp>=22?3:xp>=10?2:xp>=4?1:0;
}
export function grantBattleProgress(profile,b){
 const none={heroXp:0,levelBefore:heroLevel(profile),levelAfter:heroLevel(profile),levelShards:0,mastered:[]};
 if(b.mode==='developer'||b.mode==='evolution-trial'||b.progressionGranted)return none;
 b.progressionGranted=true;
 const victory=b.status==='victory';
 // Une retraite immédiate ne donne pas d'XP : pas de gain à la boucle abandon/recommencer.
 if(!victory&&(b.round<3||!Object.keys(b.cardUses||{}).length))return none;
 const before=heroLevel(profile);
 const gained=victory?22+6*clamp(b.enemyDifficulty||1,1,6):5;
 profile.heroXp=clamp((profile.heroXp||0)+gained,0,1000000);
 const after=heroLevel(profile),levels=Math.max(0,after-before);
 const levelShards=0; // Ne pas augmenter automatiquement l’économie : équilibrage V2.1 conservé.
 if(!profile.mastery||typeof profile.mastery!=='object')profile.mastery={};
 const mastered=[];
 for(const [id,count] of Object.entries(b.cardUses||{})){
  if(!CARDS[id]||!Number.isFinite(count)||count<=0)continue;
  const former=masteryRank(profile,id),points=Math.min(2,Math.floor(count))+(victory?1:0);
  profile.mastery[id]=Math.min(500,(profile.mastery[id]||0)+points);
  const rank=masteryRank(profile,id);
  if(rank>former)mastered.push({id,rank});
 }
 return {heroXp:gained,levelBefore:before,levelAfter:after,levelShards,mastered};
}
export function validateDeck(profile){
 if(!Array.isArray(profile.deck)||profile.deck.length<12||profile.deck.length>24)return 'Le deck doit contenir entre 12 et 24 cartes.';
 const counts={};for(const ref of profile.deck){if(!playableCardReference(ref))return 'Carte ou évolution indisponible dans le deck.';const key=cardKey(ref);counts[key]=(counts[key]||0)+1;}
 for(const ref of profile.deck){
  const c=CARDS[cardId(ref)],n=counts[cardKey(ref)];if(!c)return 'Carte inconnue dans le deck.';
  if(c.heroClass&&c.heroClass!==profile.heroClass)return `${c.name} est réservée à la classe ${CLASSES[c.heroClass].name}.`;
  if(n>ownedCopies(profile,ref))return `Trop d’exemplaires : ${c.name}.`;
 }
 return '';
}
export function changeHeroClass(profile,id){
 if(!CLASSES[id])return {ok:false,reason:'Classe inconnue.'};
 const restricted=profile.deck.map(ref=>CARDS[cardId(ref)]).find(card=>card?.heroClass&&card.heroClass!==id);
 if(restricted)return {ok:false,reason:`Retirez d’abord ${restricted.name} de votre deck pour changer de classe.`};
 profile.heroClass=id;return {ok:true};
}
export function modifyDeck(profile,reference,delta){
 const ref=cardReference(reference),id=cardId(ref);
 if(!ref||!playableCardReference(ref)||(delta>0&&CARDS[id].heroClass&&CARDS[id].heroClass!==profile.heroClass))return false;
 const key=cardKey(ref),index=profile.deck.findIndex(x=>cardKey(x)===key),count=profile.deck.filter(x=>cardKey(x)===key).length;
 if(delta>0&&count<ownedCopies(profile,ref)&&profile.deck.length<24){profile.deck.push(ref);return true;}
 if(delta<0&&index>=0){profile.deck.splice(index,1);return true;}
 return false;
}
export const EQUIPMENT={
 lame:{name:'Épée de l’Aube',slot:'arme',gold:85,shards:20,desc:'+1 attaque à toutes vos unités.',bonus:'unitAtk',value:1},
 baton:{name:'Sceptre des Sages',slot:'arme',gold:85,shards:20,desc:'+2 puissance au pouvoir du héros.',bonus:'power',value:2},
 cuirasse:{name:'Armure du Serment',slot:'armure',gold:80,shards:15,desc:'+6 PV au héros.',bonus:'hp',value:6},
 manteau:{name:'Cape de l’Aube',slot:'armure',gold:80,shards:15,desc:'+5 bouclier au début du combat.',bonus:'shield',value:5},
 anneau:{name:'Anneau du Souvenir',slot:'relique',gold:110,shards:25,desc:'+1 carte en main en début de combat.',bonus:'hand',value:1},
 sceau:{name:'Sceau des Cinq Ordres',slot:'relique',gold:110,shards:25,desc:'+2 réputation de faction supplémentaire par victoire.',bonus:'reputation',value:2}
};
export function craftEquipment(p,id){
 const item=EQUIPMENT[id];if(!item)return {ok:false,reason:'Équipement inconnu.'};
 if(p.equipmentOwned.includes(id))return {ok:false,reason:'Équipement déjà fabriqué.'};
 if(p.gold<item.gold||p.shards<item.shards)return {ok:false,reason:`Il faut ${item.gold} or et ${item.shards} éclats.`};
 p.gold-=item.gold;p.shards-=item.shards;p.equipmentOwned.push(id);p.equipped[item.slot]=id;return {ok:true};
}
export function equipEquipment(p,id){
 const item=EQUIPMENT[id];if(!item||!p.equipmentOwned.includes(id))return {ok:false,reason:'Équipement non possédé.'};
 p.equipped[item.slot]=id;return {ok:true};
}
export function reputationLevel(p,faction){return Math.min(3,Math.floor((p.reputation?.[faction]||0)/15));}
export function gearBonus(p,bonus){return Object.values(p.equipped||{}).reduce((n,id)=>n+(EQUIPMENT[id]?.bonus===bonus?EQUIPMENT[id].value:0),0);}
