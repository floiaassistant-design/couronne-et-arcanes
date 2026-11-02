// Première tranche Forge : données validées, sans retouche des versions natives.
import {freezeCardData} from './schema.js';

export const FORGE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-02T16:09:01.799Z'
});
export const FORGE_EVOLUTIONS=freezeCardData({
 smith:{rare:{stats:{hp:8}},'épique':{stats:{attack:4}}},
 golem:{'épique':{stats:{hp:14}}},
 bomb:{'épique':{stats:{hp:5}}},
 drill:{rare:{stats:{hp:7}},'épique':{stats:{attack:3}}},
 mechanist:{'épique':{stats:{hp:10}}},
 ironwraith:{rare:{stats:{hp:9}},'épique':{stats:{attack:3}}},
 alchemist:{'épique':{stats:{hp:7}}}
});
