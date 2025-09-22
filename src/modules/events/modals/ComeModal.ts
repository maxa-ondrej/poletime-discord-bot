import { Discord, DiscordREST, Ix, UI } from 'dfx';
import { Array, DateTime, Effect, Option, pipe } from 'effect';
import { createModal, type ReservedComponentProps } from '@/lib/ix';
import { Events } from '@/services/events';

export type ComeModalProps = {
  readonly name: string;
} & ReservedComponentProps;

export const ComeModal = createModal(
  'come',
  { rest: DiscordREST, events: Events },
  ({ name }: ComeModalProps) => ({
    title: 'Vytvoření akce',
    components: [
      UI.row([
        UI.textInput({
          custom_id: 'inputs.come',
          label: 'Název akce',
          style: Discord.TextInputStyleTypes.SHORT,
          required: true,
          value: name,
        }),
      ]),
    ],
  }),
  ({ dependencies, t, ix }) =>
    Effect.succeed(dependencies).pipe(
      Effect.bind('title', () =>
        pipe(
          ix.components,
          Array.flatMap(({ components }) => components),
          Array.findFirst(({ custom_id }) => custom_id === 'inputs.come'),
          Option.map(({ value }) => value),
        ),
      ),
      Effect.bind('date', () => DateTime.now),
      Effect.bind('event', ({ title, events, date }) =>
        events.create({
          title,
          date,
          deadline: date,
          location: {
            name: 'Ratibořická',
            url: new URL('https://example.com'),
          },
        }),
      ),
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
