import { Discord, Ix, UI } from 'dfx';
import { Effect, Option } from 'effect';
import { createButton } from '@/lib/ix';
import { Events } from '@/services/events';

export const LateButton = createButton(
  'late',
  { events: Events },
  ({ t }) => ({
    label: t('hello.attendance.button-late'),
    style: Discord.ButtonStyleTypes.SECONDARY,
  }),
  ({ session, context, t, dependencies: { events } }) =>
    Effect.Do.pipe(
      Effect.bind('user', () => Option.fromNullable(context.member?.user)),
      Effect.tap(({ user }) => events.vote(session, user.id, 'late')),
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
