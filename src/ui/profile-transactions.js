// Transaction de profil hors du moteur : une copie est enregistrée avant adoption.
// Les échecs (règle métier ou stockage) ne modifient jamais l'objet actif.
export function commitProfileChange(current,mutate,persist){
 const next=structuredClone(current),result=mutate(next);
 if(result===false||result?.ok===false)return {ok:false,reason:result?.reason||'Modification impossible.',profile:current};
 if(!persist(next))return {ok:false,reason:'Sauvegarde locale indisponible : modification non enregistrée.',profile:current};
 return {ok:true,profile:next,result};
}
