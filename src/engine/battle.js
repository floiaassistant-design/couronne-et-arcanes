import {castSpell} from './spell-casting.js';
import {versionUnitAbilities,CARD_RULESET} from '../cards/definitions.js';
import {hit,resolveRetaliation} from './battle-defense.js';
import {recordTrialFact,recordTrialTurn} from './trial-objectives.js';
import {findCrownGuardian} from './guard-candidates.js';
import {battleUnitDefinition,unitCanPlay,unitAttackRange,unitMovementSteps,unitChargeAmount,unitHasPierce,unitFlying,battleRulesError} from './unit-rules.js';
import {resolveUnitArrival,resolveUnitSupport} from './unit-support.js';
import {consumeAttackPenalty,applyAttackEffects,resolveRegeneration} from './unit-effects.js';
import {tickUnitPoison,clearUnitPoison} from './unit-poison.js';
import {resolveStrikeRewards,resolveUnitDeath} from './unit-triggers.js';
// Moteur de combat tactique : aucun navigateur ou stockage externe.
import {CARDS,FACTIONS} from '../data.js';
import {frontEnemy} from './spell-targeting.js';
import {captureCombatFrame,recordCombatEvent} from './combat-events.js';
import {rankEnemyMoves} from '../ai.js';
import {classSkillTargetError} from './class-skills.js';
import {silenced,activeAbility,controlTargetError,prepareControlUnits,triggerTrap,expireControl} from './battle-control.js';
import {chosenTalents} from '../talents.js';
import {tempoTargetError} from './tempo.js';
import {normalizeProfile,validateDeck,heroLevel,heroShieldBonus,gearBonus} from './profile.js';
import {unitStatContext,unitStats} from './unit-stats.js';
import {cardId} from '../cards/references.js';
import {laneCount,lastCell,crownColumn,entryColumn,validDeploymentColumn,validLane,missionLayout} from './board.js';
export * from './board.js';
export * from './guard-candidates.js';
function rand(b){b.seed=(Math.imul(b.seed,1664525)+1013904223)>>>0;return b.seed/4294967296;}
function shuffle(b,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand(b)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function note(b,message){b.log.unshift(message);b.log=b.log.slice(0,12);}
function fx(b,event){recordCombatEvent(b,event);}
function enterCell(b,u,lane,col){triggerTrap(b,u,lane,col,hit,fx,note);sweepDead(b);}
const controlHooks={emit:fx,note,enter:enterCell};

function draw(b,side,n=1){
 const hero=b.heroes[side];for(let j=0;j<n;j++){
  if(hero.hand.length>=7)break;
  if(!hero.deck.length){
   if(!hero.discard.length)break;
   hero.deck=shuffle(b,hero.discard);hero.discard=[];
  }
  const reference=hero.deck.pop(),id=cardId(reference);if(!CARDS[id])continue;
  const definition=CARDS[id].type==='unité'?battleUnitDefinition(b,reference,side):null;
  const entry={id,wait:Math.max(0,(definition?.stats.delay??CARDS[id].delay)-1)};
  if(typeof reference==='object'){entry.rarity=reference.rarity;entry.cardRules=CARD_RULESET;}
  hero.hand.push(entry);
 }
}

export function createBattle(profile,mission,seed=Date.now(),options={}){
 const p=normalizeProfile(profile);if(validateDeck(p))throw Error(validateDeck(p));
 const layout=missionLayout(mission,options);
 const bonuses=unitStatContext(p);
 const b={seed:seed>>>0,missionId:mission.id,missionName:mission.name,round:1,phase:'player',status:'active',
 board:Array.from({length:layout.lanes},()=>Array(layout.cells+2).fill(null)),nextUnitId:1,log:[],powerCooldown:0,talentDrawUsed:false,cardUses:{},progressionGranted:false,heroTalents:chosenTalents(p,heroLevel(p)),
 heroes:{p:{name:p.name,hp:26+p.buildings.bastion*4+gearBonus(p,'hp'),maxhp:26+p.buildings.bastion*4+gearBonus(p,'hp'),shield:gearBonus(p,'shield')+heroShieldBonus(p)+(chosenTalents(p,heroLevel(p)).includes('gardien_rempart')?3:0),deck:[],discard:[],hand:[],cardsPlayed:0},
 e:{name:mission.enemy,hp:mission.hp,maxhp:mission.hp,shield:0,deck:[],discard:[],hand:[],cardsPlayed:0}},
 heroClass:p.heroClass,forgeBonus:bonuses.forgeBonus,libraryBonus:(p.buildings.bibliotheque||0)+gearBonus(p,'hand'),unitAtkBonus:bonuses.unitAtkBonus,powerBonus:gearBonus(p,'power'),reputationBonus:bonuses.reputationBonus,
 aiStyle:mission.aiStyle||'equilibre',aiBoss:!!mission.boss,aiPhaseAnnounced:false,
 upgrades:bonuses.upgrades,mastery:bonuses.mastery,enemyDifficulty:mission.difficulty,mode:mission.mode||'campaign',stats:{playerKills:0,enemyKills:0}};
 if(options.turnFlow==='alternating')b.turnFlow='alternating';
 b.cardRules=CARD_RULESET;
 if(p.deck.some(ref=>typeof ref==='object'))b.evolutionsEnabled=true;
 b.heroes.p.deck=shuffle(b,p.deck);
 b.heroes.e.deck=shuffle(b,mission.deck);
 draw(b,'p',5+b.libraryBonus);draw(b,'e',5);
 note(b,`Mission : ${mission.name}. Votre tour commence.`);
 return b;
}
const forward=side=>side==='p'?1:-1;
const isFlying=unitFlying;

// Bonus de formation calculé à la volée : aucune modification permanente des statistiques.
// Deux unités vivantes du même Ordre, du même camp et sur la même ligne
// gagnent chacune +1 attaque. Le bonus disparaît si la formation est rompue.
export function formationBonus(b,lane,unit){
 if(!unit||unit.hp<=0||!validLane(b,lane))return 0;
 const faction=CARDS[unit.id]?.faction;
 if(!faction||faction==='sort')return 0;
 let allies=0;
 for(const other of b.board[lane]){
  if(other&&other.hp>0&&other.side===unit.side&&CARDS[other.id]?.faction===faction)allies++;
 }
 return allies>=2?1:0;
}
function enemyAt(b,lane,col,side){return col>=1&&col<=lastCell(b)&&b.board[lane][col]&&b.board[lane][col].side!==side?b.board[lane][col]:null;}
function findTarget(b,lane,col,unit){
 const range=unitAttackRange(unit);
 let fallback=null;
 for(let d=1;d<=range;d++){
  const targetCol=col+forward(unit.side)*d;
  const target=enemyAt(b,lane,targetCol,unit.side);
  if(target && !fallback)fallback={type:'unit',target,col:targetCol};
 }
 if(fallback)return fallback;
 const heroDist=unit.side==='p'?crownColumn(b,'e')-col:col;
 return heroDist<=range?{type:'hero',side:unit.side==='p'?'e':'p'}:null;
}
function spawn(b,side,reference,lane,col=entryColumn(b,side)){
 const id=reference.id,c=CARDS[id];if(!c||c.type==='sort')return false;
 if(!validDeploymentColumn(b,side,col)||b.board[lane][col])return false;
 const definition=battleUnitDefinition(b,reference,side),stats=unitStats(b,reference,side);
 const u={uid:b.nextUnitId++,id,side,atk:stats.atk,maxhp:stats.maxhp,
  hp:stats.maxhp,armor:definition.abilities.armor?.amount||0,ranged:!!definition.abilities.ranged,
  ability:c.ability,stun:0,poison:0,poisonTurns:0,rarity:definition.rarity,cardRules:CARD_RULESET};
 b.board[lane][col]=u;
 fx(b,{type:'spawn',side,lane,col,icon:c.icon});
 if(formationBonus(b,lane,u))note(b,`Concorde de ${FACTIONS[c.faction].short} : +1 attaque aux alliés de cet ordre sur la ligne ${lane+1}.`);
 resolveUnitArrival(b,u,lane,col,{hit,emit:fx,note});sweepDead(b);
 note(b,`${side==='p'?'Vous invoquez': 'L’ennemi invoque'} ${c.name} (ligne ${lane+1}).`);
 enterCell(b,u,lane,col);
 return true;
}
function damageHero(b,side,amount){
 const h=b.heroes[side],before=h.hp;const absorbed=Math.min(h.shield,amount);h.shield-=absorbed;
 h.hp=Math.max(0,h.hp-(amount-absorbed));
 fx(b,{type:'hero-damage',side,damage:before-h.hp,absorbed});
}
function play(b,side,index,lane,col=entryColumn(b,side)){
 const rulesError=battleRulesError(b);if(rulesError)return {ok:false,reason:rulesError};
 if(b.status!=='active'||!Number.isInteger(lane)||!validLane(b,lane))return {ok:false,reason:'Combat terminé ou ligne invalide.'};
 if(!validDeploymentColumn(b,side,col))return {ok:false,reason:'Choisissez une case de votre zone de déploiement.'};
 const hero=b.heroes[side],hand=hero.hand[index];
 if(!hand)return {ok:false,reason:'Carte introuvable.'};
 if(hand.wait>0)return {ok:false,reason:`Cette carte sera disponible dans ${hand.wait} tour(s).`};
 if(hero.cardsPlayed>=2)return {ok:false,reason:'Limite de deux cartes par tour.'};
 const c=CARDS[hand.id];
 if(!c)return {ok:false,reason:'Carte inconnue.'};
 if(c.type==='unité'&&!unitCanPlay(b,hand,side))return {ok:false,reason:'Cette version de la carte n’est pas encore jouable.'};
 if(c.heroClass&&(side!=='p'||c.heroClass!==b.heroClass))return {ok:false,reason:'Compétence réservée à une autre classe.'};
 const targetError=classSkillTargetError(b,side,c,lane)||controlTargetError(b,side,c,lane)||tempoTargetError(b,side,c);
 if(targetError)return {ok:false,reason:targetError};
 if(c.type==='unité'&&!spawn(b,side,hand,lane,col))return {ok:false,reason:'La case de déploiement est occupée.'};
 const drawAfter=c.type==='sort'?castSpell(b,side,hand.id,lane,{emit:fx,hit,damageHero,sweepDead,checkOutcome,note,controlHooks}):0;
 if(side==='p'){if(!b.cardUses)b.cardUses={};b.cardUses[hand.id]=(b.cardUses[hand.id]||0)+1;}
 hero.discard.push(hand.rarity===undefined?hand.id:{id:hand.id,rarity:hand.rarity});hero.hand.splice(index,1);hero.cardsPlayed++;
 if(drawAfter)draw(b,side,drawAfter);
 return {ok:true};
}
export function playPlayerCard(b,index,lane,col=entryColumn(b,'p')){return b.phase==='player'?play(b,'p',index,lane,col):{ok:false,reason:'Ce n’est pas votre tour.'};}
// Projection exacte sur une copie isolée : aucune consommation réelle ni règle recopiée.
export function previewPlayerSpell(b,index,lane){
 if(CARDS[b.heroes.p.hand[index]?.id]?.type!=='sort')return {ok:false,reason:'Sélectionnez un sort.'};
 const copy=JSON.parse(JSON.stringify(b));copy.vfx=[];
 const before=captureCombatFrame(copy),result=playPlayerCard(copy,index,lane);
 if(!result.ok)return result;
 const ability=CARDS[b.heroes.p.hand[index].id].ability;
 const detail=ability==='spell_ranger_draw'?`Pioche : ${copy.heroes.p.hand.length-(b.heroes.p.hand.length-1)} carte(s).`:['spell_hasten','spell_slow'].includes(ability)?copy.log.find(s=>s.startsWith(ability==='spell_hasten'?'Élan des Heures :':'Nœud du Temps :'))||'':'';
 return {ok:true,before,after:captureCombatFrame(copy),detail,events:copy.vfx.map(e=>({...e,frame:e.frame}))};
}
function sweepDead(b){
 for(let lane=0;lane<laneCount(b);lane++)for(let col=1;col<=lastCell(b);col++){
  const u=b.board[lane][col];if(u&&u.hp<=0){resolveUnitDeath(b,u,lane,col,fx);fx(b,{type:'death',lane,col,side:u.side,icon:CARDS[u.id]?.icon||'✦'});b.board[lane][col]=null;}
 }
}
function checkOutcome(b){
 if(b.heroes.e.hp<=0){b.status='victory';b.phase='finished';note(b,'VICTOIRE ! La couronne ennemie est vaincue.');}
 else if(b.heroes.p.hp<=0){b.status='defeat';b.phase='finished';note(b,'DÉFAITE. Vos troupes doivent se replier.');}
 else if(b.round>35){
  b.status=b.heroes.p.hp>=b.heroes.e.hp?'victory':'defeat';b.phase='finished';note(b,'La bataille s’achève après 35 tours.');
 }
}
function enemyAct(b){
 const h=b.heroes.e;
 if(b.aiBoss&&h.hp>0&&h.hp*2<=h.maxhp&&!b.aiPhaseAnnounced){
  b.aiPhaseAnnounced=true;note(b,`Le boss entre en phase de furie : son comportement devient plus offensif !`);
 }
 let actions=0;
 while(actions<2 && b.status==='active'){
  const choices=rankEnemyMoves(b);
  if(!choices.length)break; // Il vaut parfois mieux garder ses sorts qu'en gaspiller un.
  let moved=false;
  for(const choice of choices){
   const result=play(b,'e',choice.index,choice.lane,choice.col);
   if(!result.ok)continue;
   b.aiLastPlan=`${choice.reason} · ligne ${choice.lane+1}`;
   note(b,`Tactique adverse : ${b.aiLastPlan}.`);
   moved=true;actions++;break;
  }
  if(!moved)break;
 }
}

function resolvePoison(b,sideFilter=null){
 for(const row of b.board)for(const u of row)if(u&&u.poisonTurns>0&&(!sideFilter||u.side===sideFilter)){
  if(!tickUnitPoison(b,u))continue;const pos=b.board.findIndex(row=>row.includes(u));if(pos>=0){const col=b.board[pos].indexOf(u);fx(b,{type:'poison',lane:pos,col,damage:u.poison});}
 }
 sweepDead(b);
}
function moveUnits(b,sideFilter=null){
 // Legacy combats alternate initiative; the new mode resolves each camp separately.
 for(const side of sideFilter?[sideFilter]:(b.round%2?['p','e']:['e','p']))for(let lane=0;lane<laneCount(b);lane++){
  const cols=Array.from({length:lastCell(b)},(_,i)=>side==='p'?lastCell(b)-i:i+1);
  for(const original of cols){const u=b.board[lane][original];if(!u||u.side!==side||u.stun>0)continue;
   if(u.movementRoot){delete u.movementRoot;continue;}
   let col=original;const steps=unitMovementSteps(u,silenced(b,u));
   for(let step=0;step<steps;step++){
    if(findTarget(b,lane,col,u))break;
    const next=col+forward(side);
    if(next<1||next>lastCell(b))break;
    let destination=next;
    if(b.board[lane][next]){
      if(isFlying(u)){
        const leap=next+forward(side);
        if(leap<1||leap>lastCell(b)||b.board[lane][leap])break;
        destination=leap;
      }else break;
    }
    b.board[lane][destination]=u;b.board[lane][col]=null;u.movedThisRound=true;fx(b,{type:'move',lane,from:col,to:destination,side,icon:CARDS[u.id]?.icon||'♞'});col=destination;
    enterCell(b,u,lane,col);if(u.hp<=0||u.stun>0)break;
   }
  }
 }
}

function retaliate(b,defender,attacker,lane,defenderCol,attackerCol,defenderLane=lane){
 if(defenderLane!==lane)return; // Une interception interligne ne crée pas de contact.
 const bonus=formationBonus(b,lane,defender)+(defender.rallyUntil>=b.round?1:0);
 if(resolveRetaliation(b,defender,attacker,lane,defenderCol,attackerCol,bonus,note))recordTrialFact(b,defender,'ripostes',1);
}

function resolveAttackExtras(b,u,lane,sourceCol,targetLane,targetCol,hit,suppressed=false){
 const p=versionUnitAbilities(u)?.rearShot;if(!p||suppressed||lane!==targetLane)return;
 const dir=u.side==='p'?1:-1;
 // Une interception arrière/interligne ne crée pas de cible derrière le tireur.
 if((targetCol-sourceCol)*dir<=0)return;
 const col=targetCol+dir;if(col<1||col>lastCell(b))return;
 const other=b.board[lane][col];
 if(other&&other.hp>0&&other.side!==u.side)hit(b,other,p.amount,u.side,p.ignoreArmor);
}

function strike(b,u,target,atk,from,to,sameLine=true,charged=false){
 const before=target.hp;if(atk>0)hit(b,target,atk,u.side,unitHasPierce(u,silenced(b,u),charged),true);
 const damage=Math.max(0,before-target.hp);
 if(sameLine&&(to-from)*(u.side==='p'?1:-1)>=2)recordTrialFact(b,u,'rangedDamage',damage);
 return atk>0&&before>0&&target.hp<=0;
}
function resolveAttacks(b,sideFilter=null){
 const intents=[];
 for(let lane=0;lane<laneCount(b);lane++)for(let col=1;col<=lastCell(b);col++){
  const u=b.board[lane][col];if(!u||u.hp<=0||u.stun>0||(sideFilter&&u.side!==sideFilter))continue;
  const target=findTarget(b,lane,col,u);
  const charged=!silenced(b,u)&&unitChargeAmount(u)>0&&!!u.movedThisRound;
  if(target){const furious=!!u.fury;intents.push({u,lane,col,target,atk:consumeAttackPenalty(u,u.atk+formationBonus(b,lane,u)+(u.rallyUntil>=b.round?1:0)+(charged?unitChargeAmount(u):0)),ability:activeAbility(b,u),charged,furious,suppressed:silenced(b,u)});}
 }
 // All intents are collected before damage; the round is effectively simultaneous.
 for(const intent of intents){const {u,lane,target,atk,ability,charged}=intent;
  const guardIntercept = target.type==='hero' ? findCrownGuardian(b,lane,target.side,intent.col) : null;
  const targetColForFx = guardIntercept?guardIntercept.col:(target.type==='hero'?crownColumn(b,target.side):target.col);
  const targetLane=guardIntercept?.lane??lane;
  fx(b,{type:'attack',side:u.side,lane:targetLane,...(targetLane!==lane?{fromLane:lane}:{}),from:intent.col,to:targetColForFx,ranged:!!u.ranged,magic:['splash','poison'].includes(ability),damage:atk,charged,icon:CARDS[u.id]?.icon||'⚔'});
  if(charged)note(b,`Charge de ${CARDS[u.id]?.name||'la créature'} : +${unitChargeAmount(u)} attaque sur la ligne ${lane+1}.`);
  if(target.type==='hero'){
   if(guardIntercept){
    const killed=strike(b,u,guardIntercept.u,atk,intent.col,guardIntercept.col,guardIntercept.lane===lane,charged);
    note(b,`${CARDS[guardIntercept.u.id]?.name||'Le gardien'} intercepte une attaque destinée à ${target.side==='p'?'votre couronne':'la couronne ennemie'} sur la ligne ${lane+1}.`);
    if(ability==='lifesteal'){const h=b.heroes[u.side];h.hp=Math.min(h.maxhp,h.hp+2);}
    applyAttackEffects(u,guardIntercept.u,intent.suppressed,b.round,atk>0);
    if(atk>0)resolveStrikeRewards(b,u,lane,intent.col,{...intent,killed},fx);
    resolveAttackExtras(b,u,lane,intent.col,guardIntercept.lane,guardIntercept.col,hit,silenced(b,u));
    retaliate(b,guardIntercept.u,u,lane,guardIntercept.col,intent.col,guardIntercept.lane);
   }else{damageHero(b,target.side,atk);if(ability==='lifesteal'){const h=b.heroes[u.side];h.hp=Math.min(h.maxhp,h.hp+2);}}
  } else {
   const killed=strike(b,u,target.target,atk,intent.col,target.col,true,charged);
   if(ability==='lifesteal'){const h=b.heroes[u.side];h.hp=Math.min(h.maxhp,h.hp+2);}
   applyAttackEffects(u,target.target,intent.suppressed,b.round,atk>0);
   if(atk>0)resolveStrikeRewards(b,u,lane,intent.col,{...intent,killed},fx);
   if(ability==='splash'){
    const extra=b.board[lane].find(v=>v&&v.side!==u.side&&v.uid!==target.target.uid&&v.hp>0);
    if(extra)hit(b,extra,2,u.side);
   }
   resolveAttackExtras(b,u,lane,intent.col,lane,target.col,hit,silenced(b,u));
   retaliate(b,target.target,u,lane,target.col,intent.col);
  }
 }
 // Le bonus de charge ne dure qu'un seul tour et doit survivre aux sauvegardes historiques.
 for(const row of b.board)for(const u of row)if(u&&(!sideFilter||u.side===sideFilter))u.movedThisRound=false;
 sweepDead(b);
 resolveRegeneration(b,sideFilter,fx);
 resolveUnitSupport(b,sideFilter,fx);
 for(const row of b.board)for(const u of row)if(u&&u.stun>0&&(!sideFilter||u.side===sideFilter))u.stun--;
 checkOutcome(b);
}
const hasBattleTalent=(b,id)=>Array.isArray(b.heroTalents)&&b.heroTalents.includes(id);
export function usePower(b){
 const rulesError=battleRulesError(b);if(rulesError)return {ok:false,reason:rulesError};
 if(b.phase!=='player'||b.status!=='active')return {ok:false,reason:'Action impossible.'};
 if(b.powerCooldown>0)return {ok:false,reason:`Pouvoir disponible dans ${b.powerCooldown} tour(s).`};
 b.powerCooldown=3;
 fx(b,{type:'power',lane:Math.floor(laneCount(b)/2),from:0,to:crownColumn(b,'e'),variant:b.heroClass});
 if(b.heroClass==='gardien'){
  const h=b.heroes.p;h.hp=Math.min(h.maxhp,h.hp+4+(hasBattleTalent(b,'gardien_serment')?2:0));h.shield=Math.min(15,h.shield+2+(hasBattleTalent(b,'gardien_barriere')?1:0));
  if(hasBattleTalent(b,'gardien_sentinelle')){
   const all=b.board.flat().filter(u=>u&&u.side==='p'&&u.hp>0&&u.hp<u.maxhp).sort((a,z)=>a.hp/a.maxhp-z.hp/z.maxhp);
   if(all[0])all[0].hp=Math.min(all[0].maxhp,all[0].hp+2);
  }
  note(b,'Serment protecteur : le héros et ses alliés sont renforcés.');
 }else if(b.heroClass==='arcaniste'){
  let target=null;
  for(let l=0;l<laneCount(b);l++){const foe=frontEnemy(b,'p',l);if(foe&&(!target||foe.i<target.i))target=foe;}
  if(target){
   hit(b,target.u,4+(b.powerBonus||0)+(hasBattleTalent(b,'arcaniste_focus')?1:0),'p');
   if(hasBattleTalent(b,'arcaniste_echos')){
    const others=b.board.flat().filter(u=>u&&u.side==='e'&&u.hp>0&&u.uid!==target.u.uid);
    if(others[0])hit(b,others[0],2,'p');
   }
   sweepDead(b);
  }else damageHero(b,'e',2+(b.powerBonus||0)+(hasBattleTalent(b,'arcaniste_focus')?1:0));
  if(hasBattleTalent(b,'arcaniste_barriere'))b.heroes.p.shield=Math.min(15,b.heroes.p.shield+2);
  if(hasBattleTalent(b,'arcaniste_tissage'))b.heroes.p.hp=Math.min(b.heroes.p.maxhp,b.heroes.p.hp+2);
  note(b,'Éclat astral : l’ennemi subit un sort.');
 }else if(b.heroClass==='rodeur'){
  let hits=0;
  for(let l=0;l<laneCount(b);l++){const target=frontEnemy(b,'p',l);if(target){hit(b,target.u,2+(hasBattleTalent(b,'rodeur_precision')?2:0),'p');hits++;}}
  if(hasBattleTalent(b,'rodeur_couvert'))b.heroes.p.shield=Math.min(15,b.heroes.p.shield+2);
  if(hasBattleTalent(b,'rodeur_poursuite')&&!b.talentDrawUsed&&b.heroes.p.hand.length<7){
   const before=b.heroes.p.hand.length;draw(b,'p',1);
   if(b.heroes.p.hand.length>before)b.talentDrawUsed=true;
  }
  if(hits&&hasBattleTalent(b,'rodeur_concentration'))b.heroes.p.hp=Math.min(b.heroes.p.maxhp,b.heroes.p.hp+2);
  sweepDead(b);note(b,'Volée : les lignes ennemies sont touchées.');
 }else if(b.heroClass==='clerc'){
  const h=b.heroes.p;h.hp=Math.min(h.maxhp,h.hp+3+(b.powerBonus||0)+(hasBattleTalent(b,'clerc_souffle')?2:0)+(hasBattleTalent(b,'clerc_soutien')?1:0));
  for(let lane=0;lane<laneCount(b);lane++){const allies=b.board[lane].filter(u=>u&&u.side==='p'&&u.hp<u.maxhp).sort((a,z)=>(a.hp/a.maxhp)-(z.hp/z.maxhp));if(allies[0])allies[0].hp=Math.min(allies[0].maxhp,allies[0].hp+3+(b.powerBonus||0)+(hasBattleTalent(b,'clerc_soutien')?2:0));}
  if(hasBattleTalent(b,'clerc_foi'))h.shield=Math.min(15,h.shield+2);
  if(hasBattleTalent(b,'clerc_purification')){
   // Useful between poison encounters, while keeping the branch below major healing.
   h.shield=Math.min(15,h.shield+1);
   for(const u of b.board.flat())if(u&&u.side==='p'){clearUnitPoison(u);u.stun=0;}
  }
  note(b,'Bénédiction : le héros et ses alliés sont soignés.');
 }
 checkOutcome(b);return {ok:true};
}
// Un tour alternatif ne modifie pas les combats déjà sauvegardés sans ce mode.
export function playEnemyCard(b){
 const rulesError=battleRulesError(b);if(rulesError)return {ok:false,reason:rulesError};
 if(b.turnFlow!=='alternating'||b.phase!=='enemy'||b.status!=='active')return {ok:false,reason:'Ce n’est pas le tour adverse.'};
 if(b.heroes.e.cardsPlayed>=2)return {ok:true,done:true};
 const h=b.heroes.e;
 if(b.aiBoss&&h.hp>0&&h.hp*2<=h.maxhp&&!b.aiPhaseAnnounced){
  b.aiPhaseAnnounced=true;note(b,'Le boss entre en phase de furie : son comportement devient plus offensif !');
 }
 for(const choice of rankEnemyMoves(b)){
  const result=play(b,'e',choice.index,choice.lane,choice.col);
  if(!result.ok)continue;
  b.aiLastPlan=`${choice.reason} · ligne ${choice.lane+1}`;
  note(b,`Tactique adverse : ${b.aiLastPlan}.`);
  return {ok:true,done:false,id:choice.id,lane:choice.lane,col:choice.col??entryColumn(b,'e')};
 }
 return {ok:true,done:true};
}
export function finishEnemyTurn(b){
 const rulesError=battleRulesError(b);if(rulesError)return {ok:false,reason:rulesError};
 if(b.turnFlow!=='alternating'||b.phase!=='enemy'||b.status!=='active')return {ok:false,reason:'Ce n’est pas le tour adverse.'};
 resolvePoison(b,'e');prepareControlUnits(b,controlHooks,'e');moveUnits(b,'e');resolveAttacks(b,'e');expireControl(b,fx);
 if(b.round>=17&&b.status==='active'){
  const attrition=1+Math.floor((b.round-17)/6);
  damageHero(b,'p',attrition);damageHero(b,'e',attrition);
  if(b.round===17)note(b,'Les flammes de la guerre s’étendent : les deux héros perdent des PV à chaque tour.');
  checkOutcome(b);
 }
 if(b.status==='active'){
  b.round++;b.phase='player';b.powerCooldown=Math.max(0,b.powerCooldown-1);
  for(const side of ['p','e']){
   const h=b.heroes[side];h.cardsPlayed=0;
   for(const card of h.hand)card.wait=Math.max(0,card.wait-1);
   draw(b,side,1);
  }
  note(b,`Tour ${b.round} : choisissez vos cartes, puis validez.`);
  checkOutcome(b);
 }
 return {ok:true};
}
export function endPlayerTurn(b){
 const rulesError=battleRulesError(b);if(rulesError)return {ok:false,reason:rulesError};
 if(b.phase!=='player'||b.status!=='active')return {ok:false,reason:'Le tour est terminé.'};
 if(b.turnFlow==='alternating'){
  b.phase='enemy';
  resolvePoison(b,'p');prepareControlUnits(b,controlHooks,'p');moveUnits(b,'p');resolveAttacks(b,'p');recordTrialTurn(b);
  if(b.status==='active')note(b,'L’IA prépare ses cartes.');
  return {ok:true};
 }
 b.phase='resolving';enemyAct(b);
 if(b.status==='active'){
  resolvePoison(b);prepareControlUnits(b,controlHooks);moveUnits(b);resolveAttacks(b);expireControl(b,fx);
  // Fatigue of the battlefield avoids endless defensive stalemates.
  if(b.round>=17&&b.status==='active'){
   const attrition=1+Math.floor((b.round-17)/6);
   damageHero(b,'p',attrition);damageHero(b,'e',attrition);
   if(b.round===17)note(b,'Les flammes de la guerre s’étendent : les deux héros perdent des PV à chaque tour.');
   checkOutcome(b);
  }
 }
 if(b.status==='active'){
  b.round++;b.phase='player';b.powerCooldown=Math.max(0,b.powerCooldown-1);
  for(const side of ['p','e']){
   const h=b.heroes[side];h.cardsPlayed=0;
   for(const card of h.hand)card.wait=Math.max(0,card.wait-1);
   draw(b,side,1);
  }
  note(b,`Tour ${b.round} : choisissez vos cartes, puis terminez le tour.`);
  checkOutcome(b);
 }
 return {ok:true};
}

