// Primitives HTML partagées : fonctions pures, sans DOM, moteur ou stockage.
export function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[ch]
  );
}
