// Sprites originaux dessinés sur une grille de pixels, partagés par rôle.
// Les portraits de collection restent ceux du jeu ; aucun asset tiers.
const palettes={aube:['#dac58c','#798ea7'],sylve:['#a0cc99','#527e77'],ombre:['#c2a9da','#74658e'],forge:['#e3b58c','#9b746b'],ether:['#9ccbe0','#6273a6']};
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
function humanoid(tone,shade){
 return rect(10,7,5,5,'#e6d2b5')+rect(9,6,7,2,shade)+rect(9,12,7,7,tone)+
  rect(9,18,3,5,shade)+rect(13,18,3,5,shade)+rect(8,23,4,2,'#1d233c')+rect(13,23,4,2,'#1d233c')+
  rect(7,12,2,6,shade)+rect(16,12,2,6,shade)+rect(14,9,1,1,'#283249');
}
export function arenaSprite(card,role){
 const [tone,shade]=palettes[card?.faction]||palettes.ether;
 let body=humanoid(tone,shade);
 if(role==='fighter')body+=rect(19,5,1,14,'#c8d9dc')+rect(17,16,5,1,'#ebcd90')+rect(4,12,3,7,shade)+rect(5,13,1,4,tone);
 if(role==='ranged')body+=rect(9,5,7,2,tone)+rect(7,7,2,3,tone)+rect(20,8,1,14,'#bb9874')+rect(18,10,2,2,'#bb9874')+rect(18,18,2,2,'#bb9874')+rect(18,12,1,6,'#e5d7bd')+rect(15,15,7,1,'#e5d7bd');
 if(role==='heavy')body=rect(8,5,9,5,shade)+rect(9,7,7,1,'#cedcdb')+rect(5,11,15,8,shade)+rect(7,12,11,6,tone)+rect(10,14,5,2,'#89d9dc')+rect(7,19,5,5,shade)+rect(14,19,5,5,shade)+rect(4,24,8,2,'#242b3d')+rect(14,24,7,2,'#242b3d')+rect(3,12,2,8,tone)+rect(20,12,2,8,tone);
 if(role==='caster'||role==='support')body=rect(8,4,9,3,shade)+rect(10,2,5,3,shade)+rect(10,7,5,5,'#e6d2b5')+rect(9,12,7,8,shade)+rect(7,20,11,4,shade)+rect(6,24,13,2,tone)+rect(11,13,2,10,tone)+rect(20,5,1,20,'#ac9a86')+rect(19,3,3,3,role==='support'?'#ebdf9c':'#b9c4fa')+rect(18,4,5,1,role==='support'?'#ebdf9c':'#b9c4fa')+rect(14,9,1,1,'#283249');
 if(role==='undead')body=rect(9,6,8,7,'#d4d6c3')+rect(10,9,2,2,'#43465a')+rect(14,9,2,2,'#43465a')+rect(11,12,4,1,shade)+rect(9,14,8,8,shade)+rect(11,15,4,1,tone)+rect(11,18,4,1,tone)+rect(8,22,4,4,'#c2c7bd')+rect(15,22,4,4,'#c2c7bd')+rect(5,14,3,6,shade)+rect(19,12,2,13,'#a9c5c9');
 if(role==='beast')body=rect(4,13,16,8,shade)+rect(17,10,6,8,tone)+rect(18,7,2,4,shade)+rect(22,13,3,3,tone)+rect(21,11,1,1,'#f7e4a0')+rect(5,20,3,6,shade)+rect(15,20,3,6,shade)+rect(1,10,3,7,tone)+rect(6,13,9,2,tone);
 if(role==='flying')body=rect(11,12,7,9,shade)+rect(13,8,7,6,tone)+rect(19,10,5,2,'#e2c58d')+rect(17,9,1,1,'#172639')+rect(2,4,4,6,tone)+rect(5,7,4,7,tone)+rect(8,10,4,8,tone)+rect(18,16,4,3,shade)+rect(21,18,3,3,shade)+rect(11,22,2,3,'#d5b98e')+rect(16,22,2,3,'#d5b98e');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="28" viewBox="0 0 26 28" shape-rendering="crispEdges">${body}</svg>`;
 return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
export function arenaBackdrop(){
 // Ruines d'Astravelle : silhouettes à angles droits, ciel indigo et petite lune.
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="200" viewBox="0 0 960 200" shape-rendering="crispEdges"><path fill="#161d36" d="M0 120H40V100H60V80H80V60H100V80H120V100H140V120H170V100H190V80H220V100H240V120H280V100H300V70H330V100H350V120H400V100H420V80H450V60H480V80H500V100H530V120H590V90H620V60H650V90H680V120H720V90H760V60H800V90H830V120H870V100H900V120H960V200H0Z"/><path fill="#27304b" d="M0 170H70V140H100V100H110V90H120V100H130V140H160V170H200V120H212V108H224V120H234V170H300V150H340V170H440V140H480V100H490V80H502V100H514V140H550V170H640V150H700V170H760V130H790V90H800V70H812V90H822V130H850V170H920V150H960V200H0Z"/><path fill="#35415a" d="M93 168V135H111V120H126V135H142V168ZM770 170V145H791V119H813V145H834V170Z"/><path fill="#d9cea0" d="M700 15H724V21H730V39H724V45H700V39H694V21H700Z"/><path fill="#26314e" d="M717 15H725V21H731V40H720V35H716V23H717Z"/><g fill="#b1c6cc"><path d="M110 20h3v3h-3zM260 39h3v3h-3zM407 19h3v3h-3zM553 55h3v3h-3zM840 38h3v3h-3zM909 69h3v3h-3z"/></g></svg>`;
 return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
