// Contrat visuel du pilote : atlas approuvés, aucun calcul de combat.
export const UNIT_SPRITES=Object.freeze({archer:{
 id:'arbaletriere_aube',frame:512,anchor:{x:256,y:461},displaySize:140,
 static:'arbaletriere_aube/static',
 clips:{
  repos:{texture:'arbaletriere_aube/repos',durations:[650,650,800,650],loop:true},
  marche:{texture:'arbaletriere_aube/marche',durations:[180,150,180,150],loop:true},
  tir:{texture:'arbaletriere_aube/tir',durations:[200,140,260,110,160,230],loop:false},
  impact:{texture:'arbaletriere_aube/impact',durations:[110,160,200],loop:false},
  defaite:{texture:'arbaletriere_aube/defaite',durations:[150,230,250,450],loop:false}
 },projectile:{releaseMs:600,travelMs:440,impactMs:380,x:469,y:141}
}});
export const INLINE_UNIT_TEXTURES={};
export function unitTexture(key){return INLINE_UNIT_TEXTURES[key]||`./assets/units/${key}.webp`;}
export function unitSpriteFor(id){return UNIT_SPRITES[id]||null;}
export function clipDuration(clip){return clip.durations.reduce((sum,n)=>sum+n,0);}
export function clipFrame(clip,elapsed){
 let time=Math.max(0,elapsed),duration=clipDuration(clip);
 if(clip.loop)time%=duration;
 for(let i=0;i<clip.durations.length;i++){if(time<clip.durations[i])return i;time-=clip.durations[i];}
 return clip.durations.length-1;
}
export function unitSpriteHTML(id,side,fallback=''){
 const sprite=unitSpriteFor(id);if(!sprite)return '';
 return `<span class="sprite-figure illustrated-unit" data-unit-card="${id}" data-unit-side="${side}" data-clip="repos" data-frame="0" data-fallback="${fallback}"><span class="unit-facing ${side==='e'?'facing-left':''}"><img class="unit-static" src="${unitTexture(sprite.static)}" alt="" draggable="false" /><span class="unit-atlas"></span></span></span>`;
}

// Les UID viennent seulement des traces publiques. Les horloges sont transitoires.
export function unitAnimationPlan(events){
 const actions=[],clocks=new Map();let movementEnd=0;
 const add=(actor,clip,event,start,from,to)=>{
  const duration=clipDuration(UNIT_SPRITES[actor.cardId].clips[clip]);
  actions.push({actor,clip,event,start,duration,from,to});
  clocks.set(actor.uid,start+duration);return start+duration;
 };
 for(const event of events){
  const actor=event.actor,target=event.target;
  const animated=actor&&unitSpriteFor(actor.cardId);
  if(animated){
   const earliest=clocks.get(actor.uid)||0;
   if(event.type==='move'||event.type==='teleport'){
    const end=add(actor,'marche',event,earliest,{lane:event.fromLane??event.lane,col:event.from},{lane:event.lane,col:event.to});
    movementEnd=Math.max(movementEnd,end);
   }else if(event.type==='attack'){
    const start=Math.max(earliest,movementEnd);
    add(actor,'tir',event,start,{lane:event.lane,col:event.from},{lane:event.lane,col:event.from});
   }else if(event.type==='death'){
    add(actor,'defaite',event,earliest,{lane:event.lane,col:event.col},{lane:event.lane,col:event.col});
   }else if(event.type==='spawn'){
    add(actor,'repos',event,earliest,{lane:event.lane,col:event.col},{lane:event.lane,col:event.col});
    actions.at(-1).duration=420;clocks.set(actor.uid,earliest+420);
   }
  }
  if(['attack','poison','trap-trigger'].includes(event.type)&&target&&unitSpriteFor(target.cardId)&&event.damage>0){
   const attack=actions.findLast(a=>a.actor.uid===actor?.uid&&a.clip==='tir');
   const arrival=attack?attack.start+1040:movementEnd+(event.type==='attack'?(event.ranged||event.magic?490:70):0);
   const col=event.type==='attack'?event.to:event.col;
   add(target,'impact',event,Math.max(clocks.get(target.uid)||0,arrival),{lane:event.lane,col},{lane:event.lane,col});
  }
 }
 const projectileEnds=actions.filter(a=>a.clip==='tir').map(a=>{const p=UNIT_SPRITES[a.actor.cardId].projectile;return a.start+p.releaseMs+p.travelMs+p.impactMs;});
 return {actions,duration:Math.max(0,...actions.map(a=>a.start+a.duration),...projectileEnds)+80};
}
