// Sylve jusqu'à Légendaire, depuis les cases validées du tableau maître.
// Les totaux remplacent la base ; les 22 rangs Divins/Éveillés attendent leur moteur.
import {freezeCardData} from './schema.js';

export const SYLVE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-10-27T06:13:46.581Z'
});
export const SYLVE_EVOLUTIONS=freezeCardData({
 ranger:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}},'légendaire':{geometry:{range:3}}},
 wolf:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}},'légendaire':{abilities:{charge:{amount:3}}}},
 treant:{'épique':{stats:{hp:12}},'légendaire':{abilities:{armor:{amount:3}}}},
 dryad:{'épique':{stats:{hp:7}},'légendaire':{abilities:{regeneration:{amount:1,resolutions:1}}}},
 stag:{'légendaire':{stats:{hp:8}}},
 thorn:{rare:{stats:{hp:6}},'épique':{stats:{attack:3}},'légendaire':{abilities:{poison:{resolutions:3}}}},
 pixie:{rare:{stats:{hp:4}},'épique':{abilities:{ward:{amount:5}}},'légendaire':{abilities:{arrivalBarrier:{amount:2,cap:2,scope:'line',includeSelf:false,targets:1}}}},
 bear:{'épique':{stats:{hp:11}},'légendaire':{stats:{attack:5}}},
 archdruid:{'légendaire':{stats:{hp:9}}},
 owl:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}},'légendaire':{abilities:{harass:{amount:1,attacks:1}}}},
 sylvan_trapper:{rare:{stats:{hp:6}},'épique':{stats:{attack:3}},'légendaire':{abilities:{trapper:{damage:2}}}}
});
