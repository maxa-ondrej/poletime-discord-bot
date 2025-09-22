import { KeyValueStore } from '@effect/platform';
import type { Snowflake } from 'dfx/types';
import { Array, Effect, Option, pipe, Record, Schema } from 'effect';

export const SnowflakeSchema = Schema.NonEmptyTrimmedString.pipe(
  Schema.pattern(/^\d{10,20}$/),
);

export const Voting = Schema.Struct({
  id: SnowflakeSchema,
  title: Schema.NonEmptyTrimmedString,
  description: Schema.NonEmptyTrimmedString,
  date: SnowflakeSchema,
  votes: Schema.Record({
    key: Schema.NonEmptyTrimmedString,
    value: Schema.Struct({
      color: Schema.Number.pipe(
        Schema.int(),
        Schema.greaterThanOrEqualTo(0x000000),
        Schema.lessThanOrEqualTo(0xffffff),
      ),
      users: Schema.Set(SnowflakeSchema),
    }),
  }),
});

export type Voting = Schema.Schema.Type<typeof Voting>;

type Vote = string;

export type CreateVoting = Omit<Voting, 'votes'> & {
  votes: Record<string, number>;
};

export type UpdateVoting = Omit<Voting, 'id'>;

export const DatabaseSchema = Schema.Record({
  key: Schema.String,
  value: Voting,
});

const DbKey = 'votings';

export class Votings extends Effect.Service<Votings>()('votings', {
  effect: Effect.Do.pipe(
    Effect.bind('kv', () => KeyValueStore.KeyValueStore),
    Effect.let('db', ({ kv }) => kv.forSchema(DatabaseSchema)),
    Effect.map(({ db }) => ({
      create: (voting: CreateVoting): Effect.Effect<Voting> =>
        Effect.Do.pipe(
          Effect.let(
            'voting',
            (): Voting => ({
              ...voting,
              votes: Record.map(voting.votes, (color, users) => ({
                color,
                users: new Set(users),
              })),
            }),
          ),
          Effect.bind('oldVotings', () => db.get(DbKey)),
          Effect.let('votings', ({ oldVotings, voting }) =>
            pipe(
              oldVotings,
              Option.getOrElse(() => Record.empty<string, Voting>()),
              Record.set(voting.id, voting),
            ),
          ),
          Effect.tap(({ votings }) => db.set(DbKey, votings)),
          Effect.map(({ voting }) => voting),
          Effect.orDie,
        ),
      update: (id: Snowflake, newVoting: UpdateVoting) =>
        db.modify(
          DbKey,
          Record.modify(id, (voting) => ({
            ...voting,
            ...newVoting,
          })),
        ),
      delete: (id: Snowflake) => db.modify(DbKey, Record.remove(id)),
      get: (date: Snowflake) =>
        Effect.Do.pipe(
          Effect.bind('votings', () => db.get(DbKey)),
          Effect.map(({ votings }) =>
            Option.match(votings, {
              onNone: () => Option.none<Voting>(),
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
              onNone: () => Array.empty<Voting>(),
              onSome: (votings) => Record.values(votings),
            }),
          ),
          Effect.orDie,
        ),
      vote: (date: Snowflake, user: Snowflake, vote: Vote) =>
        Effect.Do.pipe(
          Effect.bind('votings', () =>
            db.modify(DbKey, Record.modify(date, modifyVoting(user, vote))),
          ),
          Effect.orDie,
        ),
    })),
  ),
  dependencies: [KeyValueStore.layerMemory],
}) {}

const modifyVoting = (user: Snowflake, vote: Vote) => (voting: Voting) => ({
  ...voting,
  votes: pipe(
    voting.votes,
    Record.map(({ color, users }) => {
      const set = new Set(users);
      set.delete(user);
      return { color, users: set };
    }),
    Record.modify(vote, ({ color, users }) => ({
      color,
      users: new Set(users).add(user),
    })),
  ),
});
