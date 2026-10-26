// Transcription du tableau maître, édition observée le 26/10/2026 à 07:46:27.447Z.
// Les chiffres remplacent les valeurs de base ; ce ne sont jamais des bonus à additionner.
import {freezeCardData} from './schema.js';

export const AUBE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-10-26T07:46:27.447Z'
});

export const AUBE_EVOLUTIONS=freezeCardData({
 militia:{
  rare:{abilities:{firstHitReduction:{amount:1,frequency:'invocation'}}},
  'épique':{abilities:{firstHitReduction:{amount:2}}},
  'légendaire':{stats:{hp:8}},
  divine:{abilities:{firstHitReduction:{amount:3},riposte:{damageMode:'effective-attack',frequency:'invocation',trigger:'melee-attack'}}},
  'éveillée':{abilities:{lastStand:{hp:5,frequency:'invocation'}}}
 },
 shield:{
  rare:{stats:{hp:11},abilities:{guard:{scope:'positioned',unitTargetPriority:false},riposte:{damageMode:'effective-attack'}},pendingDecisions:['guard-priority','guard-frequency']},
  'épique':{stats:{attack:2}},
  'légendaire':{stats:{hp:13}},
  divine:{abilities:{guard:{scope:'line',unitTargetPriority:false}}},
  'éveillée':{abilities:{guard:{scope:'all-lines'}}}
 },
 archer:{
  rare:{stats:{hp:4}},
  'épique':{stats:{attack:3}},
  'légendaire':{geometry:{range:3}},
  divine:{abilities:{pierce:{target:'primary',ignoreArmor:true}}},
  'éveillée':{abilities:{rearShot:{amount:2,target:'enemy-immediately-behind-primary',ignoreArmor:false}}}
 },
 cleric:{
  'épique':{stats:{hp:6}},
  'légendaire':{abilities:{heal:{amount:3}}},
  divine:{abilities:{heal:{targets:2}}},
  'éveillée':{abilities:{heal:{scope:'all-lines'}}}
 },
 paladin:{
  'légendaire':{stats:{hp:11},abilities:{riposte:{damageMode:'effective-attack'}}},
  divine:{abilities:{armor:{amount:3}}},
  'éveillée':{stats:{hp:13},abilities:{riposteBarrier:{amount:2,cap:2,frequency:'round',target:'self',trigger:'authorized-riposte'}}}
 },
 banner:{
  'épique':{stats:{hp:8}},
  'légendaire':{abilities:{inspire:{targets:2}}},
  divine:{abilities:{inspire:{amount:2}}},
  'éveillée':{abilities:{inspire:{scope:'all-lines'}}}
 },
 scoutcaptain:{
  'épique':{stats:{hp:8}},
  'légendaire':{stats:{attack:4}},
  divine:{abilities:{inspire:{period:2}}},
  'éveillée':{abilities:{arrivalInspire:{amount:1,targets:1,scope:'line',includeSelf:false,cap:12,timing:'spawn'}}}
 },
 sunpriest:{
  'épique':{stats:{hp:9}},
  'légendaire':{abilities:{heal:{amount:3}}},
  divine:{abilities:{healBarrier:{amount:1,cap:2,target:'healed-unit',trigger:'effective-heal'}}},
  'éveillée':{abilities:{healBarrier:{amount:2}}}
 },
 lancer:{
  rare:{stats:{hp:6}},
  'épique':{stats:{attack:4}},
  'légendaire':{stats:{hp:8}},
  divine:{abilities:{charge:{amount:3}}},
  'éveillée':{geometry:{steps:2},abilities:{haste:{}}}
 },
 dawnbastion:{
  divine:{abilities:{riposte:{damageMode:'effective-attack'},intervention:{amount:4,range:2,targets:1,scope:'line',direction:'forward',timing:'spawn',ignoreArmor:false}}},
  'éveillée':{stats:{attack:7}}
 }
});
