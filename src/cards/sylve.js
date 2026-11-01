// Sylve complète, depuis les cases validées du tableau maître.
// Les totaux remplacent la base ; chaque amélioration remplace ses paramètres.
import {freezeCardData} from './schema.js';

export const SYLVE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-10-27T06:13:46.581Z'
});
export const SYLVE_EVOLUTIONS=freezeCardData({
 ranger:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}},'légendaire':{geometry:{range:3}},
  divine:{abilities:{entangle:{frequency:'invocation'}}},'éveillée':{abilities:{entangle:{frequency:'period',period:3}}}},
 wolf:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}},'légendaire':{abilities:{charge:{amount:3}}},
  divine:{abilities:{pierce:{ignoreArmor:true,condition:'charged'}}},'éveillée':{geometry:{steps:3}}},
 treant:{'épique':{stats:{hp:12}},'légendaire':{abilities:{armor:{amount:3}}},
  divine:{abilities:{guard:{scope:'line'}}},'éveillée':{abilities:{guard:{scope:'all-lines'}}}},
 dryad:{'épique':{stats:{hp:7}},'légendaire':{abilities:{regeneration:{amount:1,resolutions:1}}},
  divine:{abilities:{regeneration:{resolutions:2}}},'éveillée':{abilities:{heal:{amount:3}}}},
 stag:{'légendaire':{stats:{hp:8}},
  divine:{abilities:{chargeBarrier:{amount:2,cap:2,allies:0}}},'éveillée':{abilities:{chargeBarrier:{allies:1}}}},
 thorn:{rare:{stats:{hp:6}},'épique':{stats:{attack:3}},'légendaire':{abilities:{poison:{resolutions:3}}},
  divine:{abilities:{poison:{amount:2,sourceBound:true}}},'éveillée':{abilities:{contagion:{amount:2,resolutions:2}}}},
 pixie:{rare:{stats:{hp:4}},'épique':{abilities:{ward:{amount:5}}},'légendaire':{abilities:{arrivalBarrier:{amount:2,cap:2,scope:'line',includeSelf:false,targets:1}}},
  divine:{abilities:{deathWard:{amount:2,cap:20}}},'éveillée':{abilities:{deathWard:{amount:4}}}},
 bear:{'épique':{stats:{hp:11}},'légendaire':{stats:{attack:5}},
  divine:{abilities:{fury:{amount:2}}},'éveillée':{abilities:{fury:{amount:3},furyBarrier:{amount:2,cap:2}}}},
 archdruid:{'légendaire':{stats:{hp:9}},
  divine:{abilities:{purify:{poison:true}}},'éveillée':{abilities:{heal:{amount:3},purify:{movement:true}}}},
 owl:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}},'légendaire':{abilities:{harass:{amount:1,attacks:1}}},
  divine:{abilities:{harass:{amount:2}}},'éveillée':{abilities:{harass:{attacks:2}}}},
 sylvan_trapper:{rare:{stats:{hp:6}},'épique':{stats:{attack:3}},'légendaire':{abilities:{trapper:{damage:2}}},
  divine:{abilities:{trapper:{poison:{amount:1,resolutions:2}}}},'éveillée':{abilities:{trapper:{period:2}}}}
});
