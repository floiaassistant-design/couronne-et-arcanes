// Forge : évolutions validées, Ferraille récupérée et Foreuse d'acier ; natifs inchangés.
import {freezeCardData} from './schema.js';

export const FORGE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-02T16:09:01.799Z'
});
export const FORGE_EVOLUTIONS=freezeCardData({
 smith:{rare:{stats:{hp:8}},'épique':{stats:{attack:4}},'légendaire':{abilities:{knockback:{cells:1,period:3}}},
  divine:{abilities:{knockback:{follow:true}}},'éveillée':{abilities:{knockback:{blockedDamage:2}}}},
 golem:{'épique':{stats:{hp:14}},'légendaire':{abilities:{guardWard:{amount:1,cap:20,frequency:'round',interposedCrownThreat:true}}},
  divine:{abilities:{guard:{scope:'line'}}},'éveillée':{abilities:{guard:{scope:'all-lines'}}}},
 bomb:{'épique':{stats:{hp:5}},'légendaire':{stats:{attack:5}},
  divine:{abilities:{fracture:{amount:1,expiresAfter:1,primary:false}}},'éveillée':{abilities:{fracture:{amount:2,primary:true}}}},
 drill:{rare:{stats:{hp:7}},'épique':{stats:{attack:3}},'légendaire':{abilities:{barrierDrill:{amount:2,period:3}}},
  divine:{abilities:{barrierDrill:{amount:4}}},'éveillée':{abilities:{barrierDrill:{breakBarrier:{amount:2,cap:2}}}}},
 colossus:{divine:{abilities:{scoria:{hits:2,period:3,amount:2,cap:2}}},'éveillée':{abilities:{scoria:{amount:4,cap:4}}}},
 engineer:{'légendaire':{stats:{hp:9}},divine:{abilities:{calibration:{ignoreArmor:1,expiresAfter:1}}},
  'éveillée':{abilities:{calibration:{ignoreArmor:2,barrier:{amount:1,cap:1}}}}},
 cannon:{'légendaire':{stats:{hp:9}},divine:{abilities:{spotting:{amount:2,attacks:1,period:3,expiresAfter:2}}},
  'éveillée':{abilities:{spotting:{attacks:2}}}},
 mechanist:{'épique':{stats:{hp:10}},'légendaire':{stats:{attack:3}},
  divine:{abilities:{inspireArmor:{amount:1,expiresAfter:1}}},'éveillée':{abilities:{inspireArmor:{amount:2}}}},
 ironwraith:{rare:{stats:{hp:9}},'épique':{stats:{attack:3}},'légendaire':{abilities:{strikeWard:{amount:2,cap:20,period:3,requiresKill:true}}},
  divine:{abilities:{strikeWard:{requiresKill:false}}},'éveillée':{abilities:{strikeWard:{amount:3,overflowBarrier:{amount:2,cap:2}}}}},
 alchemist:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}},
  divine:{abilities:{poison:{sourceBound:true},catalysis:{amount:2,period:3}}},'éveillée':{abilities:{catalysis:{amount:4}}}}
});
