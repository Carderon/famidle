import { AGE2_ROOMS_COMPLETE_COUNTER } from '@/data/events/age2/index'

/** Flags posés par les events « pièce terminée » (ère 2). */
export const AGE2_ROOM_COMPLETE_FLAGS = [
  'age2.flag.gardenComplete',
  'age2.flag.bathroomComplete',
  'age2.flag.kitchenComplete',
  'age2.flag.workshopComplete',
  'age2.flag.libraryComplete',
  'age2.flag.laboratoryComplete',
] as const

export function countEra2RoomsCompleteFromFlags(flags: Record<string, boolean>): number {
  return AGE2_ROOM_COMPLETE_FLAGS.filter((flag) => flags[flag] === true).length
}

/**
 * Sauvegardes antérieures à `era2RoomsComplete` : le compteur peut manquer
 * alors que les flags pièce sont déjà à `true`. On rattrape le minimum cohérent.
 */
export function reconcileEra2RoomsCounter(
  flags: Record<string, boolean>,
  counters: Record<string, number>,
): Record<string, number> {
  const expected = countEra2RoomsCompleteFromFlags(flags)
  const current = counters[AGE2_ROOMS_COMPLETE_COUNTER] ?? 0
  if (expected <= current) return counters
  return { ...counters, [AGE2_ROOMS_COMPLETE_COUNTER]: expected }
}
