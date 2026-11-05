import { useSheets, closeSheet } from '../lib/ui';
import { EventSheet, EventEditor } from './sheets/EventSheets';
import { PlaceSheet, PlaceEditor } from './sheets/PlaceSheets';
import { TaskSheet, TaskEditor } from './sheets/TaskSheets';
import { IdeaSheet, IdeaEditor } from './sheets/IdeaSheets';
import { ExpenseEditor, NoteEditor } from './sheets/MiscSheets';
import { PersonSheet } from './sheets/PersonSheet';
import { CompassSheet } from './sheets/CompassSheet';
import { ConverterSheet, RouletteSheet } from './sheets/FunSheets';
import { TimePickerSheet } from './sheets/TimePickerSheet';

export function SheetHost() {
  const stack = useSheets();
  const top = stack[stack.length - 1];
  if (!top) return null;
  const key = stack.length + top.t;
  switch (top.t) {
    case 'event':
      return <EventSheet key={key} id={top.id} onClose={closeSheet} />;
    case 'eventEdit':
      return <EventEditor key={key} id={top.id} draft={top.draft} onClose={closeSheet} />;
    case 'place':
      return <PlaceSheet key={key} id={top.id} onClose={closeSheet} />;
    case 'placeEdit':
      return <PlaceEditor key={key} id={top.id} draft={top.draft} onClose={closeSheet} />;
    case 'task':
      return <TaskSheet key={key} id={top.id} onClose={closeSheet} />;
    case 'taskEdit':
      return <TaskEditor key={key} id={top.id} draft={top.draft} onClose={closeSheet} />;
    case 'idea':
      return <IdeaSheet key={key} id={top.id} onClose={closeSheet} />;
    case 'ideaEdit':
      return <IdeaEditor key={key} id={top.id} draft={top.draft} onClose={closeSheet} />;
    case 'expenseEdit':
      return <ExpenseEditor key={key} id={top.id} onClose={closeSheet} />;
    case 'noteEdit':
      return <NoteEditor key={key} id={top.id} onClose={closeSheet} />;
    case 'person':
      return <PersonSheet key={key} id={top.id} onClose={closeSheet} />;
    case 'compass':
      return <CompassSheet key={key} target={top.target} onClose={closeSheet} />;
    case 'converter':
      return <ConverterSheet key={key} onClose={closeSheet} />;
    case 'timePicker':
      return <TimePickerSheet key={key} onClose={closeSheet} />;
    case 'roulette':
      return <RouletteSheet key={key} onClose={closeSheet} />;
    default:
      return null;
  }
}
