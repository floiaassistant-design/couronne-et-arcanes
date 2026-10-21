import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile} from '../src/engine.js';
import {CARDS} from '../src/data.js';
import {createViews} from '../src/ui/views.js';
import {COLLECTION_RANKS,collectionEntries,collectionInspection} from '../src/ui/collection.js';

function view(profile,faction='aube'){return createViews(()=>({profile,battle:null,screen:'collection',selectedCard:-1,collectionFilter:faction,collectionOwned:false,animationsEnabled:false}));}
const esc=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;');

test('La collection reste une lecture du profil et garde toutes les cartes du catalogue',()=>{
 const profile=freshProfile(),before=JSON.stringify(profile),views=view(profile),html=views.collectionUI();
 assert.equal(collectionEntries(profile).length,Object.keys(CARDS).length);
 assert.equal(COLLECTION_RANKS.length,6);
 assert.match(html,/data-collection-character="militia"/);
 assert.match(html,/data-collection-character="archer"/);
 assert.match(html,/data-collection-character="shield"/);
 assert.match(html,/data-action="deck-preview"/);
 assert.match(html,/data-action="learn-class-skill"/);
 assert.match(html,/Deck actif/);
 assert.equal(JSON.stringify(profile),before);
});

test('Seule la rareté réelle porte la possession et les actions de deck',()=>{
 const profile=freshProfile(),html=view(profile).collectionUI();
 const row=html.match(/<tr data-collection-character="militia">([\s\S]*?)<\/tr>/)[1];
 assert.equal((row.match(/data-collection-rarity=/g)||[]).length,6);
 assert.equal((row.match(/data-current-version="true"/g)||[]).length,1);
 assert.equal((row.match(/Possédée ×4/g)||[]).length,2); // label accessible + statut visible
 assert.equal((row.match(/data-action="deck-add"/g)||[]).length,1);
 assert.equal((row.match(/data-action="deck-remove"/g)||[]).length,1);
 assert.equal((row.match(/class="unit-card collection-future"/g)||[]).length,5);
 assert.match(row,/À concevoir/);
 const future=row.match(/<td[^>]+data-collection-rarity="divine"([\s\S]*?)<\/td>/)[1];
 assert.doesNotMatch(future,/data-action="deck-(?:add|remove)"/);
 assert.match(future,/Attaque et vie à définir/);
});

test('Les statistiques de la version actuelle réutilisent les bonus du profil',()=>{
 const profile=freshProfile();profile.upgrades.archer=2;profile.buildings.forge=1;
 profile.reputation.aube=15;profile.equipmentOwned=['lame'];profile.equipped.arme='lame';profile.mastery.archer=22;
 const html=view(profile).collectionUI();
 const cell=html.match(/<td data-card-id="archer"[^>]+data-current-version="true">([\s\S]*?)<\/td>/)[1];
 assert.match(cell,/class="stat atk">⚔ <b>5<\/b>/);
 assert.match(cell,/class="stat hp">♥ <b>8<\/b>/);
});

test('Les rangs futurs se consultent sans permettre une fausse évolution',()=>{
 const profile=freshProfile(),views=view(profile),helpers={btn:views.btn,cardUI:views.cardUI,esc};
 const before=JSON.stringify(profile);
 const future=collectionInspection(profile,'militia','éveillée',helpers);
 assert.match(future,/évolution est à concevoir/);
 assert.doesNotMatch(future,/data-action="(?:deck-add|card-upgrade|fuse-card)"/);
 assert.equal(collectionInspection(profile,'missing','rare',helpers),null);
 assert.equal(collectionInspection(profile,'militia','missing',helpers),null);
 assert.equal(JSON.stringify(profile),before);
 assert(collectionEntries(profile,'sort').every(c=>c.type==='sort'));
 assert(collectionEntries(profile,'aube',true).every(c=>(profile.collection[c.id]||0)>0));
});

test('Une compétence apprise garde une seule commande de deck, quel que soit l’onglet',()=>{
 const profile=freshProfile();profile.collection.skill_guard_wall=1;
 for(const faction of ['aube','sort','all']){
  const html=view(profile,faction).collectionUI();
  assert.equal((html.match(/data-action="deck-add" data-id="skill_guard_wall"/g)||[]).length,1,faction);
 }
});
