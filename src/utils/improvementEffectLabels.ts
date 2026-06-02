import type { ImprovementEffectType } from '@/types/ImprovementType'

const GAUGE_LABELS: Record<string, string> = {
  health: 'vitalité',
  stamina: 'endurance',
}

/** Effets passifs affichables dans tooltips / panneau Acquis. */
const DISPLAYABLE_PASSIVE_KINDS = new Set<ImprovementEffectType['kind']>([
  'resourceRate',
  'resourceMaxBonus',
  'gaugeRate',
  'gaugeMaxBonus',
  'addResource',
])

export function isDisplayablePassiveEffect(effect: ImprovementEffectType): boolean {
  return DISPLAYABLE_PASSIVE_KINDS.has(effect.kind)
}

export function formatImprovementEffectLabel(
  effect: ImprovementEffectType,
  names: { resourceName?: (slug: string) => string | undefined } = {},
): string {
  const resourceName = (slug: string) =>
    names.resourceName?.(slug) ?? slug

  switch (effect.kind) {
    case 'resourceRate':
      return `${effect.amount >= 0 ? '+' : ''}${effect.amount} ${resourceName(effect.resourceSlug)}/s`
    case 'resourceMaxBonus':
      return `+${effect.amount} max ${resourceName(effect.resourceSlug)}`
    case 'gaugeRate':
      return `${effect.amount >= 0 ? '+' : ''}${effect.amount} ${GAUGE_LABELS[effect.gaugeSlug] ?? effect.gaugeSlug}/s`
    case 'gaugeMaxBonus':
      return `+${effect.amount} max ${GAUGE_LABELS[effect.gaugeSlug] ?? effect.gaugeSlug}`
    case 'addResource':
      return `+${effect.amount} ${resourceName(effect.resourceSlug)}`
    default:
      return ''
  }
}

/** Résumé des bonus lisibles pour le panneau Acquis (effets passifs uniquement). */
export function formatAcquiredImprovementBonus(
  effects: readonly ImprovementEffectType[] | undefined,
  names: { resourceName?: (slug: string) => string | undefined } = {},
): string {
  if (!effects?.length) return ''
  return effects
    .filter(isDisplayablePassiveEffect)
    .map((e) => formatImprovementEffectLabel(e, names))
    .filter((text) => text !== '')
    .join(' · ')
}
