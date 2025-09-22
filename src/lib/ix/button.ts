import { type Discord, Ix, UI } from 'dfx';
import { Interaction, MessageComponentData } from 'dfx/Interactions/context';
import { Effect, type Record } from 'effect';
import type { TranslationKeys } from '@/lib/translations';
import { createIx } from './base.js';
import { createTranslate } from './translations.js';
import {
  type ComponentPropsProducer,
  MessageComponentTypes,
  type Services,
} from './types.js';

export const createButton = <
  Deps extends Record.ReadonlyRecord<string, unknown>,
  P extends ComponentPropsProducer,
>(
  id: string,
  dependencies: Deps,
  component: (
    props: P,
  ) => Omit<Partial<Discord.ButtonComponentForMessageRequest>, 'custom_id'>,
  handler: (opts: {
    readonly session: string;
    readonly ix: Discord.APIMessageComponentInteractionData;
    readonly context: Discord.APIInteraction;
    readonly dependencies: Services<Deps>;
    readonly t: (key: TranslationKeys) => string;
  }) => Effect.Effect<Discord.CreateInteractionResponseRequest, never, never>,
) =>
  createIx(
    MessageComponentTypes.BUTTON,
    id,
    dependencies,
    (props: P) =>
      UI.button({
        ...component(props),
        custom_id: props.custom_id,
      }),
    ({ matchId, getSession, dependencies }) =>
      Ix.messageComponent(
        matchId,
        Effect.Do.pipe(
          Effect.bind('context', () => Interaction),
          Effect.bind('ix', () => MessageComponentData),
          Effect.let('session', ({ ix }) => getSession(ix.custom_id)),
          Effect.bind('translate', () => createTranslate),
          Effect.andThen(({ session, ix, context, translate }) =>
            handler({ session, ix, context, dependencies, t: translate }),
          ),
        ),
      ),
  );
