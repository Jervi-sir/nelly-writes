import { useOutletContext } from "react-router-dom";

import { BookCard } from "../components/book-card";
import type { LibraryContextType } from "../app";

export default function Dashboard() {
  const { books, library, updateStatus, updateRating, toggleOwned, openBookForm } = useOutletContext<LibraryContextType>();

  const readingEntries = library.filter((l) => l.status === "reading");

  // Get detailed objects
  const readingBooks = readingEntries.map((entry) => ({
    entry,
    book: books.find((b) => b.id === entry.bookId)!,
  }));

  const finishedCount = library.filter(l => l.status === 'finished').length;
  const wishlistCount = library.filter(l => l.status === 'wishlist').length;
  const ownedCount = library.filter(l => l.owned).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your library.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold">{readingEntries.length}</div>
          <div className="text-sm text-muted-foreground">Reading Now</div>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold">{finishedCount}</div>
          <div className="text-sm text-muted-foreground">Read this year</div>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold">{wishlistCount}</div>
          <div className="text-sm text-muted-foreground">On Wishlist</div>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold">{ownedCount}</div>
          <div className="text-sm text-muted-foreground">Books Owned</div>
        </div>
      </div>

      {/* Currently Reading */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Currently Reading</h2>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {readingEntries.length} / 2 Max
          </span>
        </div>

        {readingBooks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {readingBooks.map(({ book, entry }) => (
              <BookCard
                key={entry.id}
                book={book}
                entry={entry}
                onUpdateStatus={(s) => updateStatus(entry.id, s)}
                onUpdateRating={(r) => updateRating(entry.id, r)}
                onToggleOwned={() => toggleOwned(entry.id)}
                onEdit={() => openBookForm?.(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">You are not reading anything right now.</p>
          </div>
        )}
      </section>
    </div>
  );
}
