import type { PendingImprovementBuild } from '@/types/ImprovementType'

/** Normalise les sauvegardes v1 (nombre seul) et le format courant (objet). */
export function parseImprovementPending(
  raw: Record<string, unknown> | undefined,
): Record<string, PendingImprovementBuild> {
  const out: Record<string, PendingImprovementBuild> = {}
  for (const [slug, val] of Object.entries(raw ?? {})) {
    if (typeof val === 'number') {
      out[slug] = { completeAt: val, refundCosts: [], costsPrepaid: false }
      continue
    }
    if (val && typeof val === 'object' && 'completeAt' in val) {
      const row = val as PendingImprovementBuild
      out[slug] = {
        completeAt: row.completeAt,
        refundCosts: Array.isArray(row.refundCosts) ? row.refundCosts.map((c) => ({ ...c })) : [],
        costsPrepaid: row.costsPrepaid === true,
      }
    }
  }
  return out
}
