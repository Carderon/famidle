/**
 * Flavour progressif pour une action à usage limité (ex. fouilles).
 * En dessous de 10 % du max : chaîne vide → le caller garde le flavour par défaut.
 */
export function limitedUseFlavour(uses: number, max: number): string {
  if (max <= 0 || uses <= 0) return ''

  const ratio = uses / max

  if (ratio >= 0.65) return 'Il ne reste plus grand chose'
  if (ratio >= 0.25) return 'Ça semble à moitié vide, ou à moitié plein'
  if (ratio >= 0.1) return "C'est déjà entamé"

  return ''
}
