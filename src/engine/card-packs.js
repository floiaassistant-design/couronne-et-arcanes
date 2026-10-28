// Préparer tous les tirages et vérifier les stocks avant tout prélèvement.
import {CAMPAIGN} from '../data.js';
import {cardPack} from '../card-packs.js';
import {cardReference,cardKey,ownedCardCopies,playableCardReference} from '../cards/references.js';

export function previewCardPack(profile,id,battle=null){
 const pack=cardPack(id);if(!pack)return {ok:false,reason:'Paquet inconnu.'};
 let reason='';
 if(battle&&(!battle.rewardGiven||battle.status==='active'))reason='Terminez le combat et récupérez son résultat avant d’ouvrir un paquet.';
 else if(pack.mission&&!profile.completed.includes(pack.mission)){
  const mission=CAMPAIGN.find(m=>m.id===pack.mission);reason=`Vaincre ${mission.enemy} dans « ${mission.name} » pour ouvrir ce paquet.`;
 }else if(!Number.isSafeInteger(profile.gold)||profile.gold<0)reason='Montant d’or invalide.';
 else if(profile.gold<pack.cost)reason=`Il faut ${pack.cost} pièces d’or.`;
 return {pack,ok:!reason,reason};
}

export function buyCardPack(profile,id,random=Math.random,battle=null){
 const access=previewCardPack(profile,id,battle);if(!access.ok)return access;
 const {pack}=access,cards=[],gains=new Map();
 try{
  if(pack.groups.reduce((n,g)=>n+g.weight,0)!==100||pack.groups.some(g=>!g.cards.length||!g.cards.every(playableCardReference)))throw Error('Contenu indisponible');
  const roll=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Tirage invalide');return n;};
  for(let i=0;i<pack.count;i++){
   const draw=roll();let threshold=0;
   const group=pack.groups.find(g=>{threshold+=g.weight;return draw<threshold/100;});
   const ref=cardReference(group.cards[Math.floor(roll()*group.cards.length)]),key=cardKey(ref);
   cards.push(ref);const gain=gains.get(key)||{ref,amount:0};gain.amount++;gains.set(key,gain);
  }
  for(const {ref,amount} of gains.values()){
   const raw=typeof ref==='string'?profile.collection[ref]:profile.evolvedCollection?.[cardKey(ref)];
   const n=ownedCardCopies(profile,ref);if(raw!==undefined&&!Number.isSafeInteger(raw)||!Number.isSafeInteger(n)||n<0||n+amount>100000)throw Error('Stock invalide ou limite atteinte');
  }
 }catch{return {ok:false,reason:'Ouverture impossible : tirage ou stock indisponible. Aucun or dépensé.'};}
 profile.gold-=pack.cost;
 for(const {ref,amount} of gains.values()){
  if(typeof ref==='string')profile.collection[ref]=(profile.collection[ref]||0)+amount;
  else{profile.evolvedCollection??={};const key=cardKey(ref);profile.evolvedCollection[key]=(profile.evolvedCollection[key]||0)+amount;}
 }
 return {ok:true,cards,packId:pack.id,cost:pack.cost};
}

// API historique : même prix, mêmes pools, six appels aléatoires et résultat natif.
export function buyPack(profile,random=Math.random){
 const result=buyCardPack(profile,'mystic',random);
 return result.ok?{ok:true,cards:result.cards}:{ok:false,reason:result.reason};
}
