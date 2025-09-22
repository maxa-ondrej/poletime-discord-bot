import { Discord, Ix, UI } from 'dfx';
import { Effect } from 'effect';
import { toDiscordMention } from '@/lib/date';
import { colors, h1, link } from '@/lib/theme';
import { ComeButton } from '@/modules/events/buttons/ComeButton';
import { LateButton } from '@/modules/events/buttons/LateButton';
import { NotComeButton } from '@/modules/events/buttons/NotComeButton';
import { WhoComesButton } from '@/modules/events/buttons/WhoComesButton';
import type { Event } from '@/services/events';

export const EventDetail = (event: Event) =>
  Effect.Do.pipe(
    Effect.bind('comeButton', () =>
      ComeButton.Component({ session: event.id }),
    ),
    Effect.bind('lateButton', () =>
      LateButton.Component({ session: event.id }),
    ),
    Effect.bind('notComeButton', () =>
      NotComeButton.Component({ session: event.id }),
    ),
    Effect.bind('whoComesButton', () =>
      WhoComesButton.Component({ session: event.id }),
    ),
    Effect.map(({ whoComesButton, comeButton, lateButton, notComeButton }) =>
      Ix.response({
        type: Discord.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: Discord.MessageFlags.IsComponentsV2,
          components: [
            UI.container({
              accent_color: colors.success,
              components: [
                UI.textDisplay(h1(event.title)),
                UI.textDisplay(`⏰ ${toDiscordMention(event.date)}`),
                UI.textDisplay(
                  `📌 ${link(event.location.name, event.location.url.toString())}`,
                ),
                UI.row([comeButton, lateButton, notComeButton]),
                UI.seperator(),
                UI.row([whoComesButton]),
              ],
            }),
          ],
        },
      }),
    ),
  );
