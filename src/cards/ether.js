// Éther : statistiques validées, capacités natives conservées.
// Feu follet et nouveaux pouvoirs restent des tranches distinctes.
import {freezeCardData} from './schema.js';

export const ETHER_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-02T16:09:01.799Z'
});
export const ETHER_EVOLUTIONS=freezeCardData({
 mystic:{'épique':{stats:{hp:6}},'légendaire':{stats:{attack:4}}},
 elemental:{'légendaire':{stats:{hp:10}}},
 griffin:{'légendaire':{stats:{hp:8}}},
 sentinel:{'épique':{stats:{hp:11}}},
 tempest:{'épique':{stats:{hp:8}},'légendaire':{stats:{attack:4}}},
 seer:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}}},
 aetherknight:{'légendaire':{stats:{hp:11}}},
 portal_walker:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}}}
});
