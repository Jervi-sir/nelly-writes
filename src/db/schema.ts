import { pgTable, text, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const statusEnum = pgEnum('status', [
  'wishlist',
  'owned',
  'reading',
  'paused',
  'finished',
  'abandoned'
]);

// Books Table
export const books = pgTable('books', {
  id: text('id').primaryKey(), // Using text for flexibility (UUID string or similar)
  title: text('title').notNull(),
  author: text('author').notNull(),
  coverUrl: text('cover_url'),
  description: text('description'),
});

// Library Table
export const library = pgTable('library', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id),
  status: statusEnum('status').notNull(),
  owned: boolean('owned').notNull().default(false),
  priority: integer('priority').notNull().default(3), // 1-5
  rating: integer('rating'), // 1-5
  hooked: boolean('hooked').notNull().default(false),
  notes: text('notes'),
  startedAt: text('started_at'), // Storing as ISO string text based on frontend simplicity, or timestamp? Prompt used string. Let's use text for easier consistency with mock or timestamp?
  // User asked for "map 1:1 to Drizzle schema".
  // Mock data uses "2025-01-01" (string). Postgres Date is better but text is safer for matching mock exactly without conversion layer initially.
  // Actually timestamp with time zone is best practice, but for simple app date string is fine.
  // Let's use text to match the ISO string format of mock data exactly for now.
  finishedAt: text('finished_at'),
});
