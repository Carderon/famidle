import type { EventType } from '@/types/EventType'
import { AGE1_SCAVENGE_MAX_USES } from '@/data/activities/age1'

/**
 * Événements de l'âge 1.
 *
 * Contenu de démonstration utilisé pour valider la chaîne :
 *   ClockEngine → eventsSystem → eventEngine → (logStore | gameStateStore | resourceStore) → UI
 *
 * Démontre :
 * - les 3 kinds de triggers (`time`, `flag`, `counter`)
 * - les events passifs (`effects`)
 * - les events interactifs (`choices`) avec coûts payants
 * - les effets ressources (`addResource`)
 */
export const age1Events: EventType[] = [
  {
    id: 'age1.event.openingAmbiance',
    trigger: { kind: 'time', atSeconds: 1 },
    effects: [
      {
        kind: 'log',
        message:
          "Tu marches dans une forêt rouge, l'herbe est haute. Il vient de pleuvoir. La majeure partie du sang a été lavée. Il y a une ruine au loin, une cabane de bois. Tu y es déjà allé auparavant. Tu n'étais pas seul. Tu les connais, comme un souvenir de demain.",
      },
    ],
  },

  {
    id: 'age1.event.wakeUp',
    trigger: { kind: 'time', atSeconds: 2 },
    effects: [
      { kind: 'log', message: 'Tu te réveilles. Derrière, le néant.' },
      { kind: 'setFlag', flag: 'age1.flag.awake' },
      { kind: 'addResource', resourceSlug: 'age1.resource.wood', amount: 1 },
    ],
  },

  // Trigger flag + choices payants — réagit au flag posé par l'achat de firecamp
  {
    id: 'age1.event.firstNoise',
    title: 'Un bruit dans le couloir',
    description:
      'Un grincement résonne au bout du couloir. La maison n’est peut-être pas aussi vide que tu l’espérais.',
    trigger: { kind: 'flag', flag: 'ui.flag.activityShown' },
    effects: [{ kind: 'log', message: 'Un grincement résonne au bout du couloir.' }],
    choices: [
      {
        id: 'listen',
        label: 'Tendre l’oreille',
        description:
          'Rester immobile et essayer de comprendre d’où vient le bruit. Tu repères du petit bois utilisable.',
        effects: [
          {
            kind: 'log',
            message: 'Tu retiens ton souffle. Trois bouts de bois traînent à portée.',
          },
          { kind: 'addResource', resourceSlug: 'age1.resource.wood', amount: 3 },
          { kind: 'setFlag', flag: 'age1.flag.noiseInvestigated' },
        ],
      },
      {
        id: 'ignore',
        label: 'Ignorer',
        description: 'Tu as assez de problèmes pour l’instant.',
        effects: [
          { kind: 'log', message: 'Tu choisis de ne pas bouger. Le silence finit par revenir.' },
          { kind: 'setFlag', flag: 'age1.flag.noiseIgnored' },
        ],
      },
    ],
  },

  /** BRIEF : après 3 cases réparées — choix soin vitalité / endurance. */
  {
    id: 'age1.event.souvenir',
    title: 'Vous trouvez un souvenir',
    description: 'Un petit objet enfoui sous les gravats capte votre attention.',
    trigger: { kind: 'counter', counter: 'age1.counter.bedroomTilesRepaired', atLeast: 3 },
    effects: [{ kind: 'log', message: 'Quelque chose attire votre regard sous la poussière.' }],
    choices: [
      {
        id: 'later',
        label: 'Remettre à plus tard',
        description: 'Vous rangez l’objet sans le déballer.',
        effects: [
          { kind: 'addGauge', gaugeSlug: 'health', amount: 25 },
          { kind: 'log', message: 'Une chaleur apaise votre corps.' },
        ],
      },
      {
        id: 'understand',
        label: 'Prendre le temps de comprendre',
        description: 'Quelques instants de calme.',
        effects: [
          { kind: 'addGauge', gaugeSlug: 'stamina', amount: 15 },
          { kind: 'log', message: 'Votre souffle se fait plus régulier.' },
        ],
      },
    ],
  },

  /** BRIEF : après la 1re nuit (sommeil). */
  {
    id: 'age1.event.firstNightForest',
    title: 'Du bruit dans la forêt',
    description: 'Quelque chose est tombé à l’orée des arbres.',
    trigger: { kind: 'counter', counter: 'age1.counter.nightsSlept', atLeast: 1 },
    effects: [{ kind: 'log', message: 'La nuit porte des sons rares.' }],
    choices: [
      {
        id: 'goSee',
        label: 'Aller voir',
        description: 'Vous risquez un aller-retour pénible.',
        gaugeCosts: [{ gaugeSlug: 'health', quantity: 12 }],
        effects: [
          { kind: 'addResource', resourceSlug: 'age1.resource.wood', amount: 50 },
          { kind: 'log', message: 'Vous ramenez un tas de bois utilisable.' },
        ],
      },
      {
        id: 'stay',
        label: 'Ne rien faire',
        description: 'Le stress vous épuise un peu.',
        gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 6 }],
        effects: [{ kind: 'log', message: 'Vous restez figé. Le sommeil vous quitte mal.' }],
      },
    ],
  },

  /** BRIEF : après la première fouille (activité). */
  {
    id: 'age1.event.scavengeDiscovery',
    title: 'Sous les déchets',
    description: 'Il y a quelque chose d’important sous les gravats.',
    trigger: { kind: 'flag', flag: 'age1.flag.firstScavengeDone' },
    effects: [{ kind: 'log', message: 'Votre fouille révèle une cache dissimulée.' }],
    choices: [
      {
        id: 'force',
        label: 'Forcer pour trouver',
        description: 'Coûteux en effort.',
        gaugeCosts: [
          { gaugeSlug: 'stamina', quantity: 18 },
          { gaugeSlug: 'health', quantity: 8 },
        ],
        effects: [
          { kind: 'addResource', resourceSlug: 'age1.resource.cloth', amount: 50 },
          { kind: 'log', message: 'Le vide laisse des traces sur vos mains.' },
        ],
      },
      {
        id: 'thiefClever',
        label: 'Examiner avec astuce',
        description: 'Réservé au voleur.',
        requiresClass: 'thief',
        effects: [
          { kind: 'addResource', resourceSlug: 'age1.resource.cloth', amount: 60 },
          { kind: 'log', message: 'Une ouverture se dessine sans effort.' },
        ],
      },
    ],
  },

  /** Crassier épuisé — après le quota de fouilles (cabane finissable ; tissu ailleurs plus tard). */
  {
    id: 'age1.event.scavengeDepleted',
    title: 'Le crassier est vide',
    description:
      "Vos mains ne trouvent plus que de la terre battue et des fils rompus. Comme si cette endroit avait déjà tout donné ici, et qu'il fallût accepter de chercher ailleurs, plus tard, quand la maison le permettra.",
    trigger: {
      kind: 'counter',
      counter: 'age1.counter.scavengeUses',
      atLeast: AGE1_SCAVENGE_MAX_USES,
    },
    effects: [
      {
        kind: 'log',
        message:
          'Le crassier est épuisé. Vous vous redressez, les paumes vides, avec la sensation désagréable d’avoir déjà fait cela trop de fois.',
      },
      { kind: 'setFlag', flag: 'age1.flag.scavengeDepleted', value: true },
    ],
    choices: [
      {
        id: 'ack',
        label: 'Ce n’est plus ici',
        description: 'Le tissu viendra d’un autre endroit, quand la maison l’exigera.',
        effects: [
          {
            kind: 'log',
            message:
              'Vous laissez la friche derrière vous. Pour l’instant, bois et pierre doivent suffire.',
          },
        ],
      },
    ],
  },

  {
    id: 'age1.event.endBedroom',
    title: 'La chambre est prête',
    description:
      "Le lit retrouve sa place, les murs ne craquent plus la nuit. Il est bon de s'étendre au lieu de seulement se reposer.",
    trigger: { kind: 'counter', counter: 'age1.counter.bedroomTilesRepaired', atLeast: 9 },
    minEra: 1,
    effects: [
      { kind: 'log', message: 'La chambre est prête : le sommeil revient.' },
      { kind: 'setFlag', flag: 'age2.flag.bedroomComplete', value: true },
      { kind: 'setFlag', flag: 'game.flag.sleepUnlocked', value: true },
    ],
    choices: [
      {
        id: 'enterAge2',
        label: 'Sortir de la chambre',
        description: 'La maison, plus vaste, attend au-delà de cette porte.',
        effects: [
          { kind: 'setFlag', flag: 'age1.flag.era1Complete', value: true },
          { kind: 'setFlag', flag: 'ui.flag.journalShown', value: true },
          {
            kind: 'log',
            message:
              'Vous quittez la chambre. La maison, plus vaste, vous attend. Au-delà, ceux qui n’ont pas encore reçu votre message.',
          },
        ],
      },
    ],
  },
]
