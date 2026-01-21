import { useLibrary } from "../hooks/use-library";
import { BookCard } from "../components/book-card";
import { BookForm } from "../components/book-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const {
    books,
    library,
    updateStatus,
    updateRating,
    toggleOwned,
    openBookForm,
    deleteBook,
    isFormOpen,
    setIsFormOpen,
    handleFormSubmit,
    initialFormData,
    loading,
    error
  } = useLibrary();

  const wishlistEntries = library.filter(l => l.status === "wishlist");

  if (loading) {
    return <div className="flex items-center justify-center p-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground">Books you want to acquire.</p>
        </div>
        <Button onClick={() => openBookForm()} size="sm" className="gap-2 rounded-full">
          <Plus size={16} /> Add Book
        </Button>
      </header>

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-6">
        {wishlistEntries.map((entry) => {
          const book = books.find(b => b.id === entry.bookId)!;
          if (!book) return null;
          return (
            <BookCard
              key={entry.id}
              book={book}
              entry={entry}
              onUpdateStatus={(s) => updateStatus(entry.id, s)}
              onUpdateRating={(r) => updateRating(entry.id, r)}
              onToggleOwned={() => toggleOwned(entry.id)}
              onEdit={() => openBookForm?.(book.id)}
              onDelete={() => deleteBook(book.id)}
            />
          );
        })}
        {wishlistEntries.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Your wishlist is empty.
          </div>
        )}
      </div>

      <BookForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={initialFormData}
      />
    </div>
  );
}
