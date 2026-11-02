// Première tranche Ombre : les onze évolutions Rares/Épiques validées.
// Le délai non chiffré de la Lame nocturne hérite du natif vérifié (1).
import {freezeCardData} from './schema.js';
export const OMBRE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-10-27T06:13:46.581Z'
});
export const OMBRE_EVOLUTIONS=freezeCardData({
 bone:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}}},
 shade:{'épique':{stats:{hp:5}}},
 crypt:{rare:{stats:{hp:9}},'épique':{stats:{attack:3}}},
 plague:{'épique':{stats:{hp:7}}},
 graveknight:{'épique':{stats:{hp:10}}},
 nightblade:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}}},
 spectre:{'épique':{stats:{hp:6}}},
 mist_inquisitor:{'épique':{stats:{hp:8}}}
});
