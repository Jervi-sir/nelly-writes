CREATE TYPE "public"."status" AS ENUM('wishlist', 'owned', 'reading', 'paused', 'finished', 'abandoned');--> statement-breakpoint
CREATE TABLE "books" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"cover_url" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "library" (
	"id" text PRIMARY KEY NOT NULL,
	"book_id" text NOT NULL,
	"status" "status" NOT NULL,
	"owned" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 3 NOT NULL,
	"rating" integer,
	"hooked" boolean DEFAULT false NOT NULL,
	"notes" text,
	"started_at" text,
	"finished_at" text
);
--> statement-breakpoint
ALTER TABLE "library" ADD CONSTRAINT "library_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;