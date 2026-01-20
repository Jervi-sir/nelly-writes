import { useOutletContext } from "react-router-dom";
import type { LibraryContextType } from "../app";
import { BookCard } from "../components/book-card";

export default function Wishlist() {
  const { books, library, updateStatus, updateRating, toggleOwned, openBookForm } = useOutletContext<LibraryContextType>();

  const wishlistEntries = library.filter(l => l.status === "wishlist");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">Books you want to acquire.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistEntries.map((entry) => {
          const book = books.find(b => b.id === entry.bookId)!;
          return (
            <BookCard
              key={entry.id}
              book={book}
              entry={entry}
              onUpdateStatus={(s) => updateStatus(entry.id, s)}
              onUpdateRating={(r) => updateRating(entry.id, r)}
              onToggleOwned={() => toggleOwned(entry.id)}
              onEdit={() => openBookForm?.(book.id)}
            />
          );
        })}
        {wishlistEntries.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Your wishlist is empty.
          </div>
        )}
      </div>
    </div>
  );
}
