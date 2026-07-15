import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isBot: integer('is_bot', { mode: 'boolean' }).notNull().default(false),
  botSkill: integer('bot_skill'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(),
  mode: text('mode', { enum: ['x01', 'cricket'] }).notNull(),
  configJson: text('config_json').notNull(),
  winnerPlayerId: text('winner_player_id'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  finishedAt: integer('finished_at', { mode: 'timestamp' }),
});

export const matchPlayers = sqliteTable('match_players', {
  matchId: text('match_id')
    .notNull()
    .references(() => matches.id),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id),
  position: integer('position').notNull(),
});

export const legs = sqliteTable('legs', {
  id: text('id').primaryKey(),
  matchId: text('match_id')
    .notNull()
    .references(() => matches.id),
  legNumber: integer('leg_number').notNull(),
  winnerPlayerId: text('winner_player_id').notNull(),
  checkoutScore: integer('checkout_score'),
  dartsUsed: integer('darts_used'),
  turnsJson: text('turns_json').notNull(),
});

export const drillResults = sqliteTable('drill_results', {
  id: text('id').primaryKey(),
  drillType: text('drill_type').notNull(),
  playerId: text('player_id').references(() => players.id),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  detailsJson: text('details_json'),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
});
