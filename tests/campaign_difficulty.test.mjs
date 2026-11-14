import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../src/data.js';
import {campaignMission} from '../src/campaign-difficulty.js';
import {completeBattle,createBattle,endPlayerTurn,freshProfile,playEnemyCard} from '../src/engine.js';
import {unitCanPlay} from '../src/engine/unit-rules.js';
import {validStoredBattle} from '../src/ui/storage.js';
import {forgeUnit} from './fixtures/forge-combat.mjs';

const pilot=[
 ['06',{id:'golem',rarity:'légendaire'}],
 ['12',{id:'sentinel',rarity:'divine'}]
];

test('Campagne Difficile : un remplacement par boss et mêmes rencontres en Normal',()=>{
 for(const mission of CAMPAIGN)assert.equal(campaignMission(mission.id),mission);
 for(const [id,reference] of pilot){
  const normal=campaignMission(id),hard=campaignMission(id,'hard');
  const {deck,campaignDifficulty,...details}=hard;
  assert.equal(campaignDifficulty,'hard');
  const {deck:normalDeck,...normalDetails}=normal;
  assert.deepEqual(details,normalDetails);
  const index=normalDeck.indexOf(reference.id);
  assert(index>=0);
  assert.deepEqual(deck,normalDeck.with(index,reference));
  assert.equal(typeof normalDeck[index],'string');
 }
 assert.equal(campaignMission('06','normal'),campaignMission('06'));
 assert.equal(campaignMission('03','hard'),null);
 assert.equal(campaignMission('06','unknown'),null);
});

for(const [id,reference] of pilot){
 test(`Mission ${id} en Difficile : l’IA invoque sa version et déclenche sa Garde après reprise`,()=>{
  const battle=createBattle(freshProfile(),campaignMission(id,'hard'),1,{turnFlow:'alternating'});
  assert.equal(battle.evolutionsEnabled,undefined);
  const enemy=battle.heroes.e;
  assert.equal([...enemy.hand,...enemy.deck].filter(x=>x?.rarity===reference.rarity).length,1);
  assert(validStoredBattle(battle));

  // Mettre la carte en main sans attendre sa pioche, puis utiliser l’IA ordinaire.
  enemy.hand=[{...reference,wait:0}];enemy.deck=[];
  battle.phase='enemy';
  assert.equal(unitCanPlay(battle,reference,'p'),false);
  assert.equal(unitCanPlay({...battle,mode:'tower'},reference,'e'),false);
  assert.equal(unitCanPlay({...battle,campaignDifficulty:undefined},reference,'e'),false);
  const other=pilot.find(([missionId])=>missionId!==id)[1];
  assert.equal(unitCanPlay(battle,other,'e'),false);
  assert.equal(validStoredBattle({...battle,campaignDifficulty:'unknown'}),false);
  assert.equal(validStoredBattle({...battle,campaignDifficulty:undefined}),false);

  assert.equal(playEnemyCard(battle).done,false);
  assert.deepEqual(enemy.discard,[reference]);
  const restored=JSON.parse(JSON.stringify(battle));
  assert(validStoredBattle(restored));
  const guardian=restored.board.flat().find(u=>u?.side==='e');
  assert.equal(guardian.rarity,reference.rarity);

  for(const row of restored.board)row.fill(null);
  restored.phase='player';
  restored.board[0][9]=forgeUnit('archer','p',{atk:3,hp:20,maxhp:20});
  restored.board[0][10]=guardian;
  const crownHp=restored.heroes.e.hp;
  assert(endPlayerTurn(restored).ok);
  assert.equal(restored.heroes.e.hp,crownHp);
  if(reference.id==='golem')assert.equal(restored.heroes.e.shield,1);
  else assert.equal(guardian.guardPrismReadyRound,4);
 });
}

test('Les deux variantes partagent les gains et le premier déblocage de mission',()=>{
 const profile=freshProfile(),normal=campaignMission('06'),hard=campaignMission('06','hard');
 const normalProfile=structuredClone(profile);
 const result=mission=>({...createBattle(profile,mission,1),status:'victory'});
 const firstNormal=completeBattle(normalProfile,normal,result(normal));
 const firstHard=completeBattle(profile,hard,result(hard));
 assert(firstNormal.card);
 assert.deepEqual(firstHard,firstNormal);
 assert.deepEqual(profile,normalProfile);
 assert.equal(completeBattle(profile,normal,result(normal)).card,null);
 assert.deepEqual(profile.completed,['06']);
});
