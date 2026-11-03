// Barrières partagées par les défenses et les réactions aux morts, sans cycle.
const barrierKeys=['healBarrier','riposteBarrier','arrivalBarrier','chargeBarrier','furyBarrier','funeralBarrier'];
export function grantCrownShield(hero,parameters){
 const before=hero.shield;
 hero.shield=Math.max(before,Math.min(parameters.cap,before+parameters.amount));
 return hero.shield-before;
}
export function grantAbilityBarrier(u,key,parameters){
 if(!u||u.hp<=0||!barrierKeys.includes(key)||!parameters)return 0;
 const sources={...u.abilityBarriers};
 const remaining=Math.min(sources[key]||0,u.barrier||0);
 const added=Math.max(0,Math.min(parameters.amount,parameters.cap-remaining));
 if(!added)return 0;
 sources[key]=remaining+added;u.abilityBarriers=sources;
 u.barrier=(u.barrier||0)+added;
 return added;
}
export function grantSharedBarrier(u,amount,cap){
 const total=u.barrier||0;u.barrier=Math.max(total,Math.min(cap,total+amount));
}
export function absorbBarrier(u,damage){
 const absorbed=Math.min(u.barrier||0,damage);
 if((u.barrier||0)>0)u.barrier-=absorbed;
 if(absorbed&&u.abilityBarriers){
  let left=absorbed;const sources={...u.abilityBarriers};
  // Conserver l'ordre et les champs historiques, sans ajouter l'état nouveau
  // aux unités qui n'ont jamais reçu de barrière funéraire.
  for(const key of barrierKeys){
   if(key==='funeralBarrier'&&!Object.hasOwn(sources,key))continue;
   const used=Math.min(sources[key]||0,left);sources[key]=(sources[key]||0)-used;left-=used;
  }
  u.abilityBarriers=sources;
 }
 return absorbed;
}
