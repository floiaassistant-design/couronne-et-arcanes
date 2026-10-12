// Sauvegardes locales : validation rétrocompatible et clôture récupérable.
import {freshProfile,normalizeProfile,validateDeck} from '../engine.js';
import {supportedBoard,lastCell} from '../engine/board.js';
import {CARDS} from '../data.js';
export const SAVE_KEY='couronnes_arcanes_v1';
export const BATTLE_KEY='couronnes_arcanes_bataille_v1';
const hasCard=id=>typeof id==='string'&&Object.prototype.hasOwnProperty.call(CARDS,id);
const nonNegative=n=>Number.isFinite(n)&&n>=0;
const validPile=p=>Array.isArray(p)&&p.every(hasCard);
const validHand=h=>Array.isArray(h)&&h.every(c=>c&&hasCard(c.id)&&Number.isInteger(c.wait)&&c.wait>=0&&c.wait<=100);
const validHero=h=>h&&typeof h.name==='string'&&nonNegative(h.hp)&&Number.isFinite(h.maxhp)&&h.maxhp>0&&
 nonNegative(h.shield)&&validPile(h.deck)&&validPile(h.discard)&&validHand(h.hand)&&Number.isInteger(h.cardsPlayed)&&h.cardsPlayed>=0&&h.cardsPlayed<=2;
const validUnit=u=>u===null||(u&&typeof u==='object'&&hasCard(u.id)&&CARDS[u.id].type==='unité'&&
 ['p','e'].includes(u.side)&&Number.isInteger(u.uid)&&u.uid>=0&&nonNegative(u.hp)&&Number.isFinite(u.maxhp)&&u.maxhp>0&&
 Number.isFinite(u.atk)&&nonNegative(u.armor||0)&&nonNegative(u.stun||0)&&nonNegative(u.poison||0)&&nonNegative(u.poisonTurns||0));
export function validStoredBattle(b){
 if(!b||!['active','victory','defeat'].includes(b.status)||b.rewardGiven||
  !['player','resolving','finished'].includes(b.phase)||!Number.isInteger(b.round)||b.round<1||
  typeof b.missionId!=='string'||!supportedBoard(b.board)||
  !validHero(b.heroes?.p)||!validHero(b.heroes?.e)||
  !Array.isArray(b.log)||!b.log.every(x=>typeof x==='string'))return false;
 if(!b.board.every(row=>row.every(validUnit)))return false;
 if(b.traps!==undefined&&(!Array.isArray(b.traps)||!b.traps.every(t=>t&&['p','e'].includes(t.owner)&&
   Number.isInteger(t.lane)&&t.lane>=0&&t.lane<b.board.length&&
   Number.isInteger(t.col)&&t.col>=1&&t.col<=lastCell(b)&&nonNegative(t.damage))))return false;
 return true;
}
export function validateImportedProfile(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!Array.isArray(raw.deck)||
  !raw.collection||typeof raw.collection!=='object'||Array.isArray(raw.collection))throw Error('Format de profil invalide.');
 for(const key of ['gold','shards','stars','wins','losses','heroXp']){
  if(raw[key]!==undefined&&(!Number.isSafeInteger(raw[key])||raw[key]<0))throw Error('Montant ou progression invalide : '+key);
 }
 for(const amount of Object.values(raw.collection))if(!Number.isSafeInteger(amount)||amount<0)throw Error('Quantité de cartes invalide.');
 const p=normalizeProfile(raw),error=validateDeck(p);
 if(error)throw Error(error);
 return p;
}
export function loadProfile(){try{const value=localStorage.getItem(SAVE_KEY);return value?normalizeProfile(JSON.parse(value)):freshProfile();}catch{return freshProfile();}}
export function saveProfile(profile){try{localStorage.setItem(SAVE_KEY,JSON.stringify(profile));return true;}catch{return false;}}
export function restoreBattle(){try{
 const b=JSON.parse(localStorage.getItem(BATTLE_KEY)||'null');
 return validStoredBattle(b)?b:null;
}catch{return null;}}
export function storeBattle(battle){try{
 if(battle?.status==='active'||(battle&&['victory','defeat'].includes(battle.status)&&!battle.rewardGiven)){
  const {vfx,...saved}=battle;localStorage.setItem(BATTLE_KEY,JSON.stringify(saved));
 }else localStorage.removeItem(BATTLE_KEY);
 return true;
}catch{return false;}}
