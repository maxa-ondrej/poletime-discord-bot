import { Discord } from 'dfx';
import { Effect } from 'effect';
import { createButton } from '../../../lib/ix-manager.js';
import { ComeModal } from './ComeModal.js';

export const ComeButton = createButton(
  'come',
  () => ({
    label: 'Přijdu',
    style: Discord.ButtonStyleTypes.SUCCESS,
  }),
  ({ session }) =>
    Effect.succeed(
      ComeModal.Component({ session, name: `Přijdu: ${session}` }),
    ),
);
