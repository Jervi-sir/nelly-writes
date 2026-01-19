import { useState } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from './components/layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Wishlist from './pages/Wishlist';
import { books as initialBooks, libraryBooks as initialLibrary } from './data/mockLibrary';
import type { ReadingStatus, LibraryBook, Book } from './data/mockLibrary';

/* Type for the Context */
export type LibraryContextType = {
  books: Book[];
  library: LibraryBook[];
  updateStatus: (id: string, status: ReadingStatus) => void;
  updateRating: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  toggleOwned: (id: string) => void;
};

function App() {
  // State
  const [library, setLibrary] = useState<LibraryBook[]>(initialLibrary);
  const [error, setError] = useState<string | null>(null);

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

      // Clear finishedAt if moving away from finished? Maybe?
      // Prompt says "Finished books must show finishedAt", doesn't explicitly say clear it.
      // But typically if you restart reading, you might clear it?
      // I'll leave it to be safe or set to undefined if moving to reading?
      // Let's keep data preservation unless logic dictates otherwise.

      return { ...entry, ...updates };
    }));
  };

  const updateRating = (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    setError(null);
    setLibrary(prev => prev.map(entry => {
      if (entry.id !== id) return entry;

      // Constraint: Cannot rate books unless status is finished
      if (entry.status !== "finished") {
        // Should ideally be prevented by UI too
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
      // If we mark as owned, it can't be wishlist anymore.
      if (newOwned && entry.status === "wishlist") {
        newStatus = "owned"; // Default to Owned/TBR
      }
      // If we mark as NOT owned, and it was "owned", maybe move to wishlist?
      // Or just stay "owned" status but owned=false? That makes no sense.
      // If status is "owned" (meaning TBR) and we uncheck owned, it feels like it becomes Wishlist?
      if (!newOwned && entry.status === "owned") {
        newStatus = "wishlist";
      }

      return { ...entry, owned: newOwned, status: newStatus };
    }));
  };

  const contextValue: LibraryContextType = {
    books: initialBooks, // Read-only metadata
    library,
    updateStatus,
    updateRating,
    toggleOwned
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

      {/* Pass context via Outlet context in Route element? No, Routing structure separates them. */}
      {/* We need to wrap Routes with a Context Provider if we used Context, but here we are using Outlet context. */}
      {/* Wait, Outlet context is passed from the Layout component via <Outlet context={...} /> */}
      {/* Layout is inside Route element. Layout doesn't have access to these props unless we pass them or wrap Browser Router inside App content? */}
      {/* App has the state. Helper: I can't pass props to Layout easily with Route element syntax without a wrapper. */}

    </BrowserRouter>
  );
}

export default App;
