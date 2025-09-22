import { Interaction } from 'dfx/Interactions/context';
import { Effect, Layer, Option, pipe } from 'effect';
import {
  parseLocale,
  type TranslationKeys,
  TranslationsContext,
  translate,
} from '@/lib/translations';

export const translationContext = Interaction.pipe(
  Effect.map(({ guild_locale }) => Option.fromNullable(guild_locale)),
  Effect.map((locale) => parseLocale(locale)),
  (effect) =>
    Layer.effect(
      TranslationsContext,
      effect.pipe(Effect.map((lang) => ({ lang }))),
    ),
);

export const createTranslate = Effect.Do.pipe(
  Effect.bind('context', () => Interaction),
  Effect.map(
    ({ context }) =>
      (key: TranslationKeys) =>
        pipe(
          key,
          translate,
          Effect.provide(translationContext),
          Effect.provideService(Interaction, context),
          Effect.runSync,
        ),
  ),
);
