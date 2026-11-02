// Ombre jusqu'à Légendaire, depuis les cellules validées du tableau maître.
// Le délai non chiffré de la Lame nocturne hérite du natif vérifié (1).
import {freezeCardData} from './schema.js';
export const OMBRE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-10-27T06:13:46.581Z'
});
export const OMBRE_EVOLUTIONS=freezeCardData({
 bone:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}},'légendaire':{stats:{hp:6}}},
 shade:{'épique':{stats:{hp:5}},'légendaire':{stats:{attack:4}}},
 crypt:{rare:{stats:{hp:9}},'épique':{stats:{attack:3}},'légendaire':{abilities:{funeralWatch:{amount:2,cap:2}}}},
 plague:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}}},
 banshee:{'légendaire':{stats:{hp:7}}},
 vampire:{'légendaire':{stats:{hp:8}}},
 graveknight:{'épique':{stats:{hp:10}},'légendaire':{stats:{attack:5}}},
 nightblade:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}},'légendaire':{stats:{hp:6}}},
 spectre:{'épique':{stats:{hp:6}},'légendaire':{stats:{attack:4}}},
 mist_inquisitor:{'épique':{stats:{hp:8}},'légendaire':{stats:{attack:3}}}
});
