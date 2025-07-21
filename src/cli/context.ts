import { Context, Effect, Layer, pipe, Ref } from 'effect';
import type { RuntimeContext } from '../app/context.js';
import { loggerLayer } from './logging.js';

export class AppContext extends Context.Tag('AppContext')<
  AppContext,
  {
    context: Ref.Ref<RuntimeContext>;
  }
>() {}

export const make = (context: RuntimeContext) =>
  Layer.effect(
    AppContext,
    pipe(
      context,
      Ref.make,
      Effect.map((context) => ({ context })),
    ),
  );

export const AppLive = (context: RuntimeContext) =>
  Layer.mergeAll(loggerLayer, make(context));
