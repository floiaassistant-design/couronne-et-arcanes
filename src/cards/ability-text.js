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
 if(a.arrivalBarrier)lines.push(`Barrière alliée à l’arrivée : ${a.arrivalBarrier.amount}`);
 if(a.regeneration)lines.push(`Régénération : ${a.regeneration.amount} PV, ${a.regeneration.resolutions} tour(s)`);
 if(a.harass)lines.push(`Harcèlement : −${a.harass.amount} ATQ, ${a.harass.attacks} attaque(s)`);
 if(a.intervention)lines.push(`Intervention : ${a.intervention.amount} dégâts, portée ${a.intervention.range}`);
 if(a.flying)lines.push('Vol');
 if(a.haste)lines.push(`Célérité ${definition.geometry.steps}`);
 if(a.charge)lines.push(`Charge +${a.charge.amount}`);
 if(a.pierce)lines.push(a.pierce.condition==='charged'?'Charge perforante':'Perforation');
 lines.push(...advancedSummary(a));
 if(a.rearShot)lines.push(`Tir arrière : ${a.rearShot.amount} dégâts`);
 for(const [key,label] of Object.entries({poison:'Poison',splash:'Impact',lifesteal:'Vol de vie',silence:'Silence',portal:'Portail',trapper:'Piège'}))if(a[key])lines.push(label);
 return lines;
}

// Texte de carte et fiche sont deux formats des mêmes paramètres effectifs.
export function unitCardText(d){
 const a=d.abilities,parts=[...advancedSummary(d.abilities)];
 if(a.firstHitReduction)parts.push(`Premier coup −${a.firstHitReduction.amount}`);
 if(a.lastStand)parts.push(`Rempart ${a.lastStand.hp} PV`);
 if(a.intervention)parts.push(`Intervention ${a.intervention.amount}`);
 if(a.arrivalInspire)parts.push(`Commandement +${a.arrivalInspire.amount}`);
 if(a.armor)parts.push(`Armure ${a.armor.amount}`);
 if(a.guard)parts.push(a.guard.scope==='all-lines'?'Garde toutes lignes':a.guard.scope==='line'?'Garde divine':'Garde');
 if(a.heal)parts.push(`Soin ${a.heal.amount}${a.heal.targets>1?' ×'+a.heal.targets:''}${a.heal.scope==='all-lines'?' toutes lignes':''}`);
 if(a.healBarrier)parts.push(`Barrière +${a.healBarrier.amount}`);
 if(a.regeneration)parts.push(`Régénération ${a.regeneration.amount}${a.regeneration.resolutions>1?' · '+a.regeneration.resolutions+' tours':''}`);
 if(a.inspire)parts.push(`Inspiration +${a.inspire.amount} / ${a.inspire.period} tours`);
 if(a.haste)parts.push(`Célérité ${d.geometry.steps}`);
 if(a.charge)parts.push(`Charge +${a.charge.amount}`);
 if(a.pierce)parts.push(a.pierce.condition==='charged'?'Charge perforante':'Perforation');
 if(a.rearShot)parts.push(`Tir arrière ${a.rearShot.amount}`);
 if(a.riposteBarrier)parts.push(`Barrière ${a.riposteBarrier.amount}`);
 if(a.riposte)parts.push('Riposte'+(a.riposte.damageMode==='effective-attack'?' ATQ':' '+a.riposte.amount));
 if(a.ward)parts.push(`Protection +${a.ward.amount}`);
 if(a.arrivalBarrier)parts.push(`Barrière alliée ${a.arrivalBarrier.amount}`);
 if(a.harass)parts.push(`Harcèlement −${a.harass.amount} ATQ${a.harass.attacks>1?' · '+a.harass.attacks+' attaques':''}`);
 if(a.poison)parts.push(`Poison ${a.poison.amount} · ${a.poison.resolutions} tours`);
 if(a.trapper)parts.push(`Piège ${a.trapper.damage} / ${a.trapper.period} tours${a.trapper.poison?' · Poison '+a.trapper.poison.amount:''}`);
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
 if(a.regeneration)lines.push(`Après un soin effectif : Régénération ${a.regeneration.amount} PV à la même cible ${a.regeneration.resolutions===1?'à la fin de son prochain tour de combat':'à la fin de ses '+a.regeneration.resolutions+' prochains tours de combat'}, si elle vit et reste blessée. Sans cumul ; une nouvelle application rafraîchit l’effet.`);
 if(a.inspire)lines.push(`Tous les ${a.inspire.period} tours : +${a.inspire.amount} ATQ à ${a.inspire.targets} autre${a.inspire.targets>1?'s':''} allié${a.inspire.targets>1?'s':''} de ${scope(a.inspire)}, ATQ plafonnée à ${a.inspire.cap}.`);
 if(a.arrivalInspire)lines.push(`À l’arrivée : +${a.arrivalInspire.amount} ATQ au premier autre allié de sa ligne, maximum ${a.arrivalInspire.cap}.`);
 if(a.ward)lines.push(`À l’arrivée : +${a.ward.amount} bouclier à sa couronne, plafond ${a.ward.cap}.`);
 if(a.arrivalBarrier)lines.push(`À l’arrivée : barrière ${a.arrivalBarrier.amount} à un autre allié de sa ligne, priorité au plus blessé proportionnellement. Plafond ${a.arrivalBarrier.cap} pour cet effet, sans cumul ; aucune autre cible ni effet sans allié.`);
 if(a.harass)lines.push(`Après une attaque sur une unité ennemie vivante : Harcèlement −${a.harass.amount} ATQ sur ${a.harass.attacks===1?'sa prochaine attaque d’unité':'ses '+a.harass.attacks+' prochaines attaques d’unité'}, Riposte comprise ; minimum 0, aucun effet sur les sorts. Les applications renouvellent le malus sans cumul.`);
 if(a.intervention)lines.push(`À l’arrivée : ${a.intervention.amount} dégâts au premier ennemi devant, même ligne, jusqu’à ${a.intervention.range} cases ; protections normales, une seule frappe d’arrivée.`);
 if(a.flying)lines.push('Vol : franchit un allié si la case d’arrivée est libre.');
 if(a.charge)lines.push(`Charge : +${a.charge.amount} ATQ après déplacement avant la frappe.`);
 if(a.pierce)lines.push(`Perforation : ignore l’armure de la première cible${a.pierce.condition==='charged'?' seulement après déplacement avec Charge':''}, autres protections conservées.`);
 if(a.rearShot)lines.push(`Tir arrière : ${a.rearShot.amount} dégâts à l’ennemi immédiatement derrière la première cible, même ligne ; protections normales.`);
 if(a.poison)lines.push(`Après une attaque sur une unité : Poison ${a.poison.amount} dégât par tour pendant ${a.poison.resolutions} tours ; une nouvelle application renouvelle la durée.`);
 if(a.trapper)lines.push(`Tous les ${a.trapper.period} tours : arme si possible la case libre éligible juste devant. Piège visible pendant ${a.trapper.resolutions} tours au plus ; ${a.trapper.damage} dégât${a.trapper.damage>1?'s':''} brut${a.trapper.damage>1?'s':''} avant protections, déplacement et attaque bloqués pour le tour du déclenchement.`);
 if(a.trapper?.poison)lines.push(`Si la victime du piège survit : Poison ${a.trapper.poison.amount} pendant ses ${a.trapper.poison.resolutions} prochains tours de combat, sans dégât de poison immédiat ni cumul.`);
 if(a.entangle)lines.push(`Entrave : après une attaque touchant une unité ennemie survivante, empêche seulement son prochain déplacement. ${a.entangle.frequency==='invocation'?'Une fois par invocation.':'Au plus une fois tous les '+a.entangle.period+' tours, durée rafraîchie sans cumul.'} La cible peut attaquer.`);
 if(a.chargeBarrier)lines.push(`Après une attaque chargée sur une unité : barrière personnelle ${a.chargeBarrier.amount}${a.chargeBarrier.allies?' et barrière '+a.chargeBarrier.amount+' à un autre allié de sa ligne, priorité au plus blessé proportionnellement':''}. Plafond ${a.chargeBarrier.cap} par cible pour cet effet ; aucun gain sans déplacement ni contre la couronne seule.`);
 if(a.contagion)lines.push(`Contagion : au premier décès d’un ennemi portant encore son poison, transmet Poison ${a.contagion.amount} pendant ${a.contagion.resolutions} tours à l’ennemi vivant le plus proche sur la même ligne. Une fois par invocation, sans chaîne ; reste attachée au poison si sa source disparaît.`);
 if(a.deathWard)lines.push(`À sa destruction en combat : +${a.deathWard.amount} bouclier à sa couronne, plafond ${a.deathWard.cap}, une fois par invocation. Aucun effet en quittant simplement le plateau.`);
 if(a.fury)lines.push(`Fureur : après perte effective de PV par attaque ennemie, si elle survit, sa prochaine attaque gagne +${a.fury.amount} ATQ. Sans cumul, consommée à l’attaque ; peut être réactivée ensuite.`);
 if(a.furyBarrier)lines.push(`Si son attaque renforcée par Fureur détruit une unité ennemie : barrière ${a.furyBarrier.amount}, plafond ${a.furyBarrier.cap}, au plus une fois par tour.`);
 if(a.purify)lines.push(`Après un soin restaurant effectivement des PV : retire tout le poison${a.purify.movement?' et l’Entrave empêchant le prochain déplacement':''} de cette seule cible. Aucun retrait sans soin effectif.`);
 return lines;
}

function advancedSummary(a){
 const parts=[];
 if(a.entangle)parts.push(`Entrave ${a.entangle.frequency==='invocation'?'1 fois':'/ '+a.entangle.period+' tours'}`);
 if(a.chargeBarrier)parts.push(`Barrière après Charge ${a.chargeBarrier.amount}${a.chargeBarrier.allies?' + allié':''}`);
 if(a.contagion)parts.push(`Contagion ${a.contagion.amount} · ${a.contagion.resolutions} tours`);
 if(a.deathWard)parts.push(`Dernière lumière +${a.deathWard.amount}`);
 if(a.fury)parts.push(`Fureur +${a.fury.amount}${a.furyBarrier?' · Barrière '+a.furyBarrier.amount+' si élimination':''}`);
 if(a.purify)parts.push(`Purification${a.purify.movement?' et Entrave':''}`);
 return parts;
}
