import { Discord, DiscordREST, Ix, UI } from 'dfx';
import { Effect, Option } from 'effect';
import { createModal, type ReservedComponentProps } from '@/lib/ix';

export type UpsertEventModalProps = {
  readonly id?: Option.Option<string>;
} & ReservedComponentProps;

export const UpsertEventModal = createModal(
  'upsert-event',
  { rest: DiscordREST },
  ({ id = Option.none() }: UpsertEventModalProps) => ({
    title: 'Přijdu',
    components: [
      UI.row([
        UI.textInput({
          custom_id: 'event-name',
          label: 'Název události',
          style: Discord.TextInputStyleTypes.SHORT,
          required: true,
          value: id.pipe(Option.getOrNull),
        }),
      ]),
    ],
  }),
  ({ t, ix, dependencies }) =>
    Effect.succeed(dependencies).pipe(
      Effect.bind('guild', ({ rest }) => rest.getGuild(ix.custom_id)),
      Effect.map(() =>
        Ix.response({
          type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags:
              Discord.MessageFlags.IsComponentsV2 |
              Discord.MessageFlags.Ephemeral,
            components: [
              UI.container({
                accent_color: 0x00ff00,
                components: [
                  UI.textDisplay(t('hello.attendance.response-success')),
                ],
              }),
            ],
          },
        }),
      ),
      Effect.tapError((e) => Effect.logError('Error occurred while voting', e)),
      Effect.catchAll(() =>
        Effect.succeed(
          Ix.response({
            type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags:
                Discord.MessageFlags.IsComponentsV2 |
                Discord.MessageFlags.Ephemeral,
              components: [
                UI.container({
                  accent_color: 0xff0000,
                  components: [UI.textDisplay(t('error.unexpected-error'))],
                }),
              ],
            },
          }),
        ),
      ),
    ),
);
