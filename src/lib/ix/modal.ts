import { Discord, Ix } from 'dfx';
import { ModalSubmitData } from 'dfx/Interactions/context';
import { Effect, type Record } from 'effect';
import type { TranslationKeys } from '@/lib/translations';
import { createIx } from './base.js';
import { createTranslate } from './translations.js';
import {
  type ComponentPropsProducer,
  MessageComponentTypes,
  type Services,
} from './types.js';

export const createModal = <
  Deps extends Record.ReadonlyRecord<string, unknown>,
  P extends ComponentPropsProducer,
>(
  id: string,
  dependencies: Deps,
  component: (
    props: P,
  ) => Omit<Discord.ModalInteractionCallbackRequestData, 'custom_id'>,
  handler: (opts: {
    readonly session: string;
    readonly ix: Discord.APIModalSubmission;
    readonly dependencies: Services<Deps>;
    readonly t: (key: TranslationKeys) => string;
  }) => Effect.Effect<Discord.CreateInteractionResponseRequest, never, never>,
) =>
  createIx(
    MessageComponentTypes.MODAL,
    id,
    dependencies,
    (props: P) =>
      Ix.response({
        type: Discord.InteractionCallbackTypes.MODAL,
        data: {
          ...component(props),
          custom_id: props.custom_id,
        },
      }),
    ({ matchId, getSession, dependencies }) =>
      Ix.modalSubmit(
        matchId,
        Effect.Do.pipe(
          Effect.bind('ix', () => ModalSubmitData),
          Effect.let('session', ({ ix }) => getSession(ix.custom_id)),
          Effect.bind('translate', () => createTranslate),
          Effect.andThen(({ session, ix, translate }) =>
            handler({ session, ix, dependencies, t: translate }),
          ),
        ),
      ),
  );
