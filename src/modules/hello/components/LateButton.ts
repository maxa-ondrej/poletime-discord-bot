import { Discord } from 'dfx';
import { Effect } from 'effect';
import { createButton } from '@/lib/ix-manager';
import { ComeModal } from './ComeModal.js';

export const LateButton = createButton(
  'late',
  {},
  () => ({
    label: 'Přijdu později',
    style: Discord.ButtonStyleTypes.SECONDARY,
  }),
  ({ session }) =>
    Effect.succeed(ComeModal.Component({ session, name: `Pozdě: ${session}` })),
);
