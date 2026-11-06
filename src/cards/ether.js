// Éther : évolutions validées ; les décisions natives restent distinctes.
import {freezeCardData} from './schema.js';

export const ETHER_DESIGN_SOURCE=freezeCardData({
 url:'https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f',
 editedAt:'2026-11-04T09:02:46.815Z'
});
export const ETHER_EVOLUTIONS=freezeCardData({
 mystic:{'épique':{stats:{hp:6}},'légendaire':{stats:{attack:4}},'divine':{abilities:{retaliatoryOmen:{amount:2,period:3,expiresAfter:2}}},'éveillée':{abilities:{retaliatoryOmen:{amount:4}}}},
 elemental:{'légendaire':{stats:{hp:10}},'divine':{abilities:{splashHealingPenalty:{amount:2,duration:1,period:3}}},'éveillée':{abilities:{splashHealingPenalty:{amount:4}}}},
 griffin:{'légendaire':{stats:{hp:8}},'divine':{abilities:{flightWake:{cells:1,period:3,duration:1}}}},
 sentinel:{'épique':{stats:{hp:11}},'légendaire':{abilities:{guardPrism:{amount:1,minimum:1,period:3,expiresAfter:2}}},'divine':{abilities:{guard:{scope:'line'}}},'éveillée':{abilities:{guard:{scope:'all-lines'}}}},
 dragon:{'divine':{abilities:{splashKnockback:{cells:1,period:3}}}},
 tempest:{'épique':{stats:{hp:8}},'légendaire':{stats:{attack:4}},'divine':{abilities:{splashArc:{amount:2,period:3}}},'éveillée':{abilities:{splashArc:{amount:3}}}},
 seer:{rare:{stats:{hp:5}},'épique':{stats:{attack:3}},'légendaire':{abilities:{stillOmen:{amount:2,period:3,delay:1}}},'divine':{abilities:{stillOmen:{amount:3}}}},
 aetherknight:{'légendaire':{stats:{hp:11}},'divine':{abilities:{chargeAdvance:{cells:1,period:3}}}},
 seraph:{'divine':{abilities:{flightHeal:{amount:2,period:3}}}},
 portal_walker:{'épique':{stats:{hp:7}},'légendaire':{stats:{attack:4}},'divine':{abilities:{portalEcho:{range:1,expiresAfter:1}}}},
 spark:{rare:{stats:{hp:4},geometry:{range:3}},'épique':{stats:{attack:3}},'légendaire':{abilities:{spectralRetreat:{cells:1,period:3}}},'divine':{abilities:{retreatStrike:{amount:2,expiresAfter:2}}}}
});
