import { Ix } from 'dfx';
import { InteractionsRegistry } from 'dfx/gateway';
import { Effect, Layer } from 'effect';
import { Events } from '@/services/events';
import { ComeButton } from './buttons/ComeButton.js';
import { LateButton } from './buttons/LateButton.js';
import { NotComeButton } from './buttons/NotComeButton.js';
import { WhoComesButton } from './buttons/WhoComesButton.js';
import hello from './commands/create.js';
import { ComeModal } from './modals/ComeModal.js';

const make = Effect.gen(function* () {
  const registry = yield* InteractionsRegistry;
  yield* registry.register(
    Ix.builder
      .add(yield* ComeButton.handler)
      .add(yield* LateButton.handler)
      .add(yield* NotComeButton.handler)
      .add(yield* WhoComesButton.handler)
      .add(yield* ComeModal.handler)
      .add(yield* hello)
      .catchAllCause(Effect.logError),
  );
}).pipe(Effect.withLogSpan('HelloModule'), Effect.provide(Events.Default));

export const HelloLive = Layer.effectDiscard(make);
