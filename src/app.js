import {createViews} from './ui/views.js';
import {createCombatFx} from './ui/combat-fx.js';
import {mountPaintedArena} from './ui/painted-arena.js';
import {loadProfile,saveProfile,restoreBattle,storeBattle,validateImportedProfile,startNewAdventure,hasPreviousAdventure,restorePreviousAdventure} from './ui/storage.js';
import {CARDS,FACTIONS,CLASSES,CAMPAIGN,TOWER_MAX,towerMission,cardTraits,CHARGE_IDS,RIPOSTE_IDS} from './data.js';
import {AI_STYLES,aiStyle,aiEnraged} from './ai.js';
import {TALENT_TREE,TALENT_LEVELS} from './talents.js';
import {visualFor,artSrc} from './visuals.js';
import {DUNGEONS,dungeonById,dungeonStageMission,dungeonBonusMission} from './dungeons.js';
import {DECK_STYLES,proposeDeck,applyDeckStyle,deckOverview,freshProfile,changeHeroClass,learnClassSkill,normalizeProfile,validateDeck,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,usePower,formationBonus,completeBattle,buyPack,upgradeCard,BUILDINGS,upgradeBuilding,EQUIPMENT,craftEquipment,equipEquipment,chooseHeroTalent,reputationLevel,heroLevel,heroShieldBonus,HERO_MAX_LEVEL,HERO_LEVEL_THRESHOLD,masteryRank,MASTERY_THRESHOLDS,FUSION_RECIPES,FUSION_COSTS,EXTRACTION_SHARDS,extractCard,fuseCard,dungeonUnlocked,beginDungeon,chooseDungeonEvent,nextDungeonBattle,settleDungeonBattle,abandonDungeon} from './engine.js';
const VFX_KEY='couronnes_arcanes_animations_v13';
let animationsEnabled=(()=>{try{return localStorage.getItem(VFX_KEY)!=='off';}catch{return true;}})();

const $=id=>document.getElementById(id);
let profile=load(),battle=loadBattle(),screen=battle?'battle':'home',selectedCard=-1,collectionFilter='all',collectionOwned=false;
let deferredBattleModal='',battleStorageWarning=false;
let pinnedInspection=-1; // Transitoire, non sauvegardé.
const {stopBattleFx,playBattleFx}=createCombatFx(()=>({animationsEnabled,screen}));
const {btn,cardUI,homeUI,campaignUI,towerUI,dungeonUI,collectionUI,alchemyUI,forgeUI,guideUI,battleUI,navUI,resourceUI}=createViews(()=>({profile,battle,screen,selectedCard,collectionFilter,collectionOwned,animationsEnabled,previousGameAvailable:hasPreviousAdventure()}));
function load(){return loadProfile();}
function save(){if(!saveProfile(profile))toast('Sauvegarde locale indisponible : exportez votre progression dans le Guide.');}
function loadBattle(){return restoreBattle();}
function persistBattle(){
 const ok=storeBattle(battle);
 if(!ok&&!battleStorageWarning){battleStorageWarning=true;toast('Combat non sauvegardé : vérifiez le stockage local et exportez votre profil.');}
 if(ok)battleStorageWarning=false;
 return ok;
}

// Render combat VFX from actual rules-engine events. These never enter saved battles.
function withBattleFx(operation){
 if(!battle)return;
 battle.vfx=[];const result=operation();const events=battle.vfx;delete battle.vfx;
 selectedCard=-1;persistBattle();
 // Apply and persist the outcome before waiting for cosmetic animations.
 if(battle.status!=='active')settle({deferModal:true});
 render();
 playBattleFx(result?.ok===false?[]:events,()=>{if(deferredBattleModal){showModal(deferredBattleModal);deferredBattleModal='';}});

 if(result?.ok===false)toast(result.reason);
}

function esc(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
function num(n){return Math.round(n).toLocaleString('fr-FR');}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2900);}
function showModal(html){$('modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;}
function hideModal(){$('modal-root').innerHTML='';}
function welcome(){if(profile.guideSeen||battle?.status==='active')return;showModal(`<div class="kicker">BIENVENUE DANS LE ROYAUME</div><h2>Votre légende commence ici.</h2><p>Ce jeu se joue intégralement dans votre navigateur. Commencez par une mission : sélectionnez une carte, choisissez une ligne, puis terminez votre tour. Vos troupes avanceront toutes seules.</p><p>Le jeu se sauvegarde automatiquement sur cet appareil.</p><div class="button-row">${btn('Compris, jouer !','welcome-start','','primary')}${btn('Lire les règles','welcome-guide','','ghost')}</div>`);}
function render(){
 pinnedInspection=-1;
 const arenaScroll=document.querySelector('.battle-grid')?.scrollLeft||0;
 const arenaVertical=document.querySelector('.battle-grid')?.scrollTop||0;
 const handScroll=document.querySelector('.combat-hand-dock .hand')?.scrollLeft||0;
 const stageScroll=document.querySelector('.combat-stage')?.scrollTop||0;
 stopBattleFx();document.body.classList.toggle('animations-off',!animationsEnabled);
 $('resources').innerHTML=resourceUI();$('nav').innerHTML=navUI();
 $('view').innerHTML=screen==='home'?homeUI():screen==='campaign'?campaignUI():screen==='tower'?towerUI():screen==='dungeons'?dungeonUI():screen==='collection'?collectionUI():screen==='alchemy'?alchemyUI():screen==='forge'?forgeUI():screen==='guide'?guideUI():screen==='battle'&&battle?battleUI():homeUI();
 mountPaintedArena();
 const arena=document.querySelector('.battle-grid');if(arena){arena.scrollLeft=arenaScroll;arena.scrollTop=arenaVertical;}
 const hand=document.querySelector('.combat-hand-dock .hand');if(hand)hand.scrollLeft=handScroll;
 const stage=document.querySelector('.combat-stage');if(stage)stage.scrollTop=stageScroll;
}

function inspectCard(index,pin=false){
 if(!battle||screen!=='battle')return;
 const i=Number(index),entry=battle.heroes.p.hand[i],c=entry&&CARDS[entry.id],panel=$('hand-card-inspection');
 if(!panel||!c)return;
 if(pin&&pinnedInspection===i){closeCardInspection();return;}
 if(pin)pinnedInspection=i;
 if(pinnedInspection>=0&&pinnedInspection!==i&&!pin)return;
 const bonus=profile.upgrades[c.id]||0,rank=masteryRank(profile,c.id);
 panel.hidden=false;
 panel.innerHTML='<b>'+esc(c.name)+'</b> · '+esc(FACTIONS[c.faction].name)+' · '+esc(c.rarity)+
  ' · '+esc(c.description)+(c.type==='unité'?' · ATQ '+(c.attack+bonus)+' / PV '+(c.hp+bonus+(rank===3?1:0)):'')+
  ' · Attente '+Math.max(0,entry.wait||0)+
  ' <button type="button" data-action="close-inspection" aria-label="Fermer la fiche">×</button>';
 document.querySelectorAll('.illustrated-inspect').forEach(el=>el.setAttribute('aria-expanded',String(pinnedInspection===Number(el.dataset.index))));
}
function closeCardInspection(){
 pinnedInspection=-1;const panel=$('hand-card-inspection');
 if(panel){panel.hidden=true;panel.textContent='';}
 document.querySelectorAll('.illustrated-inspect').forEach(el=>el.setAttribute('aria-expanded','false'));
}
function settle({deferModal=false}={}){
 if(!battle||battle.status==='active'||battle.rewardGiven)return;
 // The pending finished battle survives a reload until its profile receipt is saved.
 battle.settlementId ||= [battle.missionId,battle.seed,battle.round,battle.heroes.p.hp,battle.heroes.e.hp].join(':');
 persistBattle();
 if(profile.lastBattleSettlementId===battle.settlementId){
  battle.rewardGiven=true;persistBattle();return;
 }
 const dungeon=battle.mode==='dungeon';
 const mission=dungeon?dungeonStageMission(battle.dungeonId,battle.dungeonStage):battle.mode==='tower'?towerMission(Number(battle.missionId.slice(1))):CAMPAIGN.find(m=>m.id===battle.missionId);
 const nextProfile=JSON.parse(JSON.stringify(profile)),nextBattle=JSON.parse(JSON.stringify(battle));
 const reward=dungeon?settleDungeonBattle(nextProfile,nextBattle):completeBattle(nextProfile,mission,nextBattle);
 nextProfile.lastBattleSettlementId=battle.settlementId;
 if(!saveProfile(nextProfile)){
  toast('Récompense non enregistrée : libérez le stockage et rechargez la page pour réessayer.');
  return;
 }
 profile=nextProfile;battle.rewardGiven=true;battle.progressionGranted=nextBattle.progressionGranted;
 persistBattle();
 if(!deferModal)render();
 const showResult=html=>{if(deferModal)deferredBattleModal=html;else showModal(html);};
 if(!reward?.ok&&dungeon){showResult(`<h2>Expédition interrompue</h2><p>Le combat ne correspond plus à une expédition valide. Aucun butin n'a été versé.</p><div class="button-row">${btn('Retour aux donjons','dungeon-exit','','primary')}</div>`);return;}
 const victory=reward.victory;
 if(dungeon){
  const subtitle=victory?reward.finished?'Donjon terminé !':reward.bonus?'Embuscade vaincue !':'Salle remportée !':'Expédition échouée';
  showResult(`<div class="kicker">${esc(subtitle)}</div><h2>${victory?'Votre équipe est victorieuse !':'Votre troupe doit battre en retraite.'}</h2>
   <p>${victory?reward.finished?'Le boss final est vaincu. Vous avez terminé cette expédition.':reward.choicePending?`Votre souverain reprend son souffle : ${reward.retainedHp} PV. Choisissez une halte avant la prochaine salle.`:`Épreuve remportée : ${reward.retainedHp} PV conservés pour la prochaine salle.`:'Le donjon s’achève ici. Les ressources remportées lors des salles précédentes sont conservées.'}</p>
   <div class="stat-row"><div class="stat-box"><strong>+${reward.gold}</strong><small>Or</small></div><div class="stat-box"><strong>+${reward.shards}</strong><small>Éclats</small></div></div>
   ${reward.heroXp?`<p class="gold">♛ +${reward.heroXp} XP de héros${reward.levelAfter>reward.levelBefore?` · Niveau ${reward.levelAfter} atteint !`:''}${reward.mastered?.length?` · ${reward.mastered.length} carte(s) ont progressé en maîtrise`:''}</p>`:''}
   ${reward.card?`<p class="gold">✦ Première victoire : ${esc(CARDS[reward.card].name)} obtenue !</p>`:''}
   <div class="button-row">${victory&&!reward.finished?(reward.choicePending?btn('✦ Choisir un événement','dungeon-choice-open','','primary'):btn('⚔ Salle suivante','dungeon-next','','primary')):''}${btn('Retour aux donjons','dungeon-exit','','ghost')}</div>`);
  return;
 }
 showResult(`<div class="kicker">${victory?'VICTOIRE REMPORTÉE':'LE COMBAT EST TERMINÉ'}</div><h2>${victory?'La couronne est vôtre !':'Vos troupes se replient.'}</h2><p>${victory?`Vous avez vaincu <b>${esc(mission.enemy)}</b>. Votre armée gagne en expérience et de nouvelles terres s’ouvrent à vous.`:'Vous recevez quelques ressources pour préparer votre revanche. Modifiez votre deck et réessayez.'}</p><div class="stat-row"><div class="stat-box"><strong>+${reward.gold}</strong><small>Or</small></div>${victory?`<div class="stat-box"><strong>+${reward.shards}</strong><small>Éclats</small></div>`:''}</div>${reward.heroXp?`<p class="gold">♛ +${reward.heroXp} XP de héros${reward.levelAfter>reward.levelBefore?` · Niveau ${reward.levelAfter} atteint !`:''}${reward.mastered?.length?` · ${reward.mastered.length} progression(s) de maîtrise`:''}</p>`:''}${reward.card?`<p class="gold">✦ Nouvelle carte obtenue : ${esc(CARDS[reward.card].name)}</p>`:''}${reward.reputation?.length?`<p class="page-sub">Réputation : ${reward.reputation.map(([f,n])=>esc(FACTIONS[f].short)+' +'+n).join(' · ')}</p>`:''}<div class="button-row">${btn(battle.mode==='tower'?'Retour à la Tour':'Continuer la campagne','battle-exit','','primary')}${btn('Modifier mon deck','battle-deck','','ghost')}</div>`);
}
function startDungeonStage(){
 if(!profile.dungeonRun){navigate('dungeons');return;}
 if(profile.dungeonRun.phase==='choice'){toast('Choisissez votre événement avant de poursuivre.');navigate('dungeons');return;}
 if(battle?.status==='active'){
  if(battle.mode==='dungeon'&&battle.dungeonId===profile.dungeonRun.id&&battle.dungeonStage===profile.dungeonRun.stage){screen='battle';render();return;}
  toast('Terminez le combat actuel avant de poursuivre le donjon.');navigate('battle');return;
 }
 const error=validateDeck(profile);if(error){toast(error);navigate('collection');return;}
 try{battle=nextDungeonBattle(profile);persistBattle();selectedCard=-1;screen='battle';render();window.scrollTo(0,0);}catch(e){toast(e.message);navigate('dungeons');}
}
function startDungeon(id){
 if(battle?.status==='active'){toast('Terminez le combat en cours avant de commencer un donjon.');navigate('battle');return;}
 const result=beginDungeon(profile,id);if(!result.ok){toast(result.reason);return;}
 save();startDungeonStage();
}
function startTower(floor){
 if(battle?.status==='active'){toast('Terminez le combat en cours.');navigate('battle');return;}
 const n=Number(floor);if(!Number.isInteger(n)||n<1||n>profile.towerUnlocked||n>TOWER_MAX){toast('Cet étage n’est pas accessible.');return;}
 const invalid=validateDeck(profile);if(invalid){toast(invalid);navigate('collection');return;}
 battle=createBattle(profile,towerMission(n));persistBattle();selectedCard=-1;screen='battle';render();window.scrollTo(0,0);
}
function startMission(id){if(battle?.status==='active'){toast('Terminez le combat en cours.');navigate('battle');return;}const mission=CAMPAIGN.find(x=>x.id===id);if(!mission||Number(id)>profile.unlocked){toast('Cette mission n’est pas encore débloquée.');return;}
 const invalid=validateDeck(profile);if(invalid){toast(invalid);screen='collection';render();return;}
 try{battle=createBattle(profile,mission);persistBattle();selectedCard=-1;screen='battle';render();window.scrollTo(0,0);}catch(e){toast(e.message);}}
function navigate(page){if(battle&&battle.status!=='active'&&!battle.rewardGiven)settle();if(!['home','campaign','tower','dungeons','collection','alchemy','forge','guide','battle'].includes(page))return;screen=page;selectedCard=-1;render();window.scrollTo(0,0);}
function switchToSavedAdventure(){stopBattleFx();deferredBattleModal='';hideModal();profile=load();battle=loadBattle();screen=battle?'battle':'home';selectedCard=-1;render();window.scrollTo(0,0);}
function act(action,dataset){const {id,index,lane,page}=dataset;
 switch(action){

  case 'new-game':showModal(`<div class="kicker">NOUVELLE PARTIE</div><h2>Choisir votre classe de départ</h2><p>Commencez une aventure à zéro avec une autre classe. Vous pouvez aussi changer de classe dans l’Atelier sans recommencer votre progression, après un combat.</p><div class="class-options new-game-classes">${Object.entries(CLASSES).map(([classId,c])=>btn(c.symbol+' '+c.name,'new-game-select',`data-id="${classId}"`,'ghost')).join('')}</div><p class="hint">La partie actuelle sera gardée dans un emplacement de sauvegarde précédent sur cet appareil. Exportez-la dans le Guide pour une copie durable.</p><div class="button-row">${btn('Annuler','close-modal','','ghost')}</div>`);break;
  case 'new-game-select':if(!CLASSES[id])break;showModal(`<div class="kicker">CONFIRMATION</div><h2>Recommencer en ${esc(CLASSES[id].name)} ?</h2><p>Votre progression, votre collection, vos talents et votre combat actuel seront remplacés par une nouvelle aventure. Une copie de la partie précédente sera conservée dans ce navigateur (un seul emplacement).</p><div class="button-row">${btn('Oui, nouvelle partie','confirm-new-game',`data-id="${id}"`,'danger')}${btn('Non, revenir','close-modal','','ghost')}</div>`);break;
  case 'confirm-new-game':if(!startNewAdventure(id)){toast('Nouvelle partie impossible : stockage local indisponible.');break;}switchToSavedAdventure();toast('Nouvelle aventure commencée en '+CLASSES[id].name+'.');break;
  case 'restore-previous-game':if(!hasPreviousAdventure()){toast('Aucune partie précédente disponible.');break;}showModal(`<div class="kicker">PARTIE PRÉCÉDENTE</div><h2>Échanger les deux parties ?</h2><p>La partie précédente (y compris son combat sauvegardé) sera rétablie. Votre partie actuelle prendra sa place dans l’emplacement précédent.</p><div class="button-row">${btn('Oui, retrouver la partie','confirm-restore-previous-game','','primary')}${btn('Annuler','close-modal','','ghost')}</div>`);break;
  case 'confirm-restore-previous-game':if(!restorePreviousAdventure()){toast('Restauration impossible : vérifiez le stockage local.');break;}switchToSavedAdventure();toast('Partie précédente retrouvée.');break;
 case 'home':navigate('home');break;
 case 'nav':navigate(page);break;
 case 'start-next':startMission(CAMPAIGN[Math.min(profile.unlocked-1,11)].id);break;
 case 'start-mission':startMission(id);break;
 case 'start-dungeon':startDungeon(id);break;
 case 'dungeon-choice-open':hideModal();battle=null;persistBattle();navigate('dungeons');break;
 case 'dungeon-event':{const result=chooseDungeonEvent(profile,id);if(!result.ok){toast(result.reason);break;}save();render();toast(id==='rest'?`Halte réparatrice : +${result.restored} PV.`:id==='treasure'?`Trésor récupéré : +${result.gold} or et +${result.shards} éclats.`:'Embuscade acceptée. La récompense exige la victoire.');break;}
 case 'dungeon-next':hideModal();if(battle?.status==='active'){startDungeonStage();break;}battle=null;persistBattle();startDungeonStage();break;
 case 'dungeon-exit':hideModal();battle=null;persistBattle();navigate('dungeons');break;
 case 'dungeon-quit':showModal(`<div class="kicker">QUITTER LE DONJON</div><h2>Abandonner cette expédition ?</h2><p>Les ressources déjà gagnées seront conservées mais vous devrez recommencer au premier combat.</p><div class="button-row">${btn('Confirmer l’abandon','confirm-dungeon-quit','','danger')}${btn('Continuer','close-modal','','ghost')}</div>`);break;
 case 'confirm-dungeon-quit':hideModal();abandonDungeon(profile);if(battle?.mode==='dungeon'){battle=null;persistBattle();}save();navigate('dungeons');break;
 case 'start-tower':startTower(id);break;
 case 'deck-preview':{
  if(battle?.status==='active'){toast('Terminez le combat avant de modifier votre deck.');break;}
  const proposal=proposeDeck(profile,id);
  if(!proposal.ok){toast(proposal.reason);break;}
  const counts=proposal.overview.counts;
  showModal(`<div class="kicker">COMPOSITION PROPOSÉE</div><h2>${esc(DECK_STYLES[id].name)}</h2><p>${esc(DECK_STYLES[id].description)} ${proposal.overview.total} cartes dont ${proposal.overview.units} unités et ${proposal.overview.spells} sorts. Aucune carte ne sera créée ou dépensée.</p><div class="deck-preview-list">${Object.entries(counts).map(([cardId,count])=>`<div><b class="gold">${count}×</b> ${esc(CARDS[cardId].name)}</div>`).join('')}</div><p class="hint">Votre deck actuel (${profile.deck.length} cartes) sera remplacé. Confirmez uniquement si cette composition vous convient ; les cartes restent dans votre collection.</p><div class="button-row">${btn('Appliquer cette composition','deck-apply',`data-id="${id}"`,'primary')}${btn('Annuler','close-modal','','ghost')}</div>`);
  break;
 }
 case 'deck-apply':{
  if(battle?.status==='active'){hideModal();toast('Terminez le combat avant de modifier votre deck.');break;}
  const result=applyDeckStyle(profile,id);
  if(!result.ok){toast(result.reason);break;}
  hideModal();save();render();toast(`Deck « ${DECK_STYLES[id].name} » prêt : ${result.deck.length} cartes.`);
  break;
 }
 case 'learn-class-skill':{if(battle?.status==='active'){toast('Terminez le combat avant d’apprendre une compétence.');break;}const result=learnClassSkill(profile,id);if(result.ok){save();render();toast('Compétence apprise ! Ajoutez-la à votre deck.');}else toast(result.reason);break;}
 case 'deck-add':case 'deck-remove':if(modifyDeck(profile,id,action==='deck-add'?1:-1)){save();render();}else toast('Impossible de modifier ce deck davantage.');break;
 case 'inspect-card':inspectCard(index,true);break;
 case 'close-inspection':closeCardInspection();break;
 case 'select-card':if(!battle||battle.status!=='active')break;
  if(battle.heroes.p.cardsPlayed>=2){toast('Vous avez déjà joué deux cartes ce tour.');break;}
  if(battle.heroes.p.hand[Number(index)]?.wait>0){toast('Cette carte est encore en attente.');break;}
  selectedCard=selectedCard===Number(index)?-1:Number(index);render();break;
 case 'deploy':if(!battle||selectedCard<0)return;withBattleFx(()=>playPlayerCard(battle,selectedCard,Number(lane)));break;
 case 'end-turn':if(!battle)return;withBattleFx(()=>endPlayerTurn(battle));break;
 case 'hero-power':if(!battle)return;withBattleFx(()=>usePower(battle));break;
 case 'toggle-animations':animationsEnabled=!animationsEnabled;try{localStorage.setItem(VFX_KEY,animationsEnabled?'on':'off');}catch{}render();break;
 case 'retreat':showModal(`<div class="kicker">RETRAITE</div><h2>Abandonner la bataille ?</h2><p>Cette décision compte comme une défaite. Dans un donjon, elle met fin à l’expédition.</p><div class="button-row">${btn('Oui, battre en retraite','confirm-retreat','','danger')}${btn('Rester au combat','close-modal','','ghost')}</div>`);break;
 case 'confirm-retreat':if(battle?.status==='active'){battle.status='defeat';battle.phase='finished';hideModal();persistBattle();settle();}break;
 case 'close-modal':hideModal();break;
 case 'battle-exit':const previousMode=battle?.mode;hideModal();battle=null;persistBattle();navigate(previousMode==='tower'?'tower':previousMode==='dungeon'?'dungeons':'campaign');break;
 case 'battle-deck':hideModal();battle=null;persistBattle();navigate('collection');break;
 case 'choose-class':{if(battle?.status==='active'){toast('Terminez le combat avant de changer de classe.');break;}const result=changeHeroClass(profile,id);if(!result.ok){toast(result.reason);break;}save();render();toast('Nouvelle classe sélectionnée.');break;}
 case 'choose-talent':{if(battle?.status==='active'){toast('Terminez le combat avant de changer vos talents.');break;}const result=chooseHeroTalent(profile,id);if(result.ok){save();render();toast('Voie de talent sélectionnée.');}else toast(result.reason);break;}
 case 'craft-equipment':{const result=craftEquipment(profile,id);if(result.ok){save();render();toast('Équipement fabriqué et équipé.');}else toast(result.reason);break;}
 case 'equip-equipment':{const result=equipEquipment(profile,id);if(result.ok){save();render();toast('Équipement changé.');}else toast(result.reason);break;}
 case 'fuse-card':{const result=fuseCard(profile,id);if(result.ok){save();render();toast('Nouvelle carte créée par alchimie.');}else toast(result.reason);break;}
 case 'extract-card':{const result=extractCard(profile,id);if(result.ok){save();render();toast(`Carte extraite : +${result.shards} éclats.`);}else toast(result.reason);break;}
 case 'card-upgrade':const up=upgradeCard(profile,id);if(up.ok){save();render();toast('Carte améliorée !');}else toast(up.reason);break;
 case 'building-upgrade':const bu=upgradeBuilding(profile,id);if(bu.ok){save();render();toast('Bâtiment amélioré !');}else toast(bu.reason);break;
 case 'buy-pack':const pack=buyPack(profile);if(!pack.ok){toast(pack.reason);break;}save();render();showModal(`<div class="kicker">PAQUET MYSTIQUE</div><h2>Trois nouvelles découvertes</h2><p>Ces cartes rejoignent votre collection. Ajoutez-les à votre deck pour les utiliser.</p><div class="three-grid">${pack.cards.map(id=>cardUI(id)).join('')}</div><div class="button-row">${btn('Voir ma collection','pack-collection','','primary')}${btn('Fermer','close-modal','','ghost')}</div>`);break;
 case 'pack-collection':hideModal();navigate('collection');break;
 case 'export-save':{const blob=new Blob([JSON.stringify(profile,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='couronnes_et_arcanes_sauvegarde.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Sauvegarde exportée.');break;}
 case 'import-save':$('import-file')?.click();break;
 case 'welcome-start':profile.guideSeen=true;save();hideModal();startMission('01');break;
 case 'welcome-guide':profile.guideSeen=true;save();hideModal();navigate('guide');break;
 }
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;event.preventDefault();act(el.dataset.action,el.dataset);});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){closeCardInspection();return;}
 if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button')){
  const el=event.target.closest('.unit-card.compact,[data-action="deploy"]');
  if(el){event.preventDefault();act(el.dataset.action,el.dataset);}
 }
});
document.addEventListener('mouseover',event=>{
 const el=event.target.closest('.illustrated-pilot.hand-card');if(el)inspectCard(el.dataset.index);
});
document.addEventListener('mouseout',event=>{
 const el=event.target.closest('.illustrated-pilot.hand-card');
 if(el&&!el.contains(event.relatedTarget)&&pinnedInspection<0)closeCardInspection();
});
document.addEventListener('focusin',event=>{
 const el=event.target.closest('.illustrated-pilot.hand-card');if(el)inspectCard(el.dataset.index);
});
document.addEventListener('focusout',event=>{
 const el=event.target.closest('.illustrated-pilot.hand-card');
 if(el&&!el.contains(event.relatedTarget)&&pinnedInspection<0)closeCardInspection();
});
document.addEventListener('change',async event=>{if(event.target.id==='import-file'){const file=event.target.files?.[0];if(!file)return;try{const raw=JSON.parse(await file.text()),imported=validateImportedProfile(raw);if(!saveProfile(imported))throw Error('Sauvegarde impossible.');if(!storeBattle(null)){saveProfile(profile);throw Error('Nettoyage impossible.');}profile=imported;battle=null;navigate('home');toast('Progression importée.');}catch{toast('Import impossible : fichier invalide.');}return;}if(event.target.id==='faction'){collectionFilter=event.target.value;render();}if(event.target.id==='owned-only'){collectionOwned=event.target.checked;render();}});
render();if(battle&&battle.status!=='active')settle();else welcome();
