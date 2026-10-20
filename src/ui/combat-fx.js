// Anciennes animations de combat retirées sur décision du 20/10/2026.
// L'API reste compatible avec le contrôleur et appelle toujours sa fin de lecture.
// Le moteur et ses événements publics restent indépendants de cette transition.
export function createCombatFx(){
 function stopBattleFx(){}
 function playBattleFx(_events,onDone){onDone?.();}
 return {stopBattleFx,playBattleFx};
}
