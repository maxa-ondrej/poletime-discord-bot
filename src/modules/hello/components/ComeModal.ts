import { Discord, DiscordREST, Ix, UI } from 'dfx';
import { Effect } from 'effect';
import { createModal } from '@/lib/ix-manager';

export type ComeModalProps = {
  readonly custom_id: string;
  readonly name: string;
};

export const ComeModal = createModal(
  'come',
  { rest: DiscordREST },
  ({ name }: ComeModalProps) => ({
    title: 'Přijdu',
    components: [
      UI.row([
        UI.textInput({
          custom_id: 'inputs.come',
          label: 'Jak se jmenuješ?',
          style: Discord.TextInputStyleTypes.SHORT,
          required: true,
          value: name,
        }),
      ]),
    ],
  }),
  ({ session, ix, dependencies }) =>
    Effect.succeed(dependencies).pipe(
      Effect.bind('guild', ({ rest }) => rest.getGuild(ix.custom_id)),
      Effect.match({
        onSuccess: () =>
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
                    UI.textDisplay('Thank you for your response!' + session),
                  ],
                }),
              ],
            },
          }),
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
