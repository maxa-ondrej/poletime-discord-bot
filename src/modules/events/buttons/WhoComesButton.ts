import { Discord, Ix, UI } from 'dfx';
import { Effect } from 'effect';
import { createButton } from '@/lib/ix';
import { Events } from '@/services/events';

export const WhoComesButton = createButton(
  'who-comes',
  { events: Events },
  ({ t }) => ({
    label: t('hello.attendance.button-whoComes'),
    style: Discord.ButtonStyleTypes.PRIMARY,
    emoji: {
      name: '🙋',
    },
  }),
  ({ session, t, dependencies: { events } }) =>
    Effect.Do.pipe(
      Effect.bind('eventO', () => events.get(session)),
      Effect.bind('event', ({ eventO }) => eventO),
      Effect.map(({ event }) =>
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
                  UI.textDisplay(
                    `# ${t('hello.attendance.title')}

## ${t('hello.attendance.button-come')}
${[...event.votes.coming].map((user) => `- <@${user}>`).join('\n') || t('hello.attendance.no-votes')}

## ${t('hello.attendance.button-late')}
${[...event.votes.late].map((user) => `- <@${user}>`).join('\n') || t('hello.attendance.no-votes')}

## ${t('hello.attendance.button-notCome')}
${[...event.votes.notComing].map((user) => `- <@${user}>`).join('\n') || t('hello.attendance.no-votes')}
`,
                  ),
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
