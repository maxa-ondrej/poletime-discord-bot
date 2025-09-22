import { KeyValueStore } from '@effect/platform';
import type { Snowflake } from 'dfx/types';
import { Array, DateTime, Effect, Option, pipe, Record, Schema } from 'effect';

export const SnowflakeSchema = Schema.String;

export const Vote = Schema.Union(
  Schema.Literal('coming'),
  Schema.Literal('notComing'),
  Schema.Literal('late'),
);

export type Vote = Schema.Schema.Type<typeof Vote>;

export const Event = Schema.Struct({
  id: SnowflakeSchema,
  title: Schema.String,
  location: Schema.Struct({
    name: Schema.String,
    url: Schema.URL,
  }),
  date: Schema.DateTimeUtc,
  deadline: Schema.DateTimeUtc,
  votes: Schema.Record({
    key: Vote,
    value: Schema.Set(SnowflakeSchema),
  }),
});

export type Event = Schema.Schema.Type<typeof Event>;

export type CreateEvent = Omit<Event, 'id' | 'votes'>;

export type UpdateEvent = Omit<Event, 'id'>;

export const DatabaseSchema = Schema.Record({
  key: Schema.String,
  value: Event,
});

const DbKey = 'votings';

export class Events extends Effect.Service<Events>()('hello/votings', {
  effect: Effect.Do.pipe(
    Effect.bind('kv', () => KeyValueStore.KeyValueStore),
    Effect.let('db', ({ kv }) => kv.forSchema(DatabaseSchema)),
    Effect.map(({ db }) => ({
      create: (voting: CreateEvent): Effect.Effect<Event> =>
        Effect.Do.pipe(
          Effect.bind('id', () =>
            DateTime.now.pipe(
              Effect.map(DateTime.toEpochMillis),
              Effect.map(String),
            ),
          ),
          Effect.let(
            'voting',
            ({ id }): Event => ({
              ...voting,
              id,
              votes: {
                coming: new Set(),
                notComing: new Set(),
                late: new Set(),
              },
            }),
          ),
          Effect.bind('oldEvents', () => db.get(DbKey)),
          Effect.let('votings', ({ oldEvents, voting }) =>
            pipe(
              oldEvents,
              Option.getOrElse(() => Record.empty<string, Event>()),
              Record.set(voting.id, voting),
            ),
          ),
          Effect.tap(({ votings }) => db.set(DbKey, votings)),
          Effect.map(({ voting }) => voting),
          Effect.orDie,
        ),
      update: (id: Snowflake, newEvent: UpdateEvent) =>
        db.modify(
          DbKey,
          Record.modify(id, (voting) => ({
            ...voting,
            ...newEvent,
          })),
        ),
      delete: (id: Snowflake) => db.modify(DbKey, Record.remove(id)),
      get: (date: Snowflake) =>
        Effect.Do.pipe(
          Effect.bind('votings', () => db.get(DbKey)),
          Effect.map(({ votings }) =>
            Option.match(votings, {
              onNone: () => Option.none<Event>(),
              onSome: (votings) => Record.get(votings, date),
            }),
          ),
          Effect.orDie,
        ),
      getAll: () =>
        Effect.Do.pipe(
          Effect.bind('votings', () => db.get(DbKey)),
          Effect.map(({ votings }) =>
            Option.match(votings, {
              onNone: () => Array.empty<Event>(),
              onSome: (votings) => Record.values(votings),
            }),
          ),
          Effect.orDie,
        ),
      vote: (date: Snowflake, user: Snowflake, vote: Vote) =>
        Effect.Do.pipe(
          Effect.bind('votings', () =>
            db.modify(DbKey, Record.modify(date, modifyEvent(user, vote))),
          ),
          Effect.orDie,
        ),
    })),
  ),
  dependencies: [KeyValueStore.layerMemory],
}) {}

const modifyEvent = (user: Snowflake, vote: Vote) => (voting: Event) => ({
  ...voting,
  votes: pipe(
    voting.votes,
    Record.map((votes) => {
      const set = new Set(votes);
      set.delete(user);
      return set;
    }),
    Record.modify(vote, (votes) => new Set(votes).add(user)),
  ),
});
