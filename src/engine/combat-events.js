// Instantanés publics de présentation. Aucun calcul de règle, DOM ou stockage.
export function captureCombatFrame(b) {
 return {
  board:b.board.map(row=>row.map(u=>u?{...u}:null)),
  heroes:Object.fromEntries(['p','e'].map(side=>[side,{hp:b.heroes[side].hp,shield:b.heroes[side].shield}])),
  traps:(b.traps||[]).map(t=>({...t}))
 };
}
export function recordCombatEvent(b,event) {
 if(!Array.isArray(b.vfx))return;
 const frame=captureCombatFrame(b);
 // Le moteur retire la carte juste après l'émission ; le lecteur la retire à la fin de l'effet.
 if(event.type==='death')frame.board[event.lane][event.col]=null;
 // Métadonnée locale non énumérable : préserver le contrat des événements historiques.
 const recorded={...event};Object.defineProperty(recorded,'frame',{value:frame});
 b.vfx.push(recorded);
}
