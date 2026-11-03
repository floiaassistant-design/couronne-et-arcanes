// Forge : Rares/Épiques, cinq Légendaires de statistiques et Ferraille récupérée ; natifs inchangés.
import {freezeCardData} from './schema.js';

export const FORGE_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-02T16:09:01.799Z'
});
export const FORGE_EVOLUTIONS=freezeCardData({
 smith:{rare:{stats:{hp:8}},'épique':{stats:{attack:4}}},
 golem:{'épique':{stats:{hp:14}}},
 bomb:{'épique':{stats:{hp:5}},'légendaire':{stats:{attack:5}}},
 drill:{rare:{stats:{hp:7}},'épique':{stats:{attack:3}}},
 engineer:{'légendaire':{stats:{hp:9}}},
 cannon:{'légendaire':{stats:{hp:9}}},
 mechanist:{'épique':{stats:{hp:10}},'légendaire':{stats:{attack:3}}},
 ironwraith:{rare:{stats:{hp:9}},'épique':{stats:{attack:3}},'légendaire':{abilities:{strikeWard:{amount:2,cap:20,period:3,requiresKill:true}}}},
 alchemist:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}}}
});
