// Contrat de sauvegarde inchangé : les versions précédentes se rechargent.
import {freshProfile,normalizeProfile} from '../engine.js';
import {supportedBoard} from '../engine/board.js';
export const SAVE_KEY='couronnes_arcanes_v1';
export const BATTLE_KEY='couronnes_arcanes_bataille_v1';
export function loadProfile(){try{const value=localStorage.getItem(SAVE_KEY);return value?normalizeProfile(JSON.parse(value)):freshProfile();}catch{return freshProfile();}}
export function saveProfile(profile){try{localStorage.setItem(SAVE_KEY,JSON.stringify(profile));return true;}catch{return false;}}
export function restoreBattle(){try{const b=JSON.parse(localStorage.getItem(BATTLE_KEY)||'null');return b&&b.status==='active'&&supportedBoard(b.board)&&b.heroes?.p&&b.heroes?.e?b:null;}catch{return null;}}
export function storeBattle(battle){try{if(battle?.status==='active'){const {vfx,...saved}=battle;localStorage.setItem(BATTLE_KEY,JSON.stringify(saved));}else localStorage.removeItem(BATTLE_KEY);return true;}catch{return false;}}
