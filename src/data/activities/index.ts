import type { ActivityType } from '@/types/ActivityType'
import { age1Activities } from './age1'
import { age2Activities } from './age2'

/** Données concaténées pour `activityStore`. */
export const activitiesData: ActivityType[] = [...age1Activities, ...age2Activities]
