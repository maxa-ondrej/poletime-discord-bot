import { Discord, Ix, UI } from 'dfx';
import { Effect, Option } from 'effect';
import { createButton } from '@/lib/ix';
import { Votings } from '@/services/votings';

export const ComeButton = createButton(
  'come',
  { votings: Votings },
  ({ t }) => ({
    label: t('hello.attendance.button-come'),
    style: Discord.ButtonStyleTypes.SUCCESS,
  }),
  ({ session, context, t, dependencies: { votings } }) =>
    Effect.Do.pipe(
      Effect.bind('user', () =>
        Option.fromNullable(context.member?.user ?? context.user),
      ),
      Effect.tap(({ user }) => votings.vote(session, user.id, 'coming')),
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
      Effect.catchTag('NoSuchElementException', () =>
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
