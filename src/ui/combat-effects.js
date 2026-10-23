// Bibliothèque procédurale bornée : seulement des éléments temporaires, aucun moteur.
const SPELL_THEMES=Object.freeze({
 firebolt:'forge',sundawn:'aube',bloodpact:'ombre',arcflare:'ombre',entangle:'sylve',vines:'sylve',
 healing:'sylve',warcry:'sylve',sanctuary:'aube',skill_guard_wall:'aube',skill_guard_rally:'aube',
 skill_cleric_light:'aube',skill_cleric_bless:'aube',seal_silence:'ombre',rune_trap:'forge'
});
const GLYPHS={aube:'✧',sylve:'❧',ombre:'◈',forge:'✦',ether:'ϟ'};
export function combatEffectProfile(step){
 const faction=SPELL_THEMES[step.sourceId]||(['aube','sylve','ombre','forge','ether'].includes(step.faction)?step.faction:'ether');
 const kind=step.type==='move'||step.type==='teleport'?'travel':step.type!=='attack'||step.magic||step.faction==='ether'?'magic':step.ranged?'ranged':'melee';
 return {faction,kind,glyph:GLYPHS[faction]};
}
export function createCombatEffects(layer,speed,animations){
 const center=n=>{const r=n?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null;};
 function element(cls,text){const n=document.createElement('span');n.className=cls;if(text)n.textContent=text;layer.appendChild(n);return n;}
 function point(cls,n,text){const p=center(n);if(!p)return;const mark=element(cls,text);mark.style.left=p.x+'px';mark.style.top=p.y+'px';return mark;}
 function animate(n,frames,options){if(n?.animate)animations.push(n.animate(frames,{...options,duration:options.duration/speed,delay:(options.delay||0)/speed}));}
 function connect(source,target,kind){
  const a=center(source),b=center(target);if(!a||!b)return;
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<2)return;
  const trail=element('combat-fx-path '+kind);trail.style.left=a.x+'px';trail.style.top=a.y+'px';
  trail.style.width=length+'px';trail.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  if(kind==='melee'){
   const scale=Math.min(22,length*.2)/length;
   animate(source,[{translate:'0px 0px'},{translate:`${dx*scale}px ${dy*scale}px`,offset:.4},{translate:'0px 0px'}],{duration:620,easing:'ease-in-out'});
   return;
  }
  const projectile=element('combat-fx-projectile '+kind);projectile.style.left=a.x+'px';projectile.style.top=a.y+'px';projectile.style.rotate=Math.atan2(dy,dx)+'rad';
  animate(source,[{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:260});
  animate(projectile,[{translate:'0px 0px',opacity:0},{translate:'0px 0px',opacity:1,offset:.18},{translate:`${dx}px ${dy}px`,opacity:1}],{duration:420,fill:'forwards',easing:'ease-in'});
 }
 function impact(target,kind,glyph){
  point('combat-fx-impact '+kind,target,glyph);
  animate(target,[{translate:'0px 0px',filter:'brightness(1)'},{translate:'4px 0px',filter:'brightness(1.8)'},{translate:'-3px 0px'},{translate:'0px 0px',filter:'brightness(1)'}],{duration:280,delay:420,easing:'ease-out'});
 }
 function support(target,kind){
  point('combat-fx-aura '+kind,target,kind==='shield'?'⬡':kind==='heal'?'✚':'✧');
  if(kind==='heal')for(let i=0;i<4;i++){
   const p=point('combat-fx-mote',target,'✧');
   animate(p,[{translate:`${(i-1.5)*13}px 16px`,opacity:0},{opacity:1,offset:.3},{translate:`${(i-1.5)*19}px -45px`,opacity:0}],{duration:700,delay:220+i*35,fill:'both'});
  }
 }
 function particles(target,profile){
  for(let i=0;i<4;i++){
   const p=point('combat-fx-particle',target,profile.glyph),a=i*Math.PI/2;
   animate(p,[{translate:'0px 0px',opacity:0},{opacity:1,offset:.2},{translate:`${Math.cos(a)*36}px ${Math.sin(a)*30}px`,opacity:0}],{duration:460,delay:420,fill:'both'});
  }
 }
 return {center,point,connect,animate,impact,support,particles};
}
