import {createStudy,resolveStudy,studySteps,validStudy,STUDY_KEY} from './card-study-model.js';
import {renderStudy,describeCard} from './card-study-view.js';
import {createStudyFx} from './card-study-fx.js';
const $=s=>document.querySelector(s),media=matchMedia('(prefers-reduced-motion: reduce)'),fx=createStudyFx();
let battle=createStudy(),busy=false,automatic=false,generation=0,effects=true,timer;
try{const saved=JSON.parse(localStorage.getItem(STUDY_KEY));if(validStudy(saved))battle=saved;}catch{}
$('#formation').value=battle.studyPreset||'balanced';
function save(){try{localStorage.setItem(STUDY_KEY,JSON.stringify(battle));}catch{}}
function enabled(){return effects&&!media.matches;}
function controls(){
 $('#next').disabled=busy||battle.status!=='active';$('#next').textContent=busy?'Résolution…':'Tour suivant';
 $('#auto').textContent=automatic?'❚❚ Pause':'▶ Lancer le combat';$('#auto').setAttribute('aria-pressed',String(automatic));
 $('#toggle-fx').textContent=effects?(media.matches?'Effets : réduits':'Effets : activés'):'Effets : désactivés';$('#toggle-fx').setAttribute('aria-pressed',String(effects));
 document.body.dataset.effects=String(enabled());
}
function render(){renderStudy(battle);controls();}
function stop(){generation++;clearTimeout(timer);automatic=false;fx.stop();busy=false;render();}
async function turn(){
 if(busy||battle.status!=='active')return;
 busy=true;controls();const seq=++generation,result=resolveStudy(battle);save();
 if(enabled()){
  for(const step of studySteps(result)){
   if(seq!==generation||!enabled())break;
   if(step.event.label)$('#activity').textContent=step.event.label;
   await fx.play(step.event);
   if(seq!==generation)break;
   renderStudy(step.frame);
  }
 }
 if(seq!==generation)return;
 fx.stop();busy=false;render();
 $('#activity').textContent=battle.status!=='active'?$('#result').textContent:`Tour ${battle.round} · Les cartes se préparent`;
 if(automatic&&battle.status==='active')timer=setTimeout(turn,enabled()?950:400);
 else{automatic=false;controls();}
}
$('#next').addEventListener('click',turn);
$('#auto').addEventListener('click',()=>{
 if(automatic){stop();$('#activity').textContent='Combat en pause';return;}
 automatic=true;controls();if(!busy)turn();
});
$('#reset').addEventListener('click',()=>{stop();battle=createStudy($('#formation').value);save();render();$('#activity').textContent='Choisissez une carte pour lire sa capacité';});
$('#formation').addEventListener('change',()=>$('#reset').click());
$('#toggle-fx').addEventListener('click',()=>{effects=!effects;if(!enabled())stop();else controls();});
media.addEventListener('change',()=>{if(!enabled())stop();else controls();});
window.addEventListener('resize',()=>{if(busy)stop();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
document.addEventListener('click',e=>{const card=e.target.closest('[data-card]');if(card)$('#card-description').textContent=describeCard(card.dataset.card);});
render();
