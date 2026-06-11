import { AGE1_SCAVENGE_MAX_USES } from '@/data/activities/age1'

/** Rattrape le flag d’épuisement si le compteur fouille est déjà au max. */
export function reconcileAge1ScavengeFlags(
  flags: Record<string, boolean>,
  counters: Record<string, number>,
): Record<string, boolean> {
  const uses = counters['age1.counter.scavengeUses'] ?? 0
  if (uses < AGE1_SCAVENGE_MAX_USES) return flags
  return { ...flags, 'age1.flag.scavengeDepleted': true }
}

export function scavengeOnceFiredIdsForCounter(counters: Record<string, number>): string[] {
  const uses = counters['age1.counter.scavengeUses'] ?? 0
  if (uses < AGE1_SCAVENGE_MAX_USES) return []
  return ['age1.event.scavengeDepleted']
}
