import { Ix } from 'dfx';
import { InteractionsRegistry } from 'dfx/gateway';
import { Effect, Layer } from 'effect';
import hello from './commands/hello.js';
import { ComeButton } from './components/ComeButton.js';
import { ComeModal } from './components/ComeModal.js';
import { LateButton } from './components/LateButton.js';
import { NotComeButton } from './components/NotComeButton.js';
import { WhoComesButton } from './components/WhoComesButton.js';

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
}).pipe(Effect.withLogSpan('HelloModule'));

export const HelloLive = Layer.effectDiscard(make);
