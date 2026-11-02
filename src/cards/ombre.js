// Ombre complète, depuis les cellules validées du tableau maître.
// Le délai non chiffré de la Lame nocturne hérite du natif vérifié (1).
import {freezeCardData} from './schema.js';
export const OMBRE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-02T15:29:46.385Z'
});
export const OMBRE_EVOLUTIONS=freezeCardData({
 bone:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}},'légendaire':{stats:{hp:6}},
  divine:{abilities:{deathStrike:{amount:2,range:1}}},'éveillée':{abilities:{deathStrike:{amount:3,range:2,entangle:true}}}},
 shade:{'épique':{stats:{hp:5}},'légendaire':{stats:{attack:4}},
  divine:{abilities:{devour:{heal:2}}},'éveillée':{abilities:{devour:{heal:3,attack:1,cap:2}}}},
 crypt:{rare:{stats:{hp:9}},'épique':{stats:{attack:3}},'légendaire':{abilities:{funeralWatch:{amount:2,cap:2}}},
  divine:{abilities:{guard:{scope:'line'}}},'éveillée':{abilities:{guard:{scope:'all-lines'}}}},
 plague:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}},
  divine:{abilities:{poison:{resolutions:3}}},'éveillée':{abilities:{poison:{sourceBound:true},contagion:{amount:1,resolutions:2,maxDistance:2,trigger:'poison-death',frequency:'victim'}}}},
 lich:{divine:{abilities:{splash:{amount:3,targets:1,onGuard:true,requiresAttack:true}}},'éveillée':{abilities:{splash:{targets:2}}}},
 banshee:{'légendaire':{stats:{hp:7}},
  divine:{abilities:{harass:{amount:1,attacks:1,minimum:1,period:3}}},'éveillée':{abilities:{harass:{amount:2,secondary:{amount:1,range:1,targets:1}}}}},
 vampire:{'légendaire':{stats:{hp:8}},
  divine:{abilities:{lifesteal:{amount:3}}},'éveillée':{abilities:{strikeHeal:{amount:2}}}},
 graveknight:{'épique':{stats:{hp:10}},'légendaire':{stats:{attack:5}},
  divine:{abilities:{armor:{amount:3}}},'éveillée':{abilities:{charge:{amount:3},chargeBarrier:{amount:2,cap:2,requiresKill:true,frequency:'round'}}}},
 nightblade:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}},'légendaire':{stats:{hp:6}},
  divine:{abilities:{execution:{amount:2}}},'éveillée':{abilities:{execution:{amount:3,killHaste:2}}}},
 spectre:{'épique':{stats:{hp:6}},'légendaire':{stats:{attack:4}},
  divine:{abilities:{pierce:{ignoreArmor:true,minMovedCells:2}}},'éveillée':{geometry:{steps:3},abilities:{traverseAlly:{max:1}}}},
 mist_inquisitor:{'épique':{stats:{hp:8}},'légendaire':{stats:{attack:3}},
  divine:{abilities:{silence:{resolutions:2}}},'éveillée':{abilities:{silence:{targets:2}}}}
});
