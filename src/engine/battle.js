// Moteur de combat tactique : aucun navigateur ou stockage externe.
import {CARDS,FACTIONS,FLYING_IDS,GUARD_IDS,CHARGE_IDS,RIPOSTE_IDS} from '../data.js';
import {rankEnemyMoves} from '../ai.js';
import {classSkillTargetError,resolveClassSkill} from './class-skills.js';
import {silenced,activeAbility,controlTargetError,resolveControlSpell,prepareControlUnits,triggerTrap,expireControl} from './battle-control.js';
import {chosenTalents} from '../talents.js';
import {tempoTargetError,resolveTempoSpell} from './tempo.js';
import {normalizeProfile,validateDeck,heroLevel,heroShieldBonus,gearBonus} from './profile.js';
import {unitStatContext,unitStats} from './unit-stats.js';
import {laneCount,lastCell,crownColumn,entryColumn,validLane,missionLayout} from './board.js';
export * from './board.js';
function rand(b){b.seed=(Math.imul(b.seed,1664525)+1013904223)>>>0;return b.seed/4294967296;}
function shuffle(b,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand(b)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function note(b,message){b.log.unshift(message);b.log=b.log.slice(0,12);}
function fx(b,event){
 if(!Array.isArray(b.vfx)||b.vfx.length>=80)return;
 const trace=u=>u?{uid:u.uid,cardId:u.id,side:u.side}:null;
 const col=['move','teleport'].includes(event.type)?event.to:event.type==='attack'?event.from:event.col;
 const actor=b.board[event.lane]?.[col];
 if(actor&&actor.side===event.side)event.actor=trace(actor);
 if(event.type==='attack')event.target=trace(b.board[event.lane]?.[event.to]);
 if(['poison','trap-trigger'].includes(event.type))event.target=trace(b.board[event.lane]?.[event.col]);
 b.vfx.push(event);
}
function enterCell(b,u,lane,col){triggerTrap(b,u,lane,col,hit,fx,note);sweepDead(b);}
const controlHooks={emit:fx,note,enter:enterCell};

function draw(b,side,n=1){
 const hero=b.heroes[side];for(let j=0;j<n;j++){
  if(hero.hand.length>=7)break;
  if(!hero.deck.length){
   if(!hero.discard.length)break;
   hero.deck=shuffle(b,hero.discard);hero.discard=[];
  }
  const id=hero.deck.pop();if(!CARDS[id])continue;
  hero.hand.push({id,wait:Math.max(0,CARDS[id].delay-1)});
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
 b.heroes.p.deck=shuffle(b,p.deck);
 b.heroes.e.deck=shuffle(b,mission.deck);
 draw(b,'p',5+b.libraryBonus);draw(b,'e',5);
 note(b,`Mission : ${mission.name}. Votre tour commence.`);
 return b;
}
const forward=side=>side==='p'?1:-1;
const isFlying=u=>!!u&&FLYING_IDS.has(u.id);
const isGuard=u=>!!u&&GUARD_IDS.has(u.id) && u.hp>0;

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
 const range=unit.ranged?2:1;
 let fallback=null;
 for(let d=1;d<=range;d++){
  const targetCol=col+forward(unit.side)*d;
  const target=enemyAt(b,lane,targetCol,unit.side);
  if(target && isGuard(target))return {type:'unit',target,col:targetCol};
  if(target && !fallback)fallback={type:'unit',target,col:targetCol};
 }
 if(fallback)return fallback;
 const heroDist=unit.side==='p'?crownColumn(b,'e')-col:col;
 return heroDist<=range?{type:'hero',side:unit.side==='p'?'e':'p'}:null;
}
function spawn(b,side,id,lane){
 const c=CARDS[id];if(!c||c.type==='sort')return false;
 const col=entryColumn(b,side);if(b.board[lane][col])return false;
 const stats=unitStats(b,id,side);
 const u={uid:b.nextUnitId++,id,side,atk:stats.atk,maxhp:stats.maxhp,
  hp:stats.maxhp,armor:c.ability==='armor'?2:0,ranged:c.ability==='ranged',
  ability:c.ability,stun:0,poison:0,poisonTurns:0};
 b.board[lane][col]=u;
 fx(b,{type:'spawn',side,lane,col,icon:c.icon});
 if(formationBonus(b,lane,u))note(b,`Concorde de ${FACTIONS[c.faction].short} : +1 attaque aux alliés de cet ordre sur la ligne ${lane+1}.`);
 if(c.ability==='ward')b.heroes[side].shield=Math.min(20,b.heroes[side].shield+3);
 note(b,`${side==='p'?'Vous invoquez': 'L’ennemi invoque'} ${c.name} (ligne ${lane+1}).`);
 return true;
}
function damageHero(b,side,amount){
 const h=b.heroes[side];const absorbed=Math.min(h.shield,amount);h.shield-=absorbed;
 h.hp=Math.max(0,h.hp-(amount-absorbed));
}
function locateEnemy(b,side,lane){
 const list=b.board[lane].map((u,i)=>u&&u.side!==side?{u,i}:null).filter(Boolean);
 return side==='p'?list.sort((a,c)=>a.i-c.i)[0]:list.sort((a,c)=>c.i-a.i)[0];
}
function cast(b,side,id,lane){
 const c=CARDS[id],enemy=side==='p'?'e':'p',foe=locateEnemy(b,side,lane);
 let drawAfter=0;
 const supportSpell=['spell_heal','spell_buff','spell_ward'].includes(c.ability);
 const allied=b.board[lane].findIndex(u=>u&&u.side===side);
 fx(b,{type:'spell',side,lane,from:crownColumn(b,side),to:supportSpell?(allied>=1?allied:crownColumn(b,side)):(foe?foe.i:crownColumn(b,enemy)),variant:c.ability,icon:c.icon});
 if(c.ability==='spell_bolt'){
  if(foe)hit(b,foe.u,4,side);else damageHero(b,enemy,2);
 }else if(c.ability==='spell_heal'){
  const hero=b.heroes[side];hero.hp=Math.min(hero.maxhp,hero.hp+5);
  b.board[lane].forEach(u=>{if(u&&u.side===side)u.hp=Math.min(u.maxhp,u.hp+2)});
 }else if(c.ability==='spell_buff'){
  b.board[lane].forEach(u=>{if(u&&u.side===side)u.atk+=2;});
 }else if(c.ability==='spell_storm'){
  b.board[lane].filter(u=>u&&u.side===enemy).forEach(u=>hit(b,u,3,side));
 }else if(c.ability==='spell_root'){
  if(foe)foe.u.stun=2;
 }else if(c.ability==='spell_ward'){
  b.heroes[side].shield=Math.min(15,b.heroes[side].shield+5);
 }else if(['spell_silence','spell_teleport','spell_trap'].includes(c.ability)){
  resolveControlSpell(b,side,c,lane,controlHooks);
 }else if(['spell_hasten','spell_slow'].includes(c.ability)){
  resolveTempoSpell(b,side,c,note);
 }else if(c.heroClass){
  drawAfter=resolveClassSkill(b,side,c,lane,hit);
 }
 note(b,`${side==='p'?'Vous lancez':'L’ennemi lance'} ${c.name} (ligne ${lane+1}).`);
 sweepDead(b);
 checkOutcome(b);
 return drawAfter;
}
function play(b,side,index,lane){
 if(b.status!=='active'||!Number.isInteger(lane)||!validLane(b,lane))return {ok:false,reason:'Combat terminé ou ligne invalide.'};
 const hero=b.heroes[side],hand=hero.hand[index];
 if(!hand)return {ok:false,reason:'Carte introuvable.'};
 if(hand.wait>0)return {ok:false,reason:`Cette carte sera disponible dans ${hand.wait} tour(s).`};
 if(hero.cardsPlayed>=2)return {ok:false,reason:'Limite de deux cartes par tour.'};
 const c=CARDS[hand.id];
 if(!c)return {ok:false,reason:'Carte inconnue.'};
 if(c.heroClass&&(side!=='p'||c.heroClass!==b.heroClass))return {ok:false,reason:'Compétence réservée à une autre classe.'};
 const targetError=classSkillTargetError(b,side,c,lane)||controlTargetError(b,side,c,lane)||tempoTargetError(b,side,c);
 if(targetError)return {ok:false,reason:targetError};
 if(c.type==='unité'&&!spawn(b,side,hand.id,lane))return {ok:false,reason:'La case de déploiement est occupée.'};
 const drawAfter=c.type==='sort'?cast(b,side,hand.id,lane):0;
 if(side==='p'){if(!b.cardUses)b.cardUses={};b.cardUses[hand.id]=(b.cardUses[hand.id]||0)+1;}
 hero.discard.push(hand.id);hero.hand.splice(index,1);hero.cardsPlayed++;
 if(drawAfter)draw(b,side,drawAfter);
 return {ok:true};
}
export function playPlayerCard(b,index,lane){return b.phase==='player'?play(b,'p',index,lane):{ok:false,reason:'Ce n’est pas votre tour.'};}
function hit(b,u,raw,bySide,ignoreArmor=false){
 // Une attaque sur une unité déjà vaincue ne doit pas créer un second kill.
 if(!u||u.hp<=0)return 0;
 let dmg=Math.max(1,raw-(ignoreArmor?0:(u.armor||0)));
 const barrier=u.barrier||0;
 if(barrier>0){const absorbed=Math.min(barrier,dmg);u.barrier=barrier-absorbed;dmg-=absorbed;}
 u.hp=Math.max(0,u.hp-dmg);
 if(bySide!==u.side&&u.hp<=0)b.stats[bySide==='p'?'playerKills':'enemyKills']++;
 return dmg;
}
function sweepDead(b){
 for(let lane=0;lane<laneCount(b);lane++)for(let col=1;col<=lastCell(b);col++){
  const u=b.board[lane][col];if(u&&u.hp<=0){fx(b,{type:'death',lane,col,side:u.side,icon:CARDS[u.id]?.icon||'✦'});b.board[lane][col]=null;}
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
   const result=play(b,'e',choice.index,choice.lane);
   if(!result.ok)continue;
   b.aiLastPlan=`${choice.reason} · ligne ${choice.lane+1}`;
   note(b,`Tactique adverse : ${b.aiLastPlan}.`);
   moved=true;actions++;break;
  }
  if(!moved)break;
 }
}

function resolvePoison(b){
 for(const row of b.board)for(const u of row)if(u&&u.poisonTurns>0){
  u.hp=Math.max(0,u.hp-u.poison);u.poisonTurns--;const pos=b.board.findIndex(row=>row.includes(u));if(pos>=0){const col=b.board[pos].indexOf(u);fx(b,{type:'poison',lane:pos,col,damage:u.poison});}
 }
 sweepDead(b);
}
function moveUnits(b){
 // Alternate start side by round to avoid systematic movement advantage.
 for(const side of b.round%2?['p','e']:['e','p'])for(let lane=0;lane<laneCount(b);lane++){
  const cols=Array.from({length:lastCell(b)},(_,i)=>side==='p'?lastCell(b)-i:i+1);
  for(const original of cols){const u=b.board[lane][original];if(!u||u.side!==side||u.stun>0)continue;
   let col=original;const steps=activeAbility(b,u)==='haste'?2:1;
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
function findGuardianForHero(b,lane,heroSide){
 const guards=[];
 for(let col=1;col<=lastCell(b);col++){
  const u=b.board[lane][col];
  if(u&&u.side===heroSide&&isGuard(u))guards.push({u,col});
 }
 if(!guards.length)return null;
 return heroSide==='p'?guards.sort((a,z)=>z.col-a.col)[0]:guards.sort((a,z)=>a.col-z.col)[0];
}

function retaliate(b,defender,attacker,lane,defenderCol,attackerCol){
 // Riposte : seulement contre une attaque au contact, si les deux unités vivent.
 // Une seule riposte par tour et aucune contre-riposte en chaîne.
 if(!RIPOSTE_IDS.has(defender.id)||silenced(b,defender)||defender.hp<=0||attacker.hp<=0||attacker.ranged||
    defender.side===attacker.side||Math.abs(defenderCol-attackerCol)!==1||defender.lastRiposteRound===b.round)return;
 defender.lastRiposteRound=b.round;
 const dealt=hit(b,attacker,2,defender.side);
 if(dealt>0){
  fx(b,{type:'attack',side:defender.side,lane,from:defenderCol,to:attackerCol,ranged:false,magic:false,damage:dealt,riposte:true,icon:'↶'});
  note(b,`Riposte de ${CARDS[defender.id]?.name||'la créature'} : ${dealt} dégât(s).`);
 }
}

function resolveAttacks(b){
 const intents=[];
 for(let lane=0;lane<laneCount(b);lane++)for(let col=1;col<=lastCell(b);col++){
  const u=b.board[lane][col];if(!u||u.hp<=0||u.stun>0)continue;
  const target=findTarget(b,lane,col,u);
  const charged=!silenced(b,u)&&CHARGE_IDS.has(u.id)&&!!u.movedThisRound;
  if(target)intents.push({u,lane,col,target,atk:u.atk+formationBonus(b,lane,u)+(u.rallyUntil>=b.round?1:0)+(charged?2:0),ability:activeAbility(b,u),charged});
 }
 // All intents are collected before damage; the round is effectively simultaneous.
 for(const intent of intents){const {u,lane,target,atk,ability,charged}=intent;
  const guardIntercept = target.type==='hero' ? findGuardianForHero(b,lane,target.side) : null;
  const targetColForFx = guardIntercept?guardIntercept.col:(target.type==='hero'?crownColumn(b,target.side):target.col);
  fx(b,{type:'attack',side:u.side,lane,from:intent.col,to:targetColForFx,ranged:!!u.ranged,magic:['splash','poison'].includes(ability),damage:atk,charged,icon:CARDS[u.id]?.icon||'⚔'});
  if(charged)note(b,`Charge de ${CARDS[u.id]?.name||'la créature'} : +2 attaque sur la ligne ${lane+1}.`);
  if(target.type==='hero'){
   if(guardIntercept){
    hit(b,guardIntercept.u,atk,u.side,ability==='pierce');
    note(b,`${CARDS[guardIntercept.u.id]?.name||'Le gardien'} intercepte une attaque destinée à ${target.side==='p'?'votre couronne':'la couronne ennemie'} sur la ligne ${lane+1}.`);
    if(ability==='lifesteal'){const h=b.heroes[u.side];h.hp=Math.min(h.maxhp,h.hp+2);}
    if(ability==='poison'){guardIntercept.u.poison=1;guardIntercept.u.poisonTurns=Math.max(guardIntercept.u.poisonTurns,2);}
    retaliate(b,guardIntercept.u,u,lane,guardIntercept.col,intent.col);
   }else{damageHero(b,target.side,atk);if(ability==='lifesteal'){const h=b.heroes[u.side];h.hp=Math.min(h.maxhp,h.hp+2);}}
  } else {
   hit(b,target.target,atk,u.side,ability==='pierce');
   if(ability==='lifesteal'){const h=b.heroes[u.side];h.hp=Math.min(h.maxhp,h.hp+2);}
   if(ability==='poison'){target.target.poison=1;target.target.poisonTurns=Math.max(target.target.poisonTurns,2);}
   if(ability==='splash'){
    const extra=b.board[lane].find(v=>v&&v.side!==u.side&&v.uid!==target.target.uid&&v.hp>0);
    if(extra)hit(b,extra,2,u.side);
   }
   retaliate(b,target.target,u,lane,target.col,intent.col);
  }
 }
 // Le bonus de charge ne dure qu'un seul tour et doit survivre aux sauvegardes historiques.
 for(const row of b.board)for(const u of row)if(u)u.movedThisRound=false;
 sweepDead(b);
 // Persistent support abilities trigger after combat.
 for(let lane=0;lane<laneCount(b);lane++)for(const u of b.board[lane])if(u&&u.hp>0){
  if(activeAbility(b,u)==='heal'){
   const allies=b.board[lane].filter(v=>v&&v.side===u.side&&v.hp<v.maxhp);
   if(allies.length){allies.sort((a,z)=>(a.hp/a.maxhp)-(z.hp/z.maxhp));allies[0].hp=Math.min(allies[0].maxhp,allies[0].hp+2);const col=b.board[lane].indexOf(allies[0]);fx(b,{type:'heal',lane,col});}
  }
  if(activeAbility(b,u)==='inspire'){
   const allies=b.board[lane].filter(v=>v&&v.side===u.side&&v.uid!==u.uid);
   if(allies.length&&b.round%3===0){allies[0].atk=Math.min(allies[0].atk+1,12);}
  }
 }
 for(const row of b.board)for(const u of row)if(u&&u.stun>0)u.stun--;
 checkOutcome(b);
}
const hasBattleTalent=(b,id)=>Array.isArray(b.heroTalents)&&b.heroTalents.includes(id);
export function usePower(b){
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
  for(let l=0;l<laneCount(b);l++){const foe=locateEnemy(b,'p',l);if(foe&&(!target||foe.i<target.i))target=foe;}
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
  for(let l=0;l<laneCount(b);l++){const target=locateEnemy(b,'p',l);if(target){hit(b,target.u,2+(hasBattleTalent(b,'rodeur_precision')?2:0),'p');hits++;}}
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
   for(const u of b.board.flat())if(u&&u.side==='p'){u.poison=0;u.poisonTurns=0;u.stun=0;}
  }
  note(b,'Bénédiction : le héros et ses alliés sont soignés.');
 }
 checkOutcome(b);return {ok:true};
}
export function endPlayerTurn(b){
 if(b.phase!=='player'||b.status!=='active')return {ok:false,reason:'Le tour est terminé.'};
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
