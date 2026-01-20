import { useState } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from './components/layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Wishlist from './pages/Wishlist';
import { books as initialBooksData, libraryBooks as initialLibrary } from './data/mockLibrary';
import type { ReadingStatus, LibraryBook, Book } from './data/mockLibrary';
import { BookForm, type BookFormValues } from './components/book-form';
import { v4 as uuidv4 } from 'uuid';

/* Type for the Context */
export type LibraryContextType = {
  books: Book[];
  library: LibraryBook[];
  updateStatus: (id: string, status: ReadingStatus) => void;
  updateRating: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  toggleOwned: (id: string) => void;
  openBookForm: (bookId?: string) => void;
};

function App() {
  // State
  const [books, setBooks] = useState<Book[]>(initialBooksData);
  const [library, setLibrary] = useState<LibraryBook[]>(initialLibrary);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Derived state for editing
  const editingEntry = editingId ? library.find(e => e.bookId === editingId) : null;
  const editingBook = editingId ? books.find(b => b.id === editingId) : null;
  const initialFormData = editingEntry && editingBook ? { book: editingBook, entry: editingEntry } : null;

  // Actions
  const updateStatus = (id: string, newStatus: ReadingStatus) => {
    setError(null);

    // Constraint: Max 2 books can have status "reading"
    if (newStatus === "reading") {
      const currentReadingCount = library.filter(b => b.status === "reading" && b.id !== id).length;
      if (currentReadingCount >= 2) {
        setError("You cannot have more than 2 books 'reading' at the same time.");
        return;
      }
    }

    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;

      const updates: Partial<LibraryBook> = { status: newStatus };

      // Constraint: Wishlist books must have owned = false
      if (newStatus === "wishlist") {
        updates.owned = false;
      }

      // Constraint: Finished books must show finishedAt
      if (newStatus === "finished" && !entry.finishedAt) {
        updates.finishedAt = new Date().toISOString().split('T')[0];
      }

      return { ...entry, ...updates };
    }));
  };

  const updateRating = (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    setError(null);
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;

      // Constraint: Cannot rate books unless status is finished
      if (entry.status !== "finished") {
        setError("You can only rate finished books.");
        return entry;
      }

      return { ...entry, rating };
    }));
  };

  const toggleOwned = (id: string) => {
    setError(null);
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;

      const newOwned = !entry.owned;
      let newStatus = entry.status;

      // Constraint: Wishlist books must have owned = false
      if (newOwned && entry.status === "wishlist") {
        newStatus = "owned"; // Default to Owned/TBR
      }
      if (!newOwned && entry.status === "owned") {
        newStatus = "wishlist";
      }

      return { ...entry, owned: newOwned, status: newStatus };
    }));
  };

  const openBookForm = (bookId?: string) => {
    if (bookId) {
      setEditingId(bookId);
    } else {
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: BookFormValues) => {
    if (editingId) {
      // Edit Mode
      setBooks(prev => prev.map(b => b.id === editingId ? { ...b, title: data.title, author: data.author, coverUrl: data.coverUrl, description: data.description } : b));

      setLibrary(prev => prev.map(e => {
        if (e.bookId !== editingId) return e;
        return {
          ...e,
          status: data.status,
          priority: data.priority as any,
          owned: data.owned,
          rating: data.rating as any,
          notes: data.notes,
          // If status changed to finished, set finishedAt if missing
          finishedAt: data.status === 'finished' && !e.finishedAt ? new Date().toISOString().split('T')[0] : e.finishedAt
        };
      }));
    } else {
      // Add Mode
      const newBookId = uuidv4();
      const newEntryId = uuidv4();

      const newBook: Book = {
        id: newBookId,
        title: data.title,
        author: data.author,
        coverUrl: data.coverUrl,
        description: data.description,
      };

      const newEntry: LibraryBook = {
        id: newEntryId,
        bookId: newBookId,
        status: data.status,
        priority: data.priority as any,
        owned: data.owned,
        rating: data.rating as any,
        notes: data.notes,
        hooked: false,
        startedAt: data.status === 'reading' ? new Date().toISOString().split('T')[0] : undefined,
        finishedAt: data.status === 'finished' ? new Date().toISOString().split('T')[0] : undefined,
      };

      setBooks(prev => [newBook, ...prev]);
      setLibrary(prev => [newEntry, ...prev]);
    }
    setIsFormOpen(false);
  };

  const contextValue: LibraryContextType = {
    books,
    library,
    updateStatus,
    updateRating,
    toggleOwned,
    openBookForm
  };

  return (
    <BrowserRouter>
      {/* Global Error Toast */}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-sm animate-in fade-in slide-in-from-right-5 duration-300">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={() => setError(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Layout context={contextValue} />}>
          <Route index element={<Dashboard />} />
          <Route path="library" element={<Library />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>
      </Routes>

      <BookForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={initialFormData}
      />

    </BrowserRouter>
  );
}

export default App;
