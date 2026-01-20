import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from './components/layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Wishlist from './pages/Wishlist';
import BookDetails from './pages/BookDetails';

import type { ReadingStatus, LibraryBook, Book } from './data/mockLibrary';
import { BookForm, type BookFormValues } from './components/book-form';
import { v4 as uuidv4 } from 'uuid';
import { createBookAndEntry, updateBookAndEntry, fetchLibraryData } from './services/api';

/* Type for the Context */
export type LibraryContextType = {
  books: Book[];
  library: LibraryBook[];
  updateStatus: (id: string, status: ReadingStatus) => void;
  updateRating: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  updateDate: (id: string, field: "startedAt" | "finishedAt", date: string | null) => void;
  toggleOwned: (id: string) => void;
  openBookForm: (bookId?: string) => void;
};

function App() {
  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    fetchLibraryData().then((data) => {
      if (!data) return;

      const loadedBooks: Book[] = [];
      const loadedLibrary: LibraryBook[] = [];

      data.forEach((row: any) => {
        // Map Book
        if (row.book) {
          loadedBooks.push({
            id: row.book.id,
            title: row.book.title,
            author: row.book.author,
            coverUrl: row.book.cover_url,
            description: row.book.description,
          });
        }

        // Map Library Entry
        loadedLibrary.push({
          id: row.id,
          bookId: row.book_id,
          status: row.status,
          owned: row.owned,
          priority: row.priority,
          rating: row.rating,
          notes: row.notes,
          hooked: row.hooked,
          startedAt: row.started_at,
          finishedAt: row.finished_at,
        });
      });

      setBooks(() => {
        // Merge invalidating mocks? Or just replace?
        // Replacing is better to show DB truth.
        // But duplicate handling? Distinct books.
        // We can use a map to dedupe if multiple entries point to same book?
        // In this app structure 1 entry = 1 book usually?
        // But row.book might be duplicated if we had multiple library entries for same book? (Not allowed by logic usually but possible in DB).
        // Let's unique-ify books by ID.
        const uniqueBooks = Array.from(new Map(loadedBooks.map(b => [b.id, b])).values());
        return uniqueBooks;
      });
      setLibrary(loadedLibrary);

    }).catch(err => {
      console.error("Failed to fetch library:", err);
      // Optional: setError("Failed to load library data.");
    });
  }, []);

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

    // Find entry to get bookId
    const entry = library.find(e => e.id === id);
    if (!entry || entry.status !== "finished") return;

    // API Call
    import('./services/api').then(({ updateRating }) => {
      updateRating(entry.bookId, rating).catch(err => {
        console.error("Failed to update rating:", err);
        setError("Failed to update rating.");
      });
    });
  };

  const updateDate = (id: string, field: "startedAt" | "finishedAt", date: string | null) => {
    setError(null);

    // Optimistic Update
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      return { ...entry, [field]: date };
    }));

    // Find entry to get bookId
    const entry = library.find(e => e.id === id);
    if (!entry) return;

    // API Call
    import('./services/api').then(({ updateDate }) => {
      updateDate(entry.bookId, field === "startedAt" ? "started_at" : "finished_at", date).catch(err => {
        console.error("Failed to update date:", err);
        setError("Failed to update date.");
        // Revert? For now simple error toast.
      });
    });
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

  const handleFormSubmit = async (data: BookFormValues) => {
    try {
      if (editingId) {
        // Edit Mode
        if (!editingEntry) return;

        await updateBookAndEntry(editingId, data, editingEntry);

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
            finishedAt: data.status === 'finished' && !e.finishedAt ? new Date().toISOString().split('T')[0] : e.finishedAt,
            // If status changed to reading, set startedAt if missing
            startedAt: data.status === 'reading' && !e.startedAt ? new Date().toISOString().split('T')[0] : e.startedAt
          };
        }));
      } else {
        // Add Mode
        const newBookId = uuidv4();
        const newEntryId = uuidv4();

        await createBookAndEntry(newBookId, newEntryId, data);

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
    } catch (err: any) {
      console.error("Failed to save book:", err);
      setError(err.message || "Failed to save book. Please try again.");
    }
  };

  const contextValue: LibraryContextType = {
    books,
    library,
    updateStatus,
    updateRating,
    updateDate, // Add this
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
          <Route path="book/:id" element={<BookDetails />} />
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
