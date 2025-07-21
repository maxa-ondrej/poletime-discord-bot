import { Layer, RuntimeFlags } from 'effect';
import { HelloLive } from './hello/index.js';

export const MainLive = Layer.mergeAll(HelloLive).pipe(
  Layer.provide(RuntimeFlags.disableRuntimeMetrics),
);
