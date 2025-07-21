import { Discord } from 'dfx';
import { Effect } from 'effect';
import { createButton } from '../../../lib/ix-manager.js';
import { ComeModal } from './ComeModal.js';

export const NotComeButton = createButton(
  'not-come',
  () => ({
    label: 'Nepřijdu',
    style: Discord.ButtonStyleTypes.DANGER,
  }),
  ({ session }) =>
    Effect.succeed(
      ComeModal.Component({ session, name: `Nepřijdu: ${session}` }),
    ),
);
