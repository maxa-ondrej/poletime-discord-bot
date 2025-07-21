import { Command, Options } from '@effect/cli';
import { NodeHttpClient, NodeSocket } from '@effect/platform-node';
import { DiscordConfig } from 'dfx';
import { DiscordIxLive } from 'dfx/gateway';
import { Config, Effect, Layer } from 'effect';
import { MainLive } from '../modules/index.js';

const token = Options.redacted('token');

export const command = Command.make('discord-bot', { token }, ({ token }) =>
  Effect.Do.pipe(
    Effect.tap(() => Effect.logInfo('Starting Discord Bot')),
    Effect.let('DiscordConfig', () =>
      DiscordConfig.layerConfig({
        token: Config.succeed(token),
      }),
    ),
    Effect.let('DiscordLayer', ({ DiscordConfig }) =>
      DiscordIxLive.pipe(
        Layer.provide([
          DiscordConfig,
          NodeHttpClient.layerUndici,
          NodeSocket.layerWebSocketConstructor,
        ]),
      ),
    ),
    Effect.let('InteractionsLayer', ({ DiscordLayer }) =>
      MainLive.pipe(Layer.provide(DiscordLayer)),
    ),
    Effect.tap(() => Effect.logInfo('Successfully started Discord Bot')),
    Effect.tap(({ InteractionsLayer }) => Layer.launch(InteractionsLayer)),
    Effect.tap(() => Effect.logInfo('Shutting down Discord Bot')),
  ),
);
