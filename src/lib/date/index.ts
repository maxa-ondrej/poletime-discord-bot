import type { Snowflake } from 'dfx/types';
import { DateTime, Number, Option } from 'effect';

const EPOCH_START = 1288834974657;

export const parseSnowflake = (
  snowflake: Snowflake,
): Option.Option<DateTime.DateTime> =>
  Option.some(snowflake).pipe(
    Option.andThen(Number.parse),
    Option.map(Number.multiply(1_000)),
    Option.map(Number.sum(EPOCH_START)), // Convert to milliseconds since epoch
    Option.andThen(DateTime.make),
  );

export const toSnowflake = (date: DateTime.DateTime): Snowflake =>
  date.pipe(
    DateTime.toEpochMillis,
    Number.divide(1_000), // Convert to seconds
    Option.getOrElse(() => 0), // Fallback to 0 if conversion fails
    Number.round(0),
    (snowflake) => snowflake.toString(),
  );

export enum TimeFormat {
  SHORT_TIME = 't',
  LONG_TIME = 'T',
  SHORT_DATE = 'd',
  LONG_DATE = 'D',
  LONG_DATE_WITH_TIME = 'f',
  LONG_DATE_WITH_DAY_OF_WEEK_AND_TIME = 'F',
  RELATIVE = 'R',
}

export const toDiscordMention = (
  date: DateTime.DateTime,
  { format = TimeFormat.RELATIVE }: { readonly format?: TimeFormat } = {},
) =>
  date.pipe(
    DateTime.toEpochMillis,
    Number.divide(1_000), // Convert to seconds
    Option.getOrElse(() => 0), // Fallback to 0 if conversion fails
    Number.round(0),
    (id) => `<t:${id}:${format}>`,
  );
