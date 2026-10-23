// Lecteur DOM des événements publics. Le résultat est déjà calculé et sauvegardé.
export function createCombatFx(getState){
 let timer=null,token=0,playing=false,speed=1,finish=null,layer=null;
 const animations=[];
 const root=()=>document.querySelector('.combat-screen');
 function clean(){
  layer?.remove();layer=null;animations.splice(0).forEach(a=>a.cancel());
  document.querySelectorAll('.fx-source,.fx-target').forEach(n=>n.classList.remove('fx-source','fx-target'));
 }
 function lock(value){
  root()?.classList.toggle('combat-playing',value);
  document.querySelectorAll('[data-action="select-card"],[data-action="end-turn"],[data-action="hero-power"]').forEach(n=>{
   if(value){if(!n.hasAttribute('data-fx-disabled'))n.dataset.fxDisabled=String(n.disabled);n.disabled=true;}
   else if(n.hasAttribute('data-fx-disabled')){n.disabled=n.dataset.fxDisabled==='true';delete n.dataset.fxDisabled;}
  });
  syncFxControls();
 }
 function syncFxControls(){
  if(typeof document==='undefined')return;
  const pace=document.querySelector('[data-action="fx-speed"]'),skip=document.querySelector('[data-action="fx-skip"]');
  if(pace){pace.textContent='×'+speed;pace.setAttribute('aria-label','Vitesse de lecture ×'+speed+' ; changer la vitesse');}
  if(skip)skip.hidden=!playing;
 }
 function stopBattleFx(){
  token++;if(timer!==null)clearTimeout(timer);timer=null;finish=null;playing=false;
  if(typeof document!=='undefined'){clean();lock(false);}
 }
 function skipBattleFx(){finish?.();}
 function changeFxSpeed(){speed=speed===1?2:1;syncFxControls();}
 function cell(lane,col){return document.querySelector(`.battle-cell[data-lane="${lane}"][data-col="${col}"]`);}
 function anchor(lane,col,side){
  const tile=cell(lane,col);
  if(tile)return tile.querySelector('.board-card')||tile;
  const row=document.querySelector(`.battle-cell[data-lane="${lane}"]`)?.closest('.lane-row');
  return row?.querySelector('.lane-gate'+(col===0?':not(.enemy)':'.enemy'))
   ||document.querySelector('.fighter'+(side==='p'?':not(.enemy)':'.enemy'));
 }
 function center(n){const r=n?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null;}
 function element(cls,text){const n=document.createElement('span');n.className=cls;if(text)n.textContent=text;layer.appendChild(n);return n;}
 function point(cls,n,text){const p=center(n);if(!p)return;const mark=element(cls,text);mark.style.left=p.x+'px';mark.style.top=p.y+'px';return mark;}
 function connect(source,target,kind){
  const a=center(source),b=center(target);if(!a||!b)return;
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<2)return;
  const trail=element('combat-fx-path '+kind);trail.style.left=a.x+'px';trail.style.top=a.y+'px';
  trail.style.width=length+'px';trail.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  const projectile=element('combat-fx-projectile '+kind);projectile.style.left=a.x+'px';projectile.style.top=a.y+'px';projectile.style.rotate=Math.atan2(dy,dx)+'rad';
  animations.push(projectile.animate([{translate:'0px 0px',opacity:1},{translate:`${dx}px ${dy}px`,opacity:1}],{duration:300/speed,fill:'forwards',easing:'ease-in'}));
 }
 function revealAction(e){
  const grid=document.querySelector('.battle-grid'),n=anchor(e.lane,e.to??e.col,e.side),source=anchor(e.fromLane??e.lane,e.from,e.side);
  if(!grid||!n||!grid.contains(n))return;
  const r=grid.getBoundingClientRect(),b=n.getBoundingClientRect(),a=source?.getBoundingClientRect();
  const left=a?Math.min(a.left,b.left):b.left,right=a?Math.max(a.right,b.right):b.right;
  const center=right-left<r.width-40?(left+right)/2:(b.left+b.right)/2;
  if(left<r.left+12||right>r.right-12)grid.scrollLeft+=center-(r.left+r.right)/2;
 }
 function animateStep(step){
  clean();layer=document.createElement('div');layer.className='combat-fx-layer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);
  const e=step,side=e.side==='e'?'e':'p';layer.dataset.side=side;
  layer.style.setProperty('--impact-delay',240/speed+'ms');layer.style.setProperty('--impact-duration',500/speed+'ms');layer.style.setProperty('--number-duration',580/speed+'ms');
  const source=anchor(e.fromLane??e.lane,e.from??e.col,side),target=e.type==='hero-damage'?anchor(null,null,side):anchor(e.lane,e.to??e.col,side);
  if(['attack','spell','power','move','teleport'].includes(e.type)){
   source?.classList.add('fx-source');target?.classList.add('fx-target');
   connect(source,target,e.type==='move'||e.type==='teleport'?'travel':e.magic||e.type!=='attack'?'magic':e.ranged?'ranged':'melee');
   if(e.type==='attack')point('combat-fx-impact '+(e.ranged?'ranged':e.magic?'magic':'melee'),target,e.riposte?'↶':e.charged?'⚡':'✧');
   if((e.type==='move'||e.type==='teleport')&&source?.classList.contains('board-card')){
    const a=center(source),b=center(target);
    if(a&&b)animations.push(source.animate([{translate:'0px 0px'},{translate:`${b.x-a.x}px ${b.y-a.y}px`}],{duration:420/speed,fill:'forwards',easing:'ease-in-out'}));
   }
  }else{
   target?.classList.add('fx-target');
   if(e.type==='death'){
    point('combat-fx-impact defeated',target,'✕');
    if(target)animations.push(target.animate([{opacity:1,filter:'grayscale(0)'},{opacity:0,filter:'grayscale(1)'}],{duration:420/speed,fill:'forwards'}));
   }else if(!step.changes.length)point('combat-fx-tag',target,({spawn:'DÉPLOIEMENT',silence:'SILENCE',poison:'POISON','trap-trigger':'PIÈGE','trap-place':'PIÈGE ARMÉ','trap-expire':'EXPIRÉ',damage:'ABSORBÉ','hero-damage':'ABSORBÉ'})[e.type]||'✦');
  }
  for(const c of step.changes){
   const n=c.hero?anchor(null,null,c.side):anchor(c.lane,c.col,c.side);
   n?.classList.add('fx-target');
   const value=[c.hp?(c.hp>0?'+':'−')+Math.abs(c.hp)+' PV':'',c.shield?(c.shield>0?'+':'−')+Math.abs(c.shield)+' ⬡':''].filter(Boolean).join(' · ');
   point('combat-fx-number '+(c.hp>0||c.shield>0?'healing':'damage'),n,value);
  }
 }
 function readout(phase,label){
  const p=document.querySelector('.combat-phase'),a=document.querySelector('.combat-action');
  if(p)p.textContent=phase;if(a)a.textContent=label;
 }
 function playBattleFx(steps,onDone,{before,onFrame,phase='Résolution'}={}){
  stopBattleFx();
  if(typeof document==='undefined'||typeof window==='undefined'){onDone?.();return;}
  const state=getState(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(!state.animationsEnabled||state.screen!=='battle'||reduced||!steps.length){onDone?.();return;}
  const key=token;let cursor=0;
  playing=true;
  finish=()=>{
   if(key!==token)return;
   const done=onDone;stopBattleFx();done?.();
  };
  if(before)onFrame?.(before);lock(true);
  function next(){
   if(key!==token)return;
   if(cursor>=steps.length){finish?.();return;}
   const step=steps[cursor++];
   // Invoquer avant le halo ; conserver les autres cartes jusqu'à leur impact.
   if(step.type==='spawn'){onFrame?.(step.frame);lock(true);}
   revealAction(step);readout(`${phase} · ${cursor}/${steps.length}`,step.label);animateStep(step);
   const duration=step.changes.length?1000:step.type==='attack'||step.type==='spell'?850:step.type==='death'?550:step.type==='state'?450:620;
   timer=setTimeout(()=>{
    if(key!==token)return;clean();onFrame?.(step.frame);lock(true);next();
   },duration/speed);
  }
  next();
 }
 return {stopBattleFx,playBattleFx,skipBattleFx,changeFxSpeed,syncFxControls,isBattleFxPlaying:()=>playing};
}
