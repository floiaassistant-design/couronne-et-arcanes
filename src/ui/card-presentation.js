// Modèle et fiche uniques ; lit les calculs du moteur, sans mutation ni action.
import {CARDS,FACTIONS,CLASSES,cardTraits} from '../data.js';
import {CARD_RARITIES,normalizeCardRarity} from '../cards/schema.js';
import {resolveUnitDefinition,resolveRulesDefinition,versionUnitAbilities,VERSIONED_UNIT_IDS} from '../cards/definitions.js';
import {ownedCardCopies} from '../cards/references.js';
import {evolutionTrialFor} from '../evolution-trials.js';
import {evolutionFusionFor} from '../evolution-fusion.js';
import {evolutionPackFor} from '../card-packs.js';
import {unitCardText,unitAbilityDetails,unitAbilitySummary,retaliatoryOmenName,portalEchoName} from '../cards/ability-text.js';
import {battleUnitDefinition,unitAttackRange,unitMovementSteps} from '../engine/unit-rules.js';
import {unitStatContext,unitStats,versionUnitStats} from '../engine/unit-stats.js';
import {formationBonus} from '../engine.js';
import {silenced} from '../engine/battle-control.js';
import {attackAfterPenalty} from '../engine/unit-effects.js';
import {activeStrikeState} from '../engine/unit-strike-modifiers.js';
import {activeFlightWake} from '../engine/unit-flight-support.js';
import {activeHealingPenalty} from '../engine/unit-healing.js';
import {generatedCardFace} from './generated-card.js';
import {concordeDetails} from './concorde.js';
import {visualFor,artSrc,cardTemplateFor} from '../visuals.js';

const brief=text=>text.length<=90?text:text.slice(0,87).replace(/\s+\S*$/,'')+'…';
function evolutionAvailability(profile,reference,{trial,fusion,pack}){
 const routes=[fusion?'fusion':null,pack?'paquet':null,trial?'épreuve':null].filter(Boolean);
 if(!routes.length)return 'Testable au laboratoire · Obtention non définie';
 if(profile&&ownedCardCopies(profile,reference)>0)return 'Évolution obtenue';
 if(profile?.completedTrials?.includes(trial?.id))return 'Épreuve accomplie · Aucun exemplaire à ce rang';
 if(fusion?.ascension&&!profile?.completedTrials?.includes(fusion.ascension))return 'À obtenir par fusion · Ascension requise';
 if(routes.length===1)return trial?'À gagner en épreuve':`À obtenir par ${routes[0]}`;
 return `À obtenir par ${routes.slice(0,-1).join(', ')} ou ${routes.at(-1)}`;
}
export function cardPresentation(reference,{context={},profile=null,side='p',unit=null,stats=undefined,definition=null}={}){
 const id=typeof reference==='string'?reference:reference?.id,native=CARDS[id];if(!native)return null;
 const explicit=typeof reference==='object'&&Object.hasOwn(reference,'rarity');
 const rarity=explicit?normalizeCardRarity(reference.rarity):native.rarity;if(!rarity)return null;
 const ctx=profile?unitStatContext(profile):context;
 if(native.type==='unité'&&!definition){
  definition=unit?resolveUnitDefinition(unit):
   explicit&&rarity!==native.rarity?resolveRulesDefinition({id,rarity}):battleUnitDefinition(ctx,reference,side);
 }
 const selected=definition?.rarity||rarity;
 const lower=CARD_RARITIES.findIndex(r=>r.id===selected)<CARD_RARITIES.findIndex(r=>r.id===native.rarity);
 const known=native.type==='sort'||!!definition;
 const missing=lower?'Rang inexistant':'À concevoir';
 const future=known&&selected!==native.rarity;
 const trial=future?evolutionTrialFor(id,selected):null;
 const fusion=future?evolutionFusionFor(id,selected):null;
 const pack=future?evolutionPackFor(id,selected):null;
 const availability=!known?missing:future?evolutionAvailability(profile,{id,rarity:selected},{trial,fusion,pack}):'Version native';
 if(stats===undefined)stats=native.type==='sort'||!known?null:unit?
  {atk:attackAfterPenalty(unit,unit.atk,ctx.round),hp:unit.hp,maxhp:unit.maxhp,bonuses:[]}:
  explicit&&future?versionUnitStats(ctx,{id,rarity:selected},side):unitStats(ctx,reference,side);
 let effective=definition;
 if(unit&&definition)effective={...definition,geometry:{steps:unitMovementSteps(unit,silenced(ctx,unit),ctx.round),range:unitAttackRange(unit)},abilities:{...definition.abilities,...(definition.abilities.armor?{armor:{...definition.abilities.armor,amount:unit.armor??definition.abilities.armor.amount}}:{})}};
 const structured=known&&native.type==='unité'&&(VERSIONED_UNIT_IDS.includes(id)||effective?.abilities.guard||effective?.abilities.riposte);
 const description=!known?missing:structured?unitCardText(effective):brief(native.description);
 const details=!known?[lower?'Aucune version sous la rareté native.':'Cette évolution reste à concevoir.']:
  structured?unitAbilityDetails(effective):[native.description];
 const geometry=effective?.geometry;
 if(geometry)details.unshift(`Déplacement ${geometry.steps} case${geometry.steps>1?'s':''} · Portée ${geometry.range} case${geometry.range>1?'s':''}, devant sur sa ligne.`);
 return {card:{...native,rarity:selected,attack:known?(definition?.stats.attack??native.attack):undefined,hp:known?(definition?.stats.hp??native.hp):undefined,delay:known?(definition?.stats.delay??native.delay):'—',description},definition:effective,
  stats,details,availability,known,future,lower,traits:structured?unitAbilitySummary(effective):known?cardTraits(id):[]};
}

export function boardInspectionData(battle,uid){
 for(let lane=0;lane<(battle?.board?.length||0);lane++)for(let col=1;col<battle.board[lane].length-1;col++){
  const u=battle.board[lane][col];if(!u||String(u.uid)!==String(uid))continue;
  const concord=formationBonus(battle,lane,u),rallied=u.rallyUntil>=battle.round?1:0;
  const abilities=versionUnitAbilities(u),armor=u.armor??abilities?.armor?.amount;
  const statuses=[concord?'Concorde +1 ATQ':'',rallied?'Ralliement +1 ATQ':'',armor?'Armure '+armor:'',u.barrier?'Barrière '+u.barrier:'',u.poisonTurns?'Poison '+u.poisonTurns+' tour(s)':'',u.stun?'Immobilisation '+u.stun:'',silenced(battle,u)?'Silence : capacités déclenchées suspendues':''].filter(Boolean);
  if(u.devourAttack)statuses.push(`Dévoration : +${u.devourAttack} ATQ`);
  if(u.killHasteRound===battle.round)statuses.push('Célérité temporaire ce tour');
  if(u.firstHitReductionUsed)statuses.push('Réduction du premier coup consommée');
  if(u.riposteUsed)statuses.push('Riposte par invocation consommée');
  if(u.lastRiposteRound===battle.round)statuses.push('Riposte utilisée ce tour');
  if(u.lastGuardWardRound===battle.round)statuses.push('Cœur runique utilisé ce tour');
  if(u.lastStandUsed)statuses.push('Dernier Rempart consommé');
  if(u.attackPenalty)statuses.push(`Harcèlement : −${u.attackPenalty.amount} ATQ, ${u.attackPenalty.remaining} attaque restante`);
  if(u.regeneration)statuses.push(`Régénération : ${u.regeneration.amount} PV au prochain tour, ${u.regeneration.remaining} effet restant`);
  if(u.stillOmen)statuses.push(`Étoile immobile : présage ${u.stillOmen.amount}, fin du tour ${u.stillOmen.dueRound} sans déplacement`);
  if(u.spectralRetreatReadyRound>battle.round)statuses.push(`Repli spectral disponible au tour ${u.spectralRetreatReadyRound}`);
  if(u.stillOmenReadyRound>battle.round)statuses.push(`Prochain présage au tour ${u.stillOmenReadyRound}`);
  if(u.nextStrikeBonus?.expiresRound>=battle.round)statuses.push(`${abilities?.chargeAdvance?.strike?"Conquête céleste":"Éclat persistant"} : prochaine attaque +${u.nextStrikeBonus.amount}, jusqu’à la fin du tour ${u.nextStrikeBonus.expiresRound}`);
  if(u.prismPenalty?.expiresRound>=battle.round)statuses.push(`Prisme inhibiteur : prochaine attaque −${u.prismPenalty.amount} ATQ, minimum ${u.prismPenalty.minimum}, jusqu’à la fin du tour ${u.prismPenalty.expiresRound}`);
  if(u.guardPrismReadyRound>battle.round)statuses.push(`Prisme disponible au tour ${u.guardPrismReadyRound}`);
  if(u.splashKnockbackReadyRound>battle.round)statuses.push(`Souffle disponible au tour ${u.splashKnockbackReadyRound}`);
  const wake=activeFlightWake(u,battle.round);
  if(wake)statuses.push(`${wake.strike?"Vents du Zénith":"Sillage ascendant"} : déplacement +${wake.cells}${wake.strike?", frappe +"+wake.strike+" ATQ":""} jusqu’à la fin du tour ${wake.expiresRound}`);
  if(u.flightSupportReadyRound>battle.round)statuses.push(`Prochain effet de Vol au tour ${u.flightSupportReadyRound}`);
  const healingPenalty=activeHealingPenalty(u,battle.round);
  if(healingPenalty)statuses.push(`Résonance : prochain soin −${healingPenalty.amount} PV, jusqu’à la fin du tour ${healingPenalty.expiresRound}`);
  if(u.impactExtraReadyRound>battle.round)statuses.push(`Prochain effet d’Impact au tour ${u.impactExtraReadyRound}`);
  const omen=activeStrikeState(u,'retaliatoryOmen',battle.round),echo=activeStrikeState(u,'portalEcho',battle.round);
  if(omen)statuses.push(`${retaliatoryOmenName(omen)} : ${omen.amount} dégâts après la prochaine attaque normale, jusqu’à la fin du tour ${omen.expiresRound}`);
  if(echo)statuses.push(`${portalEchoName(abilities?.portalEcho)} : origine ligne ${echo.lane+1}, case ${echo.col}, jusqu’à la fin du tour ${echo.expiresRound}`);
  if(u.retaliatoryOmenReadyRound>battle.round)statuses.push(`${retaliatoryOmenName(abilities?.retaliatoryOmen)} disponible au tour ${u.retaliatoryOmenReadyRound}`);
  if(u.chargeAdvanceReadyRound>battle.round)statuses.push(`Percée du Zénith disponible au tour ${u.chargeAdvanceReadyRound}`);
  const penalty=activeStrikeState(u,'armorPenalty',battle.round),protection=activeStrikeState(u,'temporaryArmor',battle.round),calibration=activeStrikeState(u,'calibration',battle.round),mark=activeStrikeState(u,'spotMark',battle.round);
  if(penalty)statuses.push(`Armure −${penalty.amount} à la prochaine attaque directe subie`);
  if(protection)statuses.push(`Blindage : +${protection.amount} Armure à la prochaine attaque directe subie`);
  if(calibration)statuses.push(`Calibrage : ignore ${calibration.ignoreArmor} Armure à la prochaine attaque contre une unité`);
  if(mark)statuses.push(`Repérage : ${mark.remaining} attaque(s) d’un autre allié du Canon à +${mark.amount} dégâts`);
  const stats={atk:attackAfterPenalty(u,u.atk+concord+rallied,battle.round),hp:u.hp,maxhp:u.maxhp,bonuses:[]};
  const presentation=cardPresentation(u,{context:battle,side:u.side,unit:u,stats});
  return {...presentation,entry:{wait:0},presentation,board:{side:u.side,lane,col,statuses,concordeActive:!!concord}};
 }
 return null;
}

const contexts={hand:'DANS VOTRE MAIN',board:'SUR LE PLATEAU',collection:'COLLECTION',forge:'ATELIER',alchemy:'ALCHIMIE',developer:'LABORATOIRE',deck:'DECK',pack:'PAQUET',reward:'RÉCOMPENSE'};
export function cardInspectionContent(card,entry,stats,esc,{board=null,presentation=null,context=board?'board':'hand'}={}){
 const model=presentation||cardPresentation(card,{stats});if(!model)return '';
 // L'identité fournie peut être adaptée par un appelant, sans toucher au catalogue.
 const shown={...model.card,name:card.name},faction=FACTIONS[shown.faction];
 const bonusText=(stats?.bonuses||[]).map(b=>esc(b.label)+' '+[b.atk?'+'+b.atk+' ATQ':'',b.hp?'+'+b.hp+' PV':''].filter(Boolean).join(' / ')).join(' · ');
 const readiness=board?`${board.side==='p'?'Votre unité':'Unité adverse'} · Ligne ${board.lane+1}, case ${board.col}`:
  context==='hand'?(entry.wait>0?'Attente '+entry.wait+' tour'+(entry.wait>1?'s':''):'Prête à jouer'):
  model.availability+(model.known?' · Délai '+shown.delay:'');
 const heading=`<div class="inspection-heading"><span class="inspection-context">${contexts[context]||'CARTE'}</span><button type="button" data-action="close-inspection" aria-label="Fermer la fiche">×</button></div>`;
 const statistics=stats?`<div class="inspection-stats">${board?'En combat':'À l’invocation'} : <b>ATQ ${stats.atk} / PV ${board?stats.hp+'/':''}${stats.maxhp}</b></div>`:'';
 const identity=`<div class="inspection-feature ${cardTemplateFor(shown)?'inspection-generated-feature':''}">${cardTemplateFor(shown)?generatedCardFace(shown,{stats,delay:board?0:context==='hand'?entry.wait:shown.delay,kind:board?'deployed':context==='hand'?'remaining':'base',concordeActive:!!board?.concordeActive,esc}):`<img class="inspection-art" src="${artSrc(visualFor(shown,{cards:true}).art)}" alt="" draggable="false">`}<div class="inspection-identity"><h2>${esc(shown.name)}</h2><span class="inspection-order">${esc(faction.name)}</span><span class="inspection-rarity">${esc(shown.rarity)} · ${esc(shown.type)}</span><div class="inspection-readiness">${esc(readiness)}</div>${statistics}</div></div>`;
 const body=`<div class="inspection-body"><div class="inspection-description">${model.details.map(t=>`<p>${esc(t)}</p>`).join('')}</div>
  ${model.known?concordeDetails(shown,esc,board?board.concordeActive:null):''}
  ${model.traits.length&&!VERSIONED_UNIT_IDS.includes(shown.id)?`<div class="inspection-traits">${model.traits.map(t=>`<span>${esc(t)}</span>`).join(' · ')}</div>`:''}
  ${shown.heroClass?`<div class="inspection-summary">${esc(CLASSES[shown.heroClass].name)}</div>`:''}
  ${board?.statuses.length?`<div class="inspection-statuses">${board.statuses.map(esc).join(' · ')}</div>`:''}
  ${bonusText?`<div class="inspection-bonuses">Bonus inclus : ${bonusText}</div>`:''}</div>`;
 return `<div class="card-preview" data-preview-kind="${context}" data-side="${board?.side||'p'}" data-rarity="${esc(shown.rarity)}" style="--preview-tone:${faction.tone}">${heading}${identity}${body}</div>`;
}

export function cardPreviewAttributes(id,rarity,context,esc){
 return `data-card-preview data-card-id="${esc(id)}" data-preview-rarity="${esc(rarity)}" data-preview-context="${esc(context)}" tabindex="0" aria-expanded="false"`;
}
