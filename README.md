# Famidle

Jeu **idle / incremental** (Vue 3 + TypeScript + Pinia) orienté **contenu data-driven** : les activités, améliorations, événements et pièces sont principalement décrits dans `src/data/**`, puis exécutés par des moteurs “purs” (`src/engines/**`) et orchestrés par des stores Pinia (`src/stores/**`).

> Ce dépôt sert aussi de **portfolio technique** : architecture, persistance robuste, moteur de simulation, et UI réactive soignée.

---

## Pourquoi ce projet est intéressant (compétences mises en avant)

- **Architecture data-driven** : ajout de contenu via déclarations (coûts, conditions, effets) plutôt que du code impératif dispersé.
- **Moteur de simulation “single timeline”** : un temps sim unique (pause / vitesse / cooldowns / constructions) piloté par `ClockEngine`.
- **Engines testables** : logique isolée via fonctions pures + injection de dépendances (`deps`) au lieu d’accès directs aux stores.
- **Persistance “catalog merge”** : chargement de sauvegarde qui fusionne la progression avec les définitions data actuelles (évite de recommencer une partie après un patch de contenu).
- **UX de progression** : chaînes de déblocage par **flags / counters**, logs typés avec horodatage, UI claire (catégories, tooltips, “Acquis”…).

---

## Fonctionnalités clés (vertical slice actuel)

- **Ère 1 → Ère 2** : progression narrative + montée en complexité.
- **Activités** : instantanées et “timed” (boucle, arrêt au second clic, coûts jauges).
- **Maison (monument) multi-pièces** : réparation tuile par tuile, coûts par tuile, events “once” à la fin d’une pièce.
- **Économie** :
  - ressources **a répétition** : bois / pierre / tissu
  - ressources **instantanée** : eau / fibre / verre / cristaux
- **Améliorations** : achat + build time, effets one-shot et passifs (ex. bonus de plafond ressources/jauges).
- **Journal / logs** : entrées structurées, horodatage temps sim, catégories (récit / déblocage / action / système).

---

## Stack

- **Vue 3** + **TypeScript**
- **Pinia**
- **Vite**
- **Tailwind CSS**

---

## Démarrer en local

```bash
npm install
npm run dev
```

Qualité :

```bash
npm run type-check
npm run build
```

---

## Ce qui est visé

Ce projet démontre ma capacité à :

- concevoir une **architecture scalable** pour un jeu à contenu évolutif,
- écrire du code TypeScript **structuré, testable et maintenable** (séparation data/engine/store/UI),
- gérer la **complexité produit** (progression, déblocages, équilibre),
- livrer une **expérience utilisateur** cohérente (tooltips, logs, feedback, ergonomie),
- maintenir une base robuste grâce à une **persistance résiliente**.
