// Modèle et fiche uniques ; lit les calculs du moteur, sans mutation ni action.
import {CARDS,FACTIONS,CLASSES,cardTraits} from '../data.js';
import {CARD_RARITIES,normalizeCardRarity} from '../cards/schema.js';
import {resolveUnitDefinition,resolveRulesDefinition,versionUnitAbilities,VERSIONED_UNIT_IDS} from '../cards/definitions.js';
import {ownedCardCopies} from '../cards/references.js';
import {evolutionTrialFor} from '../evolution-trials.js';
import {evolutionFusionFor} from '../evolution-fusion.js';
import {evolutionPackFor} from '../card-packs.js';
import {unitCardText,unitAbilityDetails,unitAbilitySummary} from '../cards/ability-text.js';
import {battleUnitDefinition,unitAttackRange,unitMovementSteps} from '../engine/unit-rules.js';
import {unitStatContext,unitStats,versionUnitStats} from '../engine/unit-stats.js';
import {formationBonus} from '../engine.js';
import {silenced} from '../engine/battle-control.js';
import {attackAfterPenalty} from '../engine/unit-effects.js';
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
  {atk:attackAfterPenalty(unit,unit.atk),hp:unit.hp,maxhp:unit.maxhp,bonuses:[]}:
  explicit&&future?versionUnitStats(ctx,{id,rarity:selected},side):unitStats(ctx,reference,side);
 let effective=definition;
 if(unit&&definition)effective={...definition,geometry:{steps:unitMovementSteps(unit),range:unitAttackRange(unit)},abilities:{...definition.abilities,...(definition.abilities.armor?{armor:{...definition.abilities.armor,amount:unit.armor??definition.abilities.armor.amount}}:{})}};
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
  const armor=u.armor??versionUnitAbilities(u)?.armor?.amount;
  const statuses=[concord?'Concorde +1 ATQ':'',rallied?'Ralliement +1 ATQ':'',armor?'Armure '+armor:'',u.barrier?'Barrière '+u.barrier:'',u.poisonTurns?'Poison '+u.poisonTurns+' tour(s)':'',u.stun?'Immobilisation '+u.stun:'',silenced(battle,u)?'Silence : capacités déclenchées suspendues':''].filter(Boolean);
  if(u.firstHitReductionUsed)statuses.push('Réduction du premier coup consommée');
  if(u.riposteUsed)statuses.push('Riposte par invocation consommée');
  if(u.lastRiposteRound===battle.round)statuses.push('Riposte utilisée ce tour');
  if(u.lastStandUsed)statuses.push('Dernier Rempart consommé');
  if(u.attackPenalty)statuses.push(`Harcèlement : −${u.attackPenalty.amount} ATQ, ${u.attackPenalty.remaining} attaque restante`);
  if(u.regeneration)statuses.push(`Régénération : ${u.regeneration.amount} PV au prochain tour, ${u.regeneration.remaining} effet restant`);
  const stats={atk:attackAfterPenalty(u,u.atk+concord+rallied),hp:u.hp,maxhp:u.maxhp,bonuses:[]};
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
