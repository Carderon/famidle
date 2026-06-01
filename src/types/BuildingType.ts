/**
 * Bâtiments de **production** (onglet Production, moteur dédié) — distinct des **monuments**
 * (`MonumentType`) à reconstruire case par case.
 *
 * `BuildingType` reste le stub du registre de contenu (`gameContent.buildings`).
 */
export interface Building {
  id: string
  name: string
  /** Texte de ligne (ex. débit, niveau) — optionnel. */
  detail?: string
}

export type BuildingType = {}
