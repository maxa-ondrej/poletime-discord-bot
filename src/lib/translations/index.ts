import {
  Array,
  Context,
  Effect,
  Match,
  Option,
  pipe,
  Record,
  String,
} from 'effect';
import cs from '../../translations/cs.json' with { type: 'json' };

const translations = {
  cs,
  en: cs, // Fallback to Czech for English translations
};

type Language = keyof typeof translations;

const DefaultLanguage: Language = 'cs';

type ExtractTranslationKey<
  T extends Record<string, unknown>,
  Prefix extends string = '',
> = {
  [K in keyof T]: K extends string
    ? T[K] extends string
      ? `${Prefix}${K}`
      : T[K] extends Record<string, unknown>
        ? ExtractTranslationKey<T[K], `${Prefix}${K}.`>
        : never
    : never;
}[keyof T];

export type TranslationKeys = ExtractTranslationKey<
  (typeof translations)[Language]
>;

export const translateWithLocale =
  (key: TranslationKeys) =>
  (lang: Language): string =>
    pipe(
      key,
      String.split('.'),
      Array.reduce(translations[lang] as Record<string, unknown>, (acc, curr) =>
        pipe(
          acc,
          Record.get(curr),
          Option.map((value) => value as Record<string, unknown>),
          Option.getOrElse(() => ({}) as Record<string, unknown>),
        ),
      ),
      (translated) => (typeof translated === 'string' ? translated : key),
    );

export const translate = (key: TranslationKeys) =>
  Effect.Do.pipe(
    Effect.let('key', () => key),
    Effect.bind('context', () => TranslationsContext),
    Effect.let('lang', ({ context }) => context.lang),
    Effect.map(({ key, lang }) => translateWithLocale(key)(lang)),
  );

export class TranslationsContext extends Context.Tag('translations/context')<
  TranslationsContext,
  {
    readonly lang: Language;
  }
>() {}

export const parseLocale = (locale: Option.Option<string>): Language =>
  locale.pipe(
    Option.getOrElse(() => DefaultLanguage),
    Match.value,
    Match.when('cs', () => 'cs' as const),
    Match.when('en-US', () => 'en' as const),
    Match.when('en-UK', () => 'en' as const),
    Match.orElse(() => DefaultLanguage),
  );
