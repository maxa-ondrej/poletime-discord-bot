import type { Context, Record } from 'effect';
import type { TranslationKeys } from '@/lib/translations';

export type ValidProps = object;

export type ReservedComponentProps = {
  readonly custom_id: string;
  readonly t: (key: TranslationKeys) => string;
};

export type ComponentPropsProducer = ReservedComponentProps & ValidProps;

export type ComponentPropsConsumer<P extends ValidProps> = {
  readonly session: string;
} & Omit<P, keyof ReservedComponentProps>;

export type IxComponent<C, H, P extends ValidProps> = {
  Component: (props: ComponentPropsConsumer<P>) => C;
  handler: H;
};

export type Keys<D extends Record.ReadonlyRecord<string, unknown>> = D[keyof D];

export type Identifiers<D extends Record.ReadonlyRecord<string, unknown>> = {
  [K in keyof D]: D[K] extends Context.Tag<infer Id, infer _>
    ? Id
    : 'Error: Tag is not a Context.Tag';
};

export type Services<D extends Record.ReadonlyRecord<string, unknown>> = {
  [K in keyof D]: D[K] extends Context.Tag<infer _, infer S>
    ? S
    : 'Error: Tag is not a Context.Tag';
};

export type Opts<Deps extends Record.ReadonlyRecord<string, unknown>> = {
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
