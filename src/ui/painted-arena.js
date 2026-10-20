// Projection graphique de l'illustration approuvée ; aucune règle du moteur.
import {cardArenaEnabled} from './card-arena.js';
export const PAINTED_ARENA = Object.freeze({
 width:1672,height:941,version:'celeste-peinte-v1',
 // Limites des quatre pistes relevées sur l'image originale, de haut en bas.
 rows:[344,421,509,605,716],
 left:[355,331,302,271,238],right:[1319,1341,1370,1400,1432],
 heroes:{p:{x:149,y:559,facing:'right'},e:{x:1522,y:559,facing:'left'}}
});

export function paintedTile(visual,col){
 if(!Number.isInteger(visual)||visual<0||visual>3||!Number.isInteger(col)||col<1||col>10)throw new RangeError('Case visuelle hors du plateau 4×10');
 const a=PAINTED_ARENA,y= a.rows[visual],height=a.rows[visual+1]-y;
 const topWidth=(a.right[visual]-a.left[visual])/10,bottomWidth=(a.right[visual+1]-a.left[visual+1])/10;
 const tl=a.left[visual]+(col-1)*topWidth+3,tr=tl+topWidth-6;
 const bl=a.left[visual+1]+(col-1)*bottomWidth+3,br=bl+bottomWidth-6;
 const left=Math.min(tl,bl),width=Math.max(tr,br)-left;
 const footY=y+height*.72,footX=(tl+tr)*.14+(bl+br)*.36;
 const percent=x=>((x-left)/width*100).toFixed(3)+'%';
 const polygon=`polygon(${percent(tl)} 2%,${percent(tr)} 2%,${percent(br)} 98%,${percent(bl)} 98%)`;
 return {left,top:y,width,height,footX,footY,polygon,
  style:`left:${left}px;top:${y}px;width:${width}px;height:${height}px;--tile-shape:${polygon};--foot-x:${percent(footX)};--foot-y:72%`};
}

export function paintedArena(lanes,renderCell){
 const a=PAINTED_ARENA;
 const rows=Array.from({length:4},(_,visual)=>{
  const lane=lanes===2?visual-1:visual,active=lane>=0&&lane<lanes;
  const mid=(a.rows[visual]+a.rows[visual+1])/2,left=(a.left[visual]+a.left[visual+1])/2,right=(a.right[visual]+a.right[visual+1])/2;
  const tiles=Array.from({length:10},(_,i)=>active?renderCell(lane,i+1,visual):`<div class="arena-dormant-cell" style="${paintedTile(visual,i+1).style}"></div>`).join('');
  return `<div class="${active?'lane-row arena-active-row':'arena-dormant-row'}" data-visual-lane="${visual}" ${active?'data-crown-col="11"':'aria-hidden="true"'}><div class="lane-label" style="left:${left-60}px;top:${mid-13}px">${['I','II','III','IV'][visual]}</div><div class="${active?'lane-gate':'arena-dormant-gate'}" style="left:${left-35}px;top:${mid-17}px" ${active?'aria-label="Votre couronne"':''}>♜</div>${tiles}<div class="${active?'lane-gate':'arena-dormant-gate'} enemy" style="left:${right+8}px;top:${mid-17}px" ${active?'aria-label="Couronne adverse"':''}>♛</div></div>`;
 }).join('');
 const heroes=Object.entries(a.heroes).map(([side,h])=>`<div class="arena-hero-slot" data-side="${side}" data-facing="${h.facing}" data-animation-state="idle" data-foot-x="${h.x}" data-foot-y="${h.y}" style="left:${h.x}px;top:${h.y}px" aria-hidden="true"><div class="arena-hero-actor"></div></div>`).join('');
 return `<div class="arena-painted-canvas"><div class="arena-painted-frame" data-art-version="${a.version}" data-render-mode="static"><div class="arena-calibrated-art" aria-hidden="true"></div>${rows}${heroes}</div></div>`;
}

export function paintedFootPoint(el){
 const frame=el.closest('.arena-painted-frame');
 if(!frame||!el.hasAttribute('data-foot-x'))return null;
 const box=frame.getBoundingClientRect();
 return {x:box.left+Number(el.dataset.footX)*box.width/PAINTED_ARENA.width,
  y:box.top+Number(el.dataset.footY)*box.height/PAINTED_ARENA.height,el};
}

let observer;
export function mountPaintedArena(){
 observer?.disconnect();observer=null;
 const grid=document.querySelector('.arena-painted');if(!grid)return;
 const canvas=grid.querySelector('.arena-painted-canvas'),frame=grid.querySelector('.arena-painted-frame');
 const fit=()=>{
  if(grid.closest('[data-card-layout="true"]')){
   // Le plan des pistes tient entre le HUD et la main, même avec quatre lignes.
   // Une seule transformation pour le décor, les cases et les points des VFX.
   const stage=grid.closest('.combat-stage'),dock=stage.querySelector('.combat-hand-dock');
   const hud=stage.querySelector('.battle-hud'),caption=stage.querySelector('.arena-caption');
   const box=grid.getBoundingClientRect();
   const first=PAINTED_ARENA.rows[0],last=PAINTED_ARENA.rows.at(-1);
   const top=Math.max(hud.getBoundingClientRect().bottom,caption.getBoundingClientRect().bottom)-box.top+12;
   const bottom=dock.getBoundingClientRect().top-box.top-14;
   const scale=Math.min(Math.max(grid.clientWidth/PAINTED_ARENA.width,grid.clientHeight/PAINTED_ARENA.height),Math.max(120,bottom-top)/(last-first));
   const width=PAINTED_ARENA.width*scale,height=PAINTED_ARENA.height*scale;
   const offset=Math.min(bottom-last*scale,Math.max(top-first*scale,(grid.clientHeight-height)/2));
   // Recadrer seulement les marges décoratives ; toutes les cases/couronnes restent accessibles.
   const trim=Math.min(Math.max(0,(width-grid.clientWidth)/2),(Math.min(...PAINTED_ARENA.left)-70)*scale);
   canvas.style.width=Math.max(width-2*trim,grid.clientWidth)+'px';canvas.style.height=grid.clientHeight+'px';canvas.style.marginTop='0px';
   frame.style.left=(Math.max(0,(grid.clientWidth-width)/2)-trim)+'px';frame.style.top=offset+'px';
   frame.style.transform=`scale(${scale})`;
  }else{
   const width=Math.max(cardArenaEnabled()?1280:960,Math.min(grid.clientWidth,grid.clientHeight*PAINTED_ARENA.width/PAINTED_ARENA.height));
   const scale=width/PAINTED_ARENA.width,height=PAINTED_ARENA.height*scale;
   canvas.style.width=width+'px';canvas.style.height=height+'px';canvas.style.marginTop=Math.max(0,(grid.clientHeight-height)/2)+'px';
   frame.style.transform=`scale(${scale})`;
  }
 };
 fit();observer=new ResizeObserver(fit);observer.observe(grid);
}
