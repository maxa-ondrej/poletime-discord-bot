import { Discord, Ix } from 'dfx';
import { Effect } from 'effect';
import { ComeModal } from '@/modules/events/modals/ComeModal';
import { Events } from '@/services/events';

export default Effect.Do.pipe(
  Effect.bind('events', () => Events),
  Effect.map(() =>
    Ix.guild(
      {
        name: 'create-event',
        description: 'Create a new event',
      },
      () =>
        Effect.Do.pipe(
          Effect.bind('modal', () =>
            ComeModal.Component({
              name: '',
              session: 'create-event',
            }),
          ),
          Effect.map(({ modal }) =>
            Ix.response({
              type: Discord.InteractionCallbackTypes.MODAL,
              data: {
                title: 'Vytvoření akce',
                custom_id: 'create-event',
                components: [],
              },
            }),
          ),
        ),
    ),
  ),
);
