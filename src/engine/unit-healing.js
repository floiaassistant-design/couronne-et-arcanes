export function activeHealingPenalty(unit,round){
 const penalty=unit.healingPenalty;
 return penalty?.expiresRound>=round?penalty:null;
}

export function applyHealingPenalty(unit,round,{amount,duration}){
 if(activeHealingPenalty(unit,round)?.amount>amount)return;
 unit.healingPenalty={amount,expiresRound:round+duration};
}

// Seuls les soins de créature passent ici. Le retour est le gain réel de PV.
export function healUnit(unit,amount,round){
 if(unit.hp<=0||unit.hp>=unit.maxhp||amount<=0)return 0;
 const penalty=activeHealingPenalty(unit,round);
 if(penalty)delete unit.healingPenalty;
 const healed=Math.min(unit.maxhp-unit.hp,Math.max(0,amount-(penalty?.amount||0)));
 unit.hp+=healed;
 return healed;
}

export function expireHealingPenalty(unit,round){
 if(unit.healingPenalty?.expiresRound<=round)delete unit.healingPenalty;
}

export function validHealingPenalty(unit){
 const penalty=unit.healingPenalty;
 const positive=value=>Number.isSafeInteger(value)&&value>0&&value<=100;
 return penalty===undefined||!!penalty&&positive(penalty.amount)&&positive(penalty.expiresRound);
}
