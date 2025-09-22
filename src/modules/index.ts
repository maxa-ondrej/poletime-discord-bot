import { Layer, RuntimeFlags } from 'effect';
import { Votings } from '@/services/votings';
import { HelloLive } from './events/index.js';

export const MainLive = Layer.mergeAll(HelloLive).pipe(
  Layer.provide(RuntimeFlags.disableRuntimeMetrics),
  Layer.provide(Votings.Default),
);
