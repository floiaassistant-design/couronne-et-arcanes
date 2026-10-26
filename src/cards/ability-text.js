// Libellés brefs dérivés des paramètres ; aucune règle ni valeur métier recopiée.
export function unitAbilitySummary(definition){
 if(!definition)return [];
 const a=definition.abilities,lines=[],scope=p=>p.scope==='all-lines'?'toutes lignes':'sa ligne';
 if(a.armor)lines.push(`Armure ${a.armor.amount}`);
 if(a.firstHitReduction)lines.push(`Premier coup : −${a.firstHitReduction.amount}`);
 if(a.guard)lines.push(`Garde ${a.guard.scope==='all-lines'?'toutes lignes':a.guard.scope==='line'?'de ligne':a.guard.scope==='legacy-line'?'historique':'positionnelle'}`);
 if(a.riposte)lines.push(`Riposte : ${a.riposte.damageMode==='effective-attack'?'ATQ':a.riposte.amount}, ${a.riposte.frequency==='invocation'?'1 fois':'1/tour'}`);
 if(a.lastStand)lines.push(`Dernier Rempart : ${a.lastStand.hp} PV, 1 fois`);
 if(a.riposteBarrier)lines.push(`Barrière après Riposte : ${a.riposteBarrier.amount}`);
 if(a.heal)lines.push(`Soin ${a.heal.amount} × ${a.heal.targets}, ${scope(a.heal)}`);
 if(a.healBarrier)lines.push(`Barrière après soin : +${a.healBarrier.amount}, max ${a.healBarrier.cap}`);
 if(a.inspire)lines.push(`Inspiration : +${a.inspire.amount} ATQ à ${a.inspire.targets} allié(s) / ${a.inspire.period} tours, ${scope(a.inspire)}`);
 if(a.arrivalInspire)lines.push(`Commandement : +${a.arrivalInspire.amount} ATQ à l'arrivée`);
 if(a.ward)lines.push(`Protection : +${a.ward.amount}`);
 if(a.intervention)lines.push(`Intervention : ${a.intervention.amount} dégâts, portée ${a.intervention.range}`);
 if(a.flying)lines.push('Vol');
 if(a.haste)lines.push(`Célérité ${definition.geometry.steps}`);
 if(a.charge)lines.push(`Charge +${a.charge.amount}`);
 if(a.pierce)lines.push('Perforation');
 if(a.rearShot)lines.push(`Tir arrière : ${a.rearShot.amount} dégâts`);
 for(const [key,label] of Object.entries({poison:'Poison',splash:'Impact',lifesteal:'Vol de vie',silence:'Silence',portal:'Portail',trapper:'Piège'}))if(a[key])lines.push(label);
 return lines;
}
