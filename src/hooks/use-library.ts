import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ReadingStatus, LibraryBook, Book } from '../data/mockLibrary';
import type { BookFormValues } from '../components/book-form';
import {
  createBookAndEntry,
  updateBookAndEntry,
  fetchLibraryData,
  deleteBookAndEntry,
  updateRating as apiUpdateRating,
  updateNotes as apiUpdateNotes,
  updateRichNotes as apiUpdateRichNotes,
  updateDate as apiUpdateDate,
  updateStatus as apiUpdateStatus,
  updateOwnedStatus as apiUpdateOwnedStatus
} from '../services/api';

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const data = await fetchLibraryData(query);

      if (!data) {
        setBooks([]);
        setLibrary([]);
        return;
      }

      const loadedBooks: Book[] = [];
      const loadedLibrary: LibraryBook[] = [];

      data.forEach((row: any) => {
        if (row.book) {
          loadedBooks.push({
            id: row.book.id,
            title: row.book.title,
            author: row.book.author,
            coverUrl: row.book.cover_url || undefined,
            description: row.book.description || undefined,
          });
        }

        loadedLibrary.push({
          id: row.id,
          bookId: row.book_id,
          status: row.status,
          owned: row.owned,
          priority: row.priority,
          rating: (row.rating || undefined) as 1 | 2 | 3 | 4 | 5 | undefined,
          notes: row.notes || undefined,
          richNotes: row.rich_notes || undefined,
          hooked: row.hooked,
          startedAt: row.started_at || undefined,
          finishedAt: row.finished_at || undefined,
        });
      });

      const uniqueBooks = Array.from(new Map(loadedBooks.map(b => [b.id, b])).values());
      setBooks(uniqueBooks);
      setLibrary(loadedLibrary);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch library:", err);
      setError("Failed to load library data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const searchLibrary = useCallback((query: string) => {
    fetchData(query);
  }, [fetchData]);

  const updateStatus = async (id: string, newStatus: ReadingStatus) => {
    setError(null);

    // Constraint: Max 2 books can have status "reading"
    if (newStatus === "reading") {
      const currentReadingCount = library.filter(b => b.status === "reading" && b.id !== id).length;
      if (currentReadingCount >= 2) {
        setError("You cannot have more than 2 books 'reading' at the same time.");
        return;
      }
    }

    // Optimistic update
    const previousLibrary = [...library];
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      const updates: Partial<LibraryBook> = { status: newStatus };
      if (newStatus === "wishlist") updates.owned = false;
      if (newStatus === "finished" && !entry.finishedAt) updates.finishedAt = new Date().toISOString().split('T')[0];
      return { ...entry, ...updates };
    }));

    try {
      const entry = library.find(e => e.id === id);
      if (!entry) return;
      await apiUpdateStatus(entry.bookId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      setLibrary(previousLibrary); // Rollback
      setError("Failed to update status.");
    }
  };

  const updateRating = async (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    // Optimistic
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      return { ...entry, rating };
    }));

    const entry = library.find(e => e.id === id);
    if (!entry) return;

    try {
      await apiUpdateRating(entry.bookId, rating);
    } catch (err) {
      console.error(err);
      setError("Failed to update rating");
    }
  };

  const updateDate = async (id: string, field: "startedAt" | "finishedAt", date: string | null) => {
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      return { ...entry, [field]: date };
    }));

    const entry = library.find(e => e.id === id);
    if (!entry) return;

    try {
      await apiUpdateDate(entry.bookId, field === "startedAt" ? "started_at" : "finished_at", date);
    } catch (err) {
      console.error(err);
      setError("Failed to update date");
    }
  };

  const updateNotes = async (id: string, notes: string | null) => {
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      return { ...entry, notes: notes || undefined };
    }));
    const entry = library.find(e => e.id === id);
    if (!entry) return;
    try {
      await apiUpdateNotes(entry.bookId, notes);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRichNotes = async (id: string, richNotes: string | null) => {
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      return { ...entry, richNotes: richNotes || undefined };
    }));
    const entry = library.find(e => e.id === id);
    if (!entry) return;
    try {
      await apiUpdateRichNotes(entry.bookId, richNotes);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOwned = async (id: string) => {
    const entry = library.find(e => e.id === id);
    if (!entry) return;

    const newOwned = !entry.owned;
    let newStatus = entry.status;
    if (newOwned && entry.status === "wishlist") newStatus = "owned";
    if (!newOwned && entry.status === "owned") newStatus = "wishlist";

    // Optimistic
    setLibrary(prev => prev.map(e => {
      if (e.id !== id) return e;
      return { ...e, owned: newOwned, status: newStatus };
    }));

    try {
      await apiUpdateOwnedStatus(entry.bookId, newOwned, newStatus);
    } catch (err) {
      console.error(err);
      // Revert...
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    try {
      await deleteBookAndEntry(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
      setLibrary(prev => prev.filter(e => e.bookId !== bookId));
    } catch (err) {
      console.error("Failed to delete book:", err);
      setError(err instanceof Error ? err.message : "Failed to delete book.");
    }
  };

  // Form Handlers
  const openBookForm = (bookId?: string) => {
    setEditingId(bookId || null);
    setIsFormOpen(true);
  };

  const editingEntry = editingId ? library.find(e => e.bookId === editingId) : null;
  const editingBook = editingId ? books.find(b => b.id === editingId) : null;
  const initialFormData = editingEntry && editingBook ? { book: editingBook, entry: editingEntry } : null;

  const handleFormSubmit = async (data: BookFormValues) => {
    try {
      if (editingId) {
        if (!editingEntry) return;
        await updateBookAndEntry(editingId, data, editingEntry);
        // Optimistic update of local state
        setBooks(prev => prev.map(b => b.id === editingId ? { ...b, title: data.title, author: data.author, coverUrl: data.coverUrl, description: data.description } : b));
        setLibrary(prev => prev.map(e => {
          if (e.bookId !== editingId) return e;
          // Logic from App.tsx
          return {
            ...e,
            status: data.status,
            priority: data.priority as 1 | 2 | 3 | 4 | 5,
            owned: data.owned,
            rating: data.rating as 1 | 2 | 3 | 4 | 5 | undefined,
            notes: data.notes,
            finishedAt: data.status === 'finished' && !e.finishedAt ? new Date().toISOString().split('T')[0] : e.finishedAt,
            startedAt: data.status === 'reading' && !e.startedAt ? new Date().toISOString().split('T')[0] : e.startedAt
          };
        }));

      } else {
        const newBookId = uuidv4();
        const newEntryId = uuidv4();
        await createBookAndEntry(newBookId, newEntryId, data);
        fetchData(); // Simplest to refetch or manually add to state
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to save book:", err);
      setError(err instanceof Error ? err.message : "Failed to save book.");
    }
  };

  return {
    books,
    library,
    loading,
    error,
    searchLibrary,
    updateStatus,
    updateRating,
    updateDate,
    updateNotes,
    updateRichNotes,
    toggleOwned,
    deleteBook,
    // Form
    isFormOpen,
    setIsFormOpen,
    openBookForm,
    handleFormSubmit,
    initialFormData
  };
}
