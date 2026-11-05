import type { Collection, Expense, Note } from '../../shared/types';
import { EVENTS } from './events';
import { IDEAS } from './ideas';
import { PEOPLE } from './people';
import { PLACES } from './places';
import { TASKS } from './tasks';

const NOTES: Note[] = [
  {
    id: 'n-apartment',
    title: 'Apartment info',
    body:
      'Address: Dalimilova 261/14, 130 00 Praha 3 – Žižkov\nCheck-in: ?  ·  Check-out: ?\nDoor code / keys: ?\nWi-Fi: ? / password ?\nHost contact: ?\n\nNearest trams: Lipanská (~330 m), Husinecká (~5 min).\nPub downstairs-ish: U Vystřelenýho oka (2 min).',
    pinned: true,
  },
  {
    id: 'n-contacts',
    title: 'Crew contacts & bookings',
    body: 'Koryun: +374 …\nAlexey: +420 …\nArto: +41 …\n\nWizz booking ref: …\nKorn tickets: …\nPilsner tour booking: …',
    pinned: true,
  },
];

const EXPENSES: Expense[] = [];

export const SEED: Record<Collection, { id: string }[]> = {
  people: PEOPLE,
  places: PLACES,
  events: EVENTS,
  ideas: IDEAS,
  tasks: TASKS,
  expenses: EXPENSES,
  notes: NOTES,
};
