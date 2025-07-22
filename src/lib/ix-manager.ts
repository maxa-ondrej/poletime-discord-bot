import { Discord, Ix, UI } from 'dfx';
import {
  Interaction,
  MessageComponentData,
  ModalSubmitData,
} from 'dfx/Interactions/context';
import { type Context, Effect, pipe, type Record, String } from 'effect';

type ValidProps = object;

type ComponentPropsProducer = {
  readonly custom_id: string;
} & ValidProps;

type ComponentPropsConsumer<P extends ValidProps> = {
  readonly session: string;
} & Omit<P, 'custom_id'>;

export type IxComponent<C, H, P extends ValidProps> = {
  Component: (props: ComponentPropsConsumer<P>) => C;
  handler: H;
};

type Keys<D extends Record.ReadonlyRecord<string, unknown>> = D[keyof D];

type Identifiers<D extends Record.ReadonlyRecord<string, unknown>> = {
  [K in keyof D]: D[K] extends Context.Tag<infer Id, infer _>
    ? Id
    : 'Error: Tag is not a Context.Tag';
};

type Services<D extends Record.ReadonlyRecord<string, unknown>> = {
  [K in keyof D]: D[K] extends Context.Tag<infer _, infer S>
    ? S
    : 'Error: Tag is not a Context.Tag';
};

type Opts<Deps extends Record.ReadonlyRecord<string, unknown>> = {
  readonly matchId: (id: string) => boolean;
  readonly getSession: (session: string) => string;
  readonly dependencies: Services<Deps>;
};

export enum MessageComponentTypes {
  BUTTON = 'button',
  SELECT_MENU = 'select_menu',
  TEXT_INPUT = 'text_input',
  USER_SELECT = 'user_select',
  ROLE_SELECT = 'role_select',
  MENTIONABLE_SELECT = 'mentionable_select',
  CHANNEL_SELECT = 'channel_select',
  MODAL = 'modal',
}

export const createIx = <
  C,
  H,
  P extends ComponentPropsProducer,
  Deps extends Record.ReadonlyRecord<string, unknown>,
>(
  type: MessageComponentTypes,
  id: string,
  dependencies: Deps,
  component: ({ custom_id, ...props }: P) => C,
  handler: (opts: Opts<Deps>) => H,
): IxComponent<C, Effect.Effect<H, never, Keys<Identifiers<Deps>>>, P> => {
  const fullPrefix = pipe(
    type,
    String.concat('/'),
    String.concat(id),
    String.concat('/'),
  );

  return {
    Component: ({ session, ...props }: ComponentPropsConsumer<P>) =>
      component({ ...props, custom_id: `${fullPrefix}${session}` } as P & {
        custom_id: string;
      }),
    handler: Effect.gen(function* () {
      let deps = {} as Services<Deps>;
      for (const [key, dep] of Object.entries(dependencies)) {
        const service = yield* dep as Context.Tag<
          Keys<Identifiers<Deps>>,
          Keys<Services<Deps>>
        >;
        deps = { ...deps, [key]: service };
      }
      return handler({
        matchId: String.startsWith(fullPrefix),
        getSession: String.substring(fullPrefix.length),
        dependencies: deps,
      });
    }),
  };
};

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
          Effect.andThen(({ session, ix, context }) =>
            handler({ session, ix, context, dependencies }),
          ),
        ),
      ),
  );

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
          Effect.andThen(({ session, ix }) =>
            handler({ session, ix, dependencies }),
          ),
        ),
      ),
  );
