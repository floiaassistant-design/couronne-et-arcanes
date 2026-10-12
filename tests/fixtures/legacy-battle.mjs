// Les scénarios historiques portent sur la reprise du plateau 3×5.
// Aucun résultat attendu ni référence de parité n'est modifié.
import {createBattle as currentBattle} from '../../src/engine/battle.js';
export function createBattle(profile,mission,seed){return currentBattle(profile,mission,seed,{legacy:true});}
