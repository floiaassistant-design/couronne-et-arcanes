// Consultation de la main : rendu et état transitoire, aucune action de jeu.
import {CARDS,FACTIONS,CLASSES,cardTraits} from '../data.js';
import {unitStats} from '../engine/unit-stats.js';

export function cardInspectionContent(card,entry,stats,esc){
 const bonusText=stats?.bonuses.map(b=>esc(b.label)+' '+[b.atk?'+'+b.atk+' ATQ':'',b.hp?'+'+b.hp+' PV':''].filter(Boolean).join(' / ')).join(' · ');
 const traits=cardTraits(card.id);
 return `<div class="inspection-heading"><b>${esc(card.name)}</b><button type="button" data-action="close-inspection" aria-label="Fermer la fiche">×</button></div>
  ${stats?`<div class="inspection-stats">À l’invocation : <b>ATQ ${stats.atk} / PV ${stats.maxhp}</b></div>`:''}
  <div class="inspection-body"><p class="inspection-description">${esc(card.description)}</p>
  <div class="inspection-summary">${esc(FACTIONS[card.faction].name)} · ${esc(card.rarity)}${card.heroClass?' · '+esc(CLASSES[card.heroClass].name):''} · ${entry.wait>0?'Attente '+entry.wait+' tour'+(entry.wait>1?'s':''):'Prête à jouer'}</div>
  ${traits.length?`<div class="inspection-traits">${traits.map(esc).join(' · ')}</div>`:''}
  ${bonusText?`<div class="inspection-bonuses">Bonus inclus : ${bonusText}</div>`:''}</div>`;
}

export function createCardInspection(getContext,esc){
 let pinnedIndex=-1;
 function closeCardInspection(){
  pinnedIndex=-1;const panel=document.getElementById('hand-card-inspection');
  if(panel){panel.hidden=true;panel.textContent='';panel.closest('.hand-header')?.style.removeProperty('--inspection-header-height');}
 }
 function inspectCard(index,pin=false){
  const {battle,screen}=getContext();if(!battle||screen!=='battle')return;
  const i=Number(index);if(!Number.isInteger(i)||i<0)return;
  const entry=battle.heroes.p.hand[i],card=entry&&CARDS[entry.id],panel=document.getElementById('hand-card-inspection');
  if(!card||!panel)return;
  if(pin&&pinnedIndex===i){closeCardInspection();return;}
  if(!pin&&pinnedIndex>=0)return;
  if(pin)pinnedIndex=i;
  if(panel.hidden){const header=panel.closest('.hand-header');header?.style.setProperty('--inspection-header-height',header.getBoundingClientRect().height+'px');}
  panel.innerHTML=cardInspectionContent(card,entry,unitStats(battle,card.id),esc);
  panel.hidden=false;
 }
 function dismissCardInspection(){if(pinnedIndex<0)closeCardInspection();}
 return {inspectCard,closeCardInspection,dismissCardInspection};
}
