// Éther : évolutions validées ; les décisions natives restent distinctes.
import {freezeCardData} from './schema.js';

export const ETHER_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-04T09:02:46.815Z'
});
export const ETHER_EVOLUTIONS=freezeCardData({
 mystic:{'épique':{stats:{hp:6}},'légendaire':{stats:{attack:4}}},
 elemental:{'légendaire':{stats:{hp:10}}},
 griffin:{'légendaire':{stats:{hp:8}}},
 sentinel:{'épique':{stats:{hp:11}}},
 tempest:{'épique':{stats:{hp:8}},'légendaire':{stats:{attack:4}}},
 seer:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}},'légendaire':{abilities:{stillOmen:{amount:2,period:3,delay:1}}}},
 aetherknight:{'légendaire':{stats:{hp:11}}},
 portal_walker:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}}},
 spark:{rare:{stats:{hp:4},geometry:{range:3}},'épique':{stats:{attack:3}},'légendaire':{abilities:{spectralRetreat:{cells:1,period:3}}}}
});
