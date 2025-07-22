import { Discord, DiscordREST, Ix } from 'dfx';
import { Effect, Option } from 'effect';
import { createButton } from '@/lib/ix-manager';
import { ComeModal } from './ComeModal.js';

export const ComeButton = createButton(
  'come',
  { rest: DiscordREST },
  () => ({
    label: 'Přijdu',
    style: Discord.ButtonStyleTypes.SUCCESS,
  }),
  ({ session, context, dependencies }) =>
    Effect.succeed(dependencies).pipe(
      Effect.bind('guildId', () => Option.fromNullable(context.guild_id)),
      Effect.bind('guild', ({ rest, guildId }) => rest.getGuild(guildId)),
      Effect.tap(({ guild }) => Effect.logInfo(`Guild: ${guild.name}`)),
      Effect.match({
        onSuccess: () =>
          ComeModal.Component({ session, name: `Přijdu: ${session}` }),
        onFailure: () =>
          Ix.response({
            type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: Discord.MessageFlags.Ephemeral,
              content: 'An error occurred while processing your response.',
            },
          }),
      }),
    ),
);
