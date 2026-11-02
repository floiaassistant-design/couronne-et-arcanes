// Familles de patches et provenance ; aucune règle ni statistique supplémentaire.
import {AUBE_EVOLUTIONS,AUBE_DESIGN_SOURCE} from './aube.js';
import {SYLVE_EVOLUTIONS,SYLVE_DESIGN_SOURCE} from './sylve.js';
import {OMBRE_EVOLUTIONS,OMBRE_DESIGN_SOURCE} from './ombre.js';
import {FORGE_EVOLUTIONS,FORGE_DESIGN_SOURCE} from './forge.js';
import {freezeCardData} from './schema.js';

export const EVOLUTION_FAMILIES=freezeCardData([
 {id:'aube',versions:AUBE_EVOLUTIONS,source:AUBE_DESIGN_SOURCE},
 {id:'sylve',versions:SYLVE_EVOLUTIONS,source:SYLVE_DESIGN_SOURCE},
 {id:'ombre',versions:OMBRE_EVOLUTIONS,source:OMBRE_DESIGN_SOURCE},
 {id:'forge',versions:FORGE_EVOLUTIONS,source:FORGE_DESIGN_SOURCE}
]);
export const evolutionFamily=id=>EVOLUTION_FAMILIES.find(f=>Object.hasOwn(f.versions,id))||null;
