// Contrôle du plateau : règles pures, utilisées par le moteur, l'IA et les aperçus.
// Aucun accès aux mains, pioches, profils, DOM ou stockage.
import {CARDS,CHARGE_IDS,RIPOSTE_IDS} from '../data.js';
const alive=u=>!!u&&u.hp>0;
const direction=side=>side==='p'?1:-1;
export const CONTROL_IDS=['seal_silence','mist_inquisitor','transposition','portal_walker','rune_trap','sylvan_trapper'];
export const silenced=(b,u)=>alive(u)&&Number.isFinite(u.silenceUntil)&&u.silenceUntil>=b.round;
export const activeAbility=(b,u)=>silenced(b,u)?'':u.ability;
export function silenceValue(u){
 const value={heal:6,inspire:5,splash:6,poison:5,lifesteal:5,pierce:3,haste:3,silence:6,portal:4,trapper:4}[u?.ability]||0;
 return value+(CHARGE_IDS.has(u?.id)?2:0)+(RIPOSTE_IDS.has(u?.id)?2:0);
}
export function canSilence(b,u){return alive(u)&&silenceValue(u)>0&&!silenced(b,u)&&!(u.silenceGuardUntil>=b.round);}
export function silenceTarget(b,side,lane){
 return b.board[lane].map((u,col)=>({u,col})).filter(({u})=>u?.side!==side&&canSilence(b,u))
  .sort((a,z)=>silenceValue(z.u)-silenceValue(a.u)||z.u.atk-a.u.atk||direction(side)*(a.col-z.col)||a.u.uid-z.u.uid)[0]||null;
}
export function applySilence(b,u,duration=2){
 if(!canSilence(b,u))return false;
 const turns=Math.max(1,Math.min(2,Math.trunc(duration)||1));
 u.silenceUntil=b.round+turns-1;
 // Une résolution complète avec capacités rétablies avant un nouveau silence.
 u.silenceGuardUntil=u.silenceUntil+1;
 return true;
}
export function teleportDestinationError(b,side,fromLane,col,toLane){
 if(!Number.isInteger(fromLane)||!Number.isInteger(toLane)||fromLane<0||fromLane>2||toLane<0||toLane>2||fromLane===toLane)return 'Choisissez une autre ligne valide.';
 if(!Number.isInteger(col)||col<1||col>5||col===(side==='p'?5:1))return 'Téléportation interdite devant la couronne adverse.';
 const u=b.board[fromLane]?.[col];
 if(!alive(u)||u.side!==side)return 'Créature alliée introuvable.';
 if(u.teleportedRound===b.round)return 'Cette créature a déjà été téléportée ce tour.';
 if(b.board[toLane][col])return 'La destination est occupée.';
 return '';
}
export function teleportPlan(b,side,toLane){
 if(!Number.isInteger(toLane)||toLane<0||toLane>2)return null;
 const candidates=[];
 for(let lane=0;lane<3;lane++)for(let col=1;col<=5;col++){
  if(!teleportDestinationError(b,side,lane,col,toLane))candidates.push({u:b.board[lane][col],fromLane:lane,col,toLane});
 }
 return candidates.sort((a,z)=>direction(side)*(z.col-a.col)||a.fromLane-z.fromLane||a.u.uid-z.u.uid)[0]||null;
}
// Avantage public de position ; pas d'anticipation de cartes privées.
function positionValue(b,side,u,lane,col){
 const foes=b.board[lane].map((v,c)=>({u:v,col:c})).filter(v=>alive(v.u)&&v.u.side!==side);
 const range=u.ranged?2:1;
 let value=0;
 for(const foe of foes){
  const ahead=(foe.col-col)*direction(side);
  if(ahead>0&&ahead<=range)value+=u.atk>=foe.u.hp?5:1;
  if(Math.abs(foe.col-col)<= (foe.u.ranged?2:1))value-=foe.u.atk>=u.hp?9:3;
  const homeDistance=side==='p'?foe.col:6-foe.col;
  if(homeDistance<=2&&ahead>0)value+=6;
 }
 if(!foes.length)value+=3;
 const next=col+direction(side);
 if(next>=1&&next<=5&&b.board[lane][next])value-=2;
 // Tous les pièges sont publics ; le repositionnement doit en tenir compte.
 for(const t of b.traps||[])if(t.owner!==side&&t.lane===lane&&t.col===col&&t.expiresRound>=b.round)value-=8;
 return value;
}
export function teleportGain(b,side,plan){
 return plan?positionValue(b,side,plan.u,plan.toLane,plan.col)-positionValue(b,side,plan.u,plan.fromLane,plan.col):0;
}
export function teleportUnit(b,side,plan,emit=()=>{},note=()=>{},enter=()=>{}){
 if(!plan||teleportDestinationError(b,side,plan.fromLane,plan.col,plan.toLane))return false;
 const u=b.board[plan.fromLane][plan.col];
 b.board[plan.fromLane][plan.col]=null;b.board[plan.toLane][plan.col]=u;
 u.teleportedRound=b.round;
 emit(b,{type:'teleport',side,fromLane:plan.fromLane,lane:plan.toLane,from:plan.col,to:plan.col,icon:CARDS[u.id]?.icon||'✧'});
 note(b,`${CARDS[u.id]?.name} change de ligne (${plan.fromLane+1} → ${plan.toLane+1}), sans avancer.`);
 enter(b,u,plan.toLane,plan.col);
 return true;
}
export function trapPlan(b,side,lane,col){
 if(!Number.isInteger(lane)||lane<0||lane>2)return null;
 const traps=(b.traps||[]).filter(t=>t.expiresRound>=b.round);
 if(traps.filter(t=>t.owner===side).length>=2)return null;
 const columns=col===undefined?[3,side==='p'?2:4,side==='p'?4:2]:[col];
 const target=columns.find(c=>Number.isInteger(c)&&c>=2&&c<=4&&!b.board[lane][c]&&!traps.some(t=>t.lane===lane&&t.col===c));
 return target===undefined?null:{lane,col:target};
}
export function placeTrap(b,side,plan,kind='rune',emit=()=>{},note=()=>{}){
 if(!plan||!trapPlan(b,side,plan.lane,plan.col))return false;
 if(!b.traps)b.traps=[];
 const trap={owner:side,lane:plan.lane,col:plan.col,kind,damage:kind==='snare'?1:3,stun:kind==='snare'?1:0,expiresRound:b.round+2};
 b.traps.push(trap);emit(b,{type:'trap-place',side,lane:trap.lane,col:trap.col});
 note(b,`Piège ${kind==='snare'?'sylvestre':'runique'} ${side==='p'?'allié':'adverse'} armé : ligne ${trap.lane+1}, case ${trap.col}.`);
 return true;
}
export function triggerTrap(b,u,lane,col,hit,emit=()=>{},note=()=>{}){
 if(!alive(u))return false;
 const index=(b.traps||[]).findIndex(t=>t.lane===lane&&t.col===col&&t.owner!==u.side&&t.expiresRound>=b.round);
 if(index<0)return false;
 const [trap]=b.traps.splice(index,1); // Retrait avant l'effet : aucune réentrée/boucle.
 const damage=hit(b,u,trap.damage,trap.owner);
 if(u.hp>0&&trap.stun)u.stun=Math.max(u.stun||0,trap.stun);
 emit(b,{type:'trap-trigger',side:trap.owner,lane,col,damage});
 note(b,`Piège déclenché sur ${CARDS[u.id]?.name} : ${damage} dégât(s)${trap.stun?' et immobilisation':''}.`);
 return true;
}
export function expireControl(b,emit=()=>{}){
 if(b.traps){
  for(const t of b.traps)if(t.expiresRound<=b.round)emit(b,{type:'trap-expire',lane:t.lane,col:t.col,side:t.owner});
  b.traps=b.traps.filter(t=>t.expiresRound>b.round);
 }
 for(const row of b.board)for(const u of row)if(u&&u.silenceUntil<=b.round)delete u.silenceUntil;
}
export function controlTargetError(b,side,card,lane){
 if(card.ability==='spell_silence'&&!silenceTarget(b,side,lane))return 'Aucune capacité ennemie disponible à réduire au silence sur cette ligne.';
 if(card.ability==='spell_teleport'&&!teleportPlan(b,side,lane))return 'Aucun allié ne peut rejoindre cette ligne à la même colonne.';
 if(card.ability==='spell_trap'&&!trapPlan(b,side,lane))return 'Aucune case de piège disponible (deux pièges par camp maximum).';
 return '';
}
export function resolveControlSpell(b,side,card,lane,hooks){
 if(card.ability==='spell_silence'){
  const target=silenceTarget(b,side,lane);
  if(target&&applySilence(b,target.u,2))hooks.emit(b,{type:'silence',side,lane,col:target.col});
 }else if(card.ability==='spell_teleport')teleportUnit(b,side,teleportPlan(b,side,lane),hooks.emit,hooks.note,hooks.enter);
 else if(card.ability==='spell_trap')placeTrap(b,side,trapPlan(b,side,lane),'rune',hooks.emit,hooks.note);
}
// Capacités des nouvelles unités, une fois au plus tous les trois tours.
export function prepareControlUnits(b,hooks){
 const units=[];
 for(let lane=0;lane<3;lane++)for(let col=1;col<=5;col++)if(alive(b.board[lane][col]))units.push({u:b.board[lane][col],lane,col});
 // Même alternance d'initiative que le déplacement historique.
 const first=b.round%2?'p':'e';
 units.sort((a,z)=>(a.u.side===first?0:1)-(z.u.side===first?0:1)||a.lane-z.lane||a.col-z.col);
 for(const {u,lane,col} of units){
  if(!alive(u)||u.stun>0||silenced(b,u)||u.controlReadyRound>b.round)continue;
  let used=false;
  if(u.ability==='silence'){
   const target=silenceTarget(b,u.side,lane);
   if(target&&applySilence(b,target.u,1)){used=true;hooks.emit(b,{type:'silence',side:u.side,lane,col:target.col});hooks.note(b,`${CARDS[u.id].name} réduit ${CARDS[target.u.id].name} au silence pour ce tour.`);}
  }else if(u.ability==='trapper')used=placeTrap(b,u.side,trapPlan(b,u.side,lane,col+direction(u.side)),'snare',hooks.emit,hooks.note);
  else if(u.ability==='portal'){
   const plans=[];
   for(let toLane=0;toLane<3;toLane++)if(!teleportDestinationError(b,u.side,lane,col,toLane)){
    const p={u,fromLane:lane,col,toLane};plans.push({...p,gain:teleportGain(b,u.side,p)});
   }
   const best=plans.sort((a,z)=>z.gain-a.gain||a.toLane-z.toLane)[0];
   if(best?.gain>=2)used=teleportUnit(b,u.side,best,hooks.emit,hooks.note,hooks.enter);
  }
  if(used)u.controlReadyRound=b.round+3;
 }
}
