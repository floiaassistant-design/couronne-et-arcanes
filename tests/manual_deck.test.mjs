import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile} from '../src/engine.js';
import {manualDeckCards} from '../src/ui/deck-builder.js';
import {createViews} from '../src/ui/views.js';

const views=(profile,extra={})=>createViews(()=>({profile,battle:null,screen:'deck',animationsEnabled:false,...extra}));
test('Le choix manuel ne propose que les cartes possédées de la classe, au rang natif',()=>{
 const p=freshProfile();p.collection.skill_arc_freeze=1;p.collection['militia:divine']=1;
 const before=JSON.stringify(p),cards=manualDeckCards(p);
 assert.ok(cards.some(c=>c.id==='militia'));
 assert.ok(cards.every(c=>p.collection[c.id]>0&&(!c.heroClass||c.heroClass===p.heroClass)));
 assert.ok(!cards.some(c=>c.id==='skill_arc_freeze'||c.rarity==='divine'));
 assert.equal(manualDeckCards(p,{query:'ÉCLAIREUSE'})[0].id,'ranger');
 assert.equal(manualDeckCards(p,{query:'eclaireuse'})[0].id,'ranger');
 assert.ok(manualDeckCards(p,{faction:'aube',type:'unité'}).every(c=>c.faction==='aube'&&c.type==='unité'));
 assert.equal(JSON.stringify(p),before);
});
test('Le constructeur réutilise les limites du deck, distingue exemplaires utilisés et possédés sans mutation',()=>{
 const p=freshProfile(),before=JSON.stringify(p),html=views(p).deckUI();
 assert.match(html,/18<small> \/ 24 cartes/);
 assert.match(html,/Deck prêt au combat/);
 const militia=html.match(/<article[^>]*data-deck-card="militia"[^]*?<\/article>/)[0];
 assert.match(militia,/4<\/b> dans le deck/);
 assert.match(militia,/4 possédés/);
 assert.match(militia,/data-action="deck-add"[^>]*disabled/);
 assert.equal(JSON.stringify(p),before);
 p.collection.militia=30;p.deck=Array(24).fill('militia');
 assert.match(views(p).deckUI().match(/<article[^>]*data-deck-card="militia"[^]*?<\/article>/)[0],/data-action="deck-add"[^>]*disabled/);
});
test('Deck incomplet et combat actif : validation explicite, consultation seule et raccourcis facultatifs',()=>{
 const p=freshProfile();p.deck=[];
 const empty=views(p).deckUI();
 assert.match(empty,/entre 12 et 24 cartes/);
 assert.match(empty,/data-page="campaign" disabled/);
 assert.match(empty,/<details class="manual-deck-help"><summary>/);
 const locked=views(p,{battle:{status:'active'}}).deckUI();
 assert.match(locked,/Terminez ce combat/);
 assert.ok([...locked.matchAll(/<button[^>]*data-action="deck-(?:add|remove|clear|preview)"[^>]*>/g)].every(m=>m[0].includes('disabled')));
});
test('Recherche échappée et vues réutilisées lisent les filtres courants sans état dans le profil',()=>{
 const p=freshProfile(),before=JSON.stringify(p),filters={query:'<script>',type:'all',faction:'all'};
 const v=views(p,{deckFilters:filters});
 assert.match(v.deckUI(),/value="&lt;script&gt;"/);
 assert.doesNotMatch(v.deckUI(),/<script>/);
 filters.query='Milicien';assert.match(v.deckUI(),/data-deck-card="militia"/);
 filters.query='aucun résultat';assert.doesNotMatch(v.deckUI(),/<article[^>]*data-deck-card=/);
 assert.equal(JSON.stringify(p),before);
});
