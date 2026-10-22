// Indications transitoires depuis les événements du moteur : jamais de règles ni de sauvegarde.
export function createCombatFx(getState){
 let timer=null,token=0;
 const clean=()=>{if(typeof document!=='undefined')document.querySelectorAll('.combat-fx-chip').forEach(node=>node.remove());};
 function stopBattleFx(){
  token++;if(timer!==null)clearTimeout(timer);timer=null;clean();
 }
 function playBattleFx(events,onDone){
  stopBattleFx();
  if(typeof document==='undefined'||typeof window==='undefined'){onDone?.();return;}
  const state=getState(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const steps=(events||[]).filter(e=>['spawn','move','attack','spell','death','heal','poison','teleport','power','trap-trigger','trap-place','silence'].includes(e.type)).slice(0,28);
  if(!state.animationsEnabled||state.screen!=='battle'||reduced||!steps.length){onDone?.();return;}
  const key=token;let cursor=0;
  function next(){
   if(key!==token)return;
   clean();
   if(cursor>=steps.length){timer=null;onDone?.();return;}
   const event=steps[cursor++];
   const col=event.to??event.col??event.from;
   const cell=document.querySelector(`.battle-cell[data-lane="${event.lane}"][data-col="${col}"]`)
    ||document.querySelector(`.battle-cell[data-lane="${event.lane}"][data-col="${event.from}"]`);
   if(cell){
    const chip=document.createElement('span');
    chip.className='combat-fx-chip fx-'+event.type;
    chip.setAttribute('aria-hidden','true');
    chip.textContent=event.type==='attack'?'⚔':event.type==='move'?'➜':event.type==='spawn'?'✦':
     event.type==='death'?'✕':event.type==='heal'?'✚':event.type==='poison'?'☣':
     event.type==='trap-trigger'?'⌁':event.icon||'✧';
    cell.appendChild(chip);
   }
   timer=setTimeout(next,event.type==='attack'||event.type==='spell'?310:250);
  }
  next();
 }
 return {stopBattleFx,playBattleFx};
}
