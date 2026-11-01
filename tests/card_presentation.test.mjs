import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {AUBE_UNIT_IDS,unitVersions,CARD_RULESET,resolveRulesDefinition} from '../src/cards/definitions.js';
import {freshProfile,createBattle,playPlayerCard,playEnemyCard} from '../src/engine.js';
import {freshLab,createLabBattle,setLabRarity,setLabLevel,labCardStats} from '../src/engine/developer-lab.js';
import {cardPresentation,boardInspectionData,cardInspectionContent} from '../src/ui/card-presentation.js';
import {collectionHoverContent} from '../src/ui/collection.js';
import {createViews} from '../src/ui/views.js';
import {boardCard} from '../src/ui/card-arena.js';
const esc=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;');
const definitions=AUBE_UNIT_IDS.flatMap(unitVersions);

test('51 versions : carte, fiche et invocation montrent les mêmes chiffres aux deux camps',()=>{
 for(const d of definitions)for(const side of ['p','e']){
  const lab=freshLab();setLabRarity(lab,side,d.id,d.rarity);setLabLevel(lab,side,d.id,2);
  const b=createLabBattle(lab,35);b.heroes[side].hand=[{id:d.id,wait:0}];
  if(side==='e')b.phase='enemy';
  const before=JSON.stringify(b),model=cardPresentation(b.heroes[side].hand[0],{context:b,side});
  assert.equal(model.card.rarity,d.rarity);assert.ok(model.card.description.length<=90);
  assert.equal(JSON.stringify(b),before);
  assert.equal((side==='p'?playPlayerCard(b,0,0):playEnemyCard(b,0,0)).ok,true);
  const u=b.board.flat().find(x=>x?.id===d.id&&x.side===side),sheet=boardInspectionData(b,u.uid),html=boardCard(u);
  assert.equal(model.stats.atk,u.atk);assert.equal(model.stats.maxhp,u.maxhp);
  assert.equal(sheet.card.rarity,d.rarity);assert.equal(sheet.stats.hp,u.hp);
  assert.equal(sheet.card.description,model.card.description);
  assert.match(html,new RegExp(`data-rarity="${d.rarity}"`));assert.ok(html.includes(esc(model.card.description)));
 }
});

test('La Collection expose 51 définitions, distingue les 9 rangs inexistants et les évolutions inconnues',()=>{
 const p=freshProfile(),before=JSON.stringify(p);
 for(const d of definitions){
  const html=collectionHoverContent(p,d.id,d.rarity,esc);
  assert.match(html,new RegExp(`ATQ ${d.stats.attack} / PV ${d.stats.hp}`));
  if(d.rarity!==d.nativeRarity)assert.match(html,d.status.obtaining==='trial-or-fusion'?/À obtenir par fusion, paquet ou épreuve/:d.status.obtaining==='fusion'?(['légendaire','divine','éveillée'].includes(d.rarity)?/À obtenir par fusion(?! ou paquet)/:/À obtenir par fusion ou paquet/):d.status.obtaining==='trial'?/À gagner en épreuve/:/Obtention non définie/);
 }
 let missing=0;
 for(const id of AUBE_UNIT_IDS)for(const rarity of ['commun','rare','épique','légendaire','divine','éveillée']){
  const model=cardPresentation({id,rarity},{profile:p});if(!model.known){missing++;assert.equal(model.availability,'Rang inexistant');assert.equal(model.stats,null);}
 }
 assert.equal(missing,9);
 const unknown=cardPresentation({id:'bone',rarity:'divine'},{profile:p});assert.equal(unknown.availability,'À concevoir');assert.equal(unknown.stats,null);
 assert.equal(JSON.stringify(p),before);
});

test('Toutes les cartes ont un texte bref et une fiche ; les sorts gardent leurs règles complètes',()=>{
 for(const card of Object.values(CARDS)){
  const model=cardPresentation(card);assert.ok(model.card.description.length<=90,card.id);
  if(card.type==='sort'){assert.equal(model.stats,null);assert.deepEqual(model.details,[card.description]);}
  for(const context of ['hand','collection','forge','alchemy','pack','reward','deck','developer']){
   const html=cardInspectionContent(model.card,{wait:0},model.stats,esc,{presentation:model,context});
   assert.ok(html.includes(card.name));assert.match(html,/class="card-preview"/);
   assert.doesNotMatch(html,/data-action="(?:deck-add|card-upgrade|select-card)"/);
  }
 }
});

test('Définitions effectives : valeurs héritées, fréquence, zones, protections et règles actuelles',()=>{
 const details=(id,rarity)=>cardPresentation({id,rarity}).details.join(' ');
 assert.match(details('militia','éveillée'),/−3 dégâts.*une fois par invocation.*ATQ effective.*sans Charge.*5 PV/);
 assert.match(details('shield','commun'),/Garde :.*entre l’attaquant et la couronne.*ATQ effective/);
 assert.match(details('shield','éveillée'),/toutes les lignes.*ATQ effective/);
 assert.match(details('cleric','éveillée'),/3 PV.*2 alliés blessés distincts.*toutes les lignes/);
 assert.match(details('banner','divine'),/Tous les 3 tours.*\+2 ATQ.*2 autres alliés.*12/);
 assert.match(details('sunpriest','éveillée'),/soin effectif.*\+2.*plafond 2/);
 assert.match(details('lancer','éveillée'),/Déplacement 2.*\+3 ATQ.*ignore l’armure/);
 assert.match(details('dawnbastion','éveillée'),/4 dégâts.*premier ennemi devant.*2 cases.*une seule frappe/);
});

test('Combattant blessé : instantané réel conservé, fiche des règles actuelles',()=>{
 const p=freshProfile(),b=createBattle(p,CAMPAIGN[0],23);
 b.heroes.p.hand=[{id:'shield',wait:0}];playPlayerCard(b,0,0);
 const u=b.board[0][1];Object.assign(u,{atk:17,hp:2,maxhp:22,armor:1,firstHitReductionUsed:true,lastStandUsed:true});
 const before=JSON.stringify({p,b}),model=boardInspectionData(b,u.uid);
 assert.equal(model.stats.atk,17);assert.equal(model.stats.hp,2);assert.equal(model.stats.maxhp,22);
 assert.match(model.details.join(' '),/Armure 1.*entre l’attaquant et la couronne.*ATQ effective/);
 assert.ok(model.board.statuses.includes('Dernier Rempart consommé'));
 assert.equal(JSON.stringify({p,b}),before);
});

test('Natif Aube du laboratoire : la fiche suit son marqueur et les paramètres du moteur',()=>{
 const b=createLabBattle(freshLab(),6);b.heroes.p.hand=[{id:'shield',wait:0}];playPlayerCard(b,0,0);
 const u=b.board[0][1];u.armor=9;
 const model=boardInspectionData(b,u.uid);
 assert.equal(u.cardRules,CARD_RULESET);
 assert.match(model.details.join(' '),/Armure 9.*entre l’attaquant et la couronne.*ATQ effective/);
 assert.doesNotMatch(model.details.join(' '),/Garde historique|2 dégâts/);
});

test('Le catalogue et les mains gardent chacun leur contexte de bonus et de version',()=>{
 const profile=freshProfile();profile.upgrades.militia=3;
 const lab=freshLab();setLabRarity(lab,'p','militia','divine');setLabLevel(lab,'p','militia',1);
 const battle=createLabBattle(lab,34);battle.heroes.p.hand=[{id:'militia',wait:0}];
 const views=createViews(()=>({profile,battle,screen:'battle',animationsEnabled:false}));
 const hand=views.cardUI('militia',{compact:true,index:0,cooldown:0}),catalogue=views.cardUI('militia');
 assert.match(hand,/data-rarity="divine"/);assert.match(hand,/stat hp[^]*?<b>9<\/b>/);
 assert.match(catalogue,/data-rarity="commun"/);assert.match(catalogue,/stat hp[^]*?<b>8<\/b>/);
 assert.equal(labCardStats(lab,'p','militia').hp,9);
});

test('Textes échappés et lecture sans obtention, sans mutation des données centrales',()=>{
 const p=freshProfile(),before=JSON.stringify({p,CARDS,definitions});
 const model=cardPresentation({id:'paladin',rarity:'éveillée'},{profile:p});
 const html=cardInspectionContent({...model.card,name:'<script>'},{wait:0},model.stats,esc,{presentation:model,context:'collection'});
 assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>|data-action="deck-add"/);
 assert.equal(JSON.stringify({p,CARDS,definitions}),before);
 assert.equal(cardPresentation({id:'militia',rarity:'unknown'}),null);
 assert.equal(cardPresentation('missing'),null);
 assert.equal(resolveRulesDefinition('militia').stats.attack,CARDS.militia.attack);
});
