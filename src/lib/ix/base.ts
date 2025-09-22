import { type Context, Effect, pipe, type Record, String } from 'effect';
import type {
  ComponentPropsConsumer,
  ComponentPropsProducer,
  Identifiers,
  IxComponent,
  Keys,
  MessageComponentTypes,
  Opts,
  Services,
} from './types.js';

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
): IxComponent<
  Effect.Effect<C, never>,
  Effect.Effect<H, never, Keys<Identifiers<Deps>>>,
  P
> => {
  const fullPrefix = pipe(
    type,
    String.concat('/'),
    String.concat(id),
    String.concat('/'),
  );

  return {
    Component: ({ session, ...props }: ComponentPropsConsumer<P>) =>
      Effect.Do.pipe(
        Effect.map(
          () =>
            ({
              ...props,
              custom_id: `${fullPrefix}${session}`,
            }) as P,
        ),
        Effect.map(component),
      ),
    handler: Effect.Do.pipe(
      Effect.bind('deps', () =>
        Effect.gen(function* () {
          let deps = {} as Services<Deps>;
          for (const [key, dep] of Object.entries(dependencies)) {
            const service = yield* dep as Context.Tag<
              Keys<Identifiers<Deps>>,
              Keys<Services<Deps>>
            >;
            deps = { ...deps, [key]: service };
          }
          return deps;
        }),
      ),
      Effect.map(({ deps }) => ({
        matchId: String.startsWith(fullPrefix),
        getSession: String.substring(fullPrefix.length),
        dependencies: deps,
      })),
      Effect.tap(() =>
        Effect.logDebug('Processing interaction', {
          type,
          id,
        }),
      ),
      Effect.map(handler),
    ),
  };
};
