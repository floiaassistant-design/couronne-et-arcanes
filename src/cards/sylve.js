// Première tranche Sylve : les quinze évolutions Rare/Épique validées dans Notion.
// Les totaux remplacent la base ; les 33 rangs supérieurs attendent leur moteur.
import {freezeCardData} from './schema.js';

export const SYLVE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-10-27T06:13:46.581Z'
});
export const SYLVE_EVOLUTIONS=freezeCardData({
 ranger:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}}},
 wolf:{rare:{stats:{hp:4}},'épique':{stats:{attack:4}}},
 treant:{'épique':{stats:{hp:12}}},
 dryad:{'épique':{stats:{hp:7}}},
 thorn:{rare:{stats:{hp:6}},'épique':{stats:{attack:3}}},
 pixie:{rare:{stats:{hp:4}},'épique':{abilities:{ward:{amount:5}}}},
 bear:{'épique':{stats:{hp:11}}},
 owl:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}}},
 sylvan_trapper:{rare:{stats:{hp:6}},'épique':{stats:{attack:3}}}
});
