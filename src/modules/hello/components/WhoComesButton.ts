import { Discord } from 'dfx';
import { Effect } from 'effect';
import { createButton } from '../../../lib/ix-manager.js';
import { ComeModal } from './ComeModal.js';

export const WhoComesButton = createButton(
  'who-comes',
  () => ({
    label: 'Kdo přijde?',
    style: Discord.ButtonStyleTypes.PRIMARY,
    emoji: {
      name: '🙋',
    },
  }),
  ({ session }) =>
    Effect.succeed(
      ComeModal.Component({ session, name: `Kdo přijde?: ${session}` }),
    ),
);
