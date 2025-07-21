import { Discord, Ix, UI } from 'dfx';
import {
  MessageComponentData,
  ModalSubmitData,
} from 'dfx/Interactions/context';
import { Effect, pipe, String } from 'effect';

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

type Opts = {
  readonly matchId: (id: string) => boolean;
  readonly getSession: (session: string) => string;
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
  Deps,
  EH extends Effect.Effect<H, never, Deps>,
>(
  type: MessageComponentTypes,
  id: string,
  component: ({ custom_id, ...props }: P) => C,
  handler: (opts: Opts) => EH,
): IxComponent<C, EH, P> => {
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
    handler: handler({
      matchId: String.startsWith(fullPrefix),
      getSession: String.substring(fullPrefix.length),
    }),
  };
};

export const createButton = <Deps, P extends ComponentPropsProducer>(
  id: string,
  component: (
    props: P,
  ) => Omit<Partial<Discord.ButtonComponentForMessageRequest>, 'custom_id'>,
  handler: (opts: {
    readonly session: string;
    readonly ix: Discord.APIMessageComponentInteractionData;
  }) => Effect.Effect<Discord.CreateInteractionResponseRequest, never, never>,
) =>
  createIx(
    MessageComponentTypes.BUTTON,
    id,
    (props: P) =>
      UI.button({
        ...component(props),
        custom_id: props.custom_id,
      }),
    ({ matchId, getSession }) =>
      Effect.succeed(
        Ix.messageComponent(
          matchId,
          Effect.Do.pipe(
            Effect.bind('ix', () => MessageComponentData),
            Effect.let('session', ({ ix }) => getSession(ix.custom_id)),
            Effect.andThen(({ session, ix }) => handler({ session, ix })),
          ),
        ),
      ),
  );

export const createModal = <Deps, P extends ComponentPropsProducer>(
  id: string,
  component: (
    props: P,
  ) => Omit<Discord.ModalInteractionCallbackRequestData, 'custom_id'>,
  handler: (opts: {
    readonly session: string;
    readonly ix: Discord.APIModalSubmission;
  }) => Effect.Effect<Discord.CreateInteractionResponseRequest, never, never>,
) =>
  createIx(
    MessageComponentTypes.MODAL,
    id,
    (props: P) =>
      Ix.response({
        type: Discord.InteractionCallbackTypes.MODAL,
        data: {
          ...component(props),
          custom_id: props.custom_id,
        },
      }),
    ({ matchId, getSession }) =>
      Effect.succeed(
        Ix.modalSubmit(
          matchId,
          Effect.Do.pipe(
            Effect.bind('ix', () => ModalSubmitData),
            Effect.let('session', ({ ix }) => getSession(ix.custom_id)),
            Effect.andThen(({ session, ix }) => handler({ session, ix })),
          ),
        ),
      ),
  );
