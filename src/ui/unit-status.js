// Indications persistantes des états réels ; aucune durée inventée.
export function unitStatusBadges(u,round){
 const labels=[u.barrier>0?`⬡ ${u.barrier} protection`:'',u.stun>0?`❄ ${u.stun} immobilisation`:'',
  u.poisonTurns>0?`☠ ${u.poisonTurns} poison`:'',u.rallyUntil>=round?`⚑ ${u.rallyUntil-round+1} ralliement`:'',
  u.attackPenalty?`Harcèlement −${u.attackPenalty.amount}`:'',u.regeneration?`Régénération ${u.regeneration.amount}`:''];
 return labels.some(Boolean)?`<span class="combat-statuses" aria-label="Effets actifs">${labels.filter(Boolean).map(s=>`<span>${s}</span>`).join('')}</span>`:'';
}
