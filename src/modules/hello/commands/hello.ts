import { Discord, Ix, UI } from 'dfx';
import { Effect } from 'effect';
import { ComeButton } from '../components/ComeButton.js';
import { LateButton } from '../components/LateButton.js';
import { NotComeButton } from '../components/NotComeButton.js';
import { WhoComesButton } from '../components/WhoComesButton.js';

export default Effect.succeed(
  Ix.global(
    {
      name: 'hello',
      description: 'A basic command',
      options: [
        {
          type: Discord.ApplicationCommandOptionType.STRING,
          name: 'message',
          description: 'The message to send',
          required: true,
        },
        {
          type: Discord.ApplicationCommandOptionType.CHANNEL,
          name: 'channel',
          description: 'The channel to send the message to',
          required: true,
        },
      ],
    },
    (ix) =>
      Effect.Do.pipe(
        Effect.let('message', () => ix.optionValue('message')),
        Effect.map(({ message }) =>
          Ix.response({
            type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: Discord.MessageFlags.IsComponentsV2,
              components: [
                UI.container({
                  accent_color: 0x00ff00,
                  components: [
                    UI.textDisplay('# Trénink'),
                    UI.textDisplay('⏰ <t:1753192680:R>'),
                    UI.textDisplay('📌 [Ratibořická](https://example.com)'),
                    UI.textDisplay(message),
                    UI.row([
                      ComeButton.Component({ session: ix.target.id }),
                      LateButton.Component({ session: ix.target.id }),
                      NotComeButton.Component({ session: ix.target.id }),
                    ]),
                    UI.seperator(),
                    UI.row([
                      WhoComesButton.Component({ session: ix.target.id }),
                    ]),
                  ],
                }),
              ],
            },
          }),
        ),
      ),
  ),
);
