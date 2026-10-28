// Libellés brefs dérivés des paramètres ; aucune règle ni valeur métier recopiée.
export function unitAbilitySummary(definition){
 if(!definition)return [];
 const a=definition.abilities,lines=[],scope=p=>p.scope==='all-lines'?'toutes lignes':'sa ligne';
 if(a.armor)lines.push(`Armure ${a.armor.amount}`);
 if(a.firstHitReduction)lines.push(`Premier coup : −${a.firstHitReduction.amount}`);
 if(a.guard)lines.push(`Garde ${a.guard.scope==='all-lines'?'toutes lignes':a.guard.scope==='line'?'de ligne':'positionnelle'}`);
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

// Texte de carte et fiche sont deux formats des mêmes paramètres effectifs.
export function unitCardText(d){
 const a=d.abilities,parts=[];
 if(a.firstHitReduction)parts.push(`Premier coup −${a.firstHitReduction.amount}`);
 if(a.lastStand)parts.push(`Rempart ${a.lastStand.hp} PV`);
 if(a.intervention)parts.push(`Intervention ${a.intervention.amount}`);
 if(a.arrivalInspire)parts.push(`Commandement +${a.arrivalInspire.amount}`);
 if(a.armor)parts.push(`Armure ${a.armor.amount}`);
 if(a.guard)parts.push(a.guard.scope==='all-lines'?'Garde toutes lignes':a.guard.scope==='line'?'Garde divine':'Garde');
 if(a.heal)parts.push(`Soin ${a.heal.amount}${a.heal.targets>1?' ×'+a.heal.targets:''}${a.heal.scope==='all-lines'?' toutes lignes':''}`);
 if(a.healBarrier)parts.push(`Barrière +${a.healBarrier.amount}`);
 if(a.inspire)parts.push(`Inspiration +${a.inspire.amount} / ${a.inspire.period} tours`);
 if(a.haste)parts.push(`Célérité ${d.geometry.steps}`);
 if(a.charge)parts.push(`Charge +${a.charge.amount}`);
 if(a.pierce)parts.push('Perforation');
 if(a.rearShot)parts.push(`Tir arrière ${a.rearShot.amount}`);
 if(a.riposteBarrier)parts.push(`Barrière ${a.riposteBarrier.amount}`);
 if(a.riposte)parts.push('Riposte'+(a.riposte.damageMode==='effective-attack'?' ATQ':' '+a.riposte.amount));
 if(a.ward)parts.push(`Protection +${a.ward.amount}`);
 if(a.poison)parts.push(`Poison ${a.poison.amount} · ${a.poison.resolutions} tours`);
 if(a.trapper)parts.push(`Piège ${a.trapper.damage} / ${a.trapper.period} tours`);
 if(a.flying)parts.push('Vol');
 if(d.geometry.range>1)parts.unshift(`Portée ${d.geometry.range}`);
 return parts.slice(0,3).join(' · ')||'Corps à corps';
}

export function unitAbilityDetails(d){
 const a=d.abilities,lines=[],scope=p=>p.scope==='all-lines'?'toutes les lignes':'sa ligne';
 if(a.armor)lines.push(`Armure ${a.armor.amount} : réduit les dégâts, minimum ${a.armor.minimumDamage}.`);
 if(a.firstHitReduction)lines.push(`Premier coup reçu : −${a.firstHitReduction.amount} dégâts, une fois par invocation.`);
 if(a.guard)lines.push(`Garde : protège sa couronne ${a.guard.scope==='all-lines'?'depuis toutes les lignes':a.guard.scope==='line'?'depuis toute sa ligne, même dépassé':'sur sa ligne, entre l’attaquant et la couronne'} ; ${a.guard.maxPerAttack} gardien par frappe, tant qu’il vit.`);
 if(a.riposte)lines.push(`Riposte au contact après survie : ${a.riposte.damageMode==='effective-attack'?'ATQ effective, bonus compris, sans Charge':a.riposte.amount+' dégâts'}, ${a.riposte.frequency==='invocation'?'une fois par invocation':'au plus une fois par tour'}.`);
 if(a.lastStand)lines.push(`Dernier Rempart : survit au premier coup mortel avec ${a.lastStand.hp} PV au plus, sans dépasser ses PV maximum ; une fois par invocation.`);
 if(a.riposteBarrier)lines.push(`Après une Riposte autorisée : barrière personnelle +${a.riposteBarrier.amount}, plafond ${a.riposteBarrier.cap} pour cet effet.`);
 if(a.heal)lines.push(`Après les attaques : soigne ${a.heal.amount} PV à ${a.heal.targets>1?'jusqu’à '+a.heal.targets+' alliés blessés distincts, priorité aux plus blessés proportionnellement':'l’allié le plus blessé proportionnellement'} sur ${scope(a.heal)}, elle-même incluse.`);
 if(a.healBarrier)lines.push(`Après un soin effectif : barrière +${a.healBarrier.amount} à la cible, plafond ${a.healBarrier.cap} pour cet effet.`);
 if(a.inspire)lines.push(`Tous les ${a.inspire.period} tours : +${a.inspire.amount} ATQ à ${a.inspire.targets} autre${a.inspire.targets>1?'s':''} allié${a.inspire.targets>1?'s':''} de ${scope(a.inspire)}, ATQ plafonnée à ${a.inspire.cap}.`);
 if(a.arrivalInspire)lines.push(`À l’arrivée : +${a.arrivalInspire.amount} ATQ au premier autre allié de sa ligne, maximum ${a.arrivalInspire.cap}.`);
 if(a.ward)lines.push(`À l’arrivée : +${a.ward.amount} bouclier à sa couronne, plafond ${a.ward.cap}.`);
 if(a.intervention)lines.push(`À l’arrivée : ${a.intervention.amount} dégâts au premier ennemi devant, même ligne, jusqu’à ${a.intervention.range} cases ; protections normales, une seule frappe d’arrivée.`);
 if(a.flying)lines.push('Vol : franchit un allié si la case d’arrivée est libre.');
 if(a.charge)lines.push(`Charge : +${a.charge.amount} ATQ après déplacement avant la frappe.`);
 if(a.pierce)lines.push('Perforation : ignore l’armure de la première cible, autres protections conservées.');
 if(a.rearShot)lines.push(`Tir arrière : ${a.rearShot.amount} dégâts à l’ennemi immédiatement derrière la première cible, même ligne ; protections normales.`);
 if(a.poison)lines.push(`Après une attaque sur une unité : Poison ${a.poison.amount} dégât par tour pendant ${a.poison.resolutions} tours ; une nouvelle application renouvelle la durée.`);
 if(a.trapper)lines.push(`Tous les ${a.trapper.period} tours : arme si possible la case libre éligible juste devant. Piège visible pendant ${a.trapper.resolutions} tours au plus ; ${a.trapper.damage} dégât après protections, déplacement et attaque bloqués pour le tour du déclenchement.`);
 return lines;
}
