import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ReadingStatus } from "../data/mockLibrary";
import { BookCard } from "../components/book-card";
import type { LibraryContextType } from "../app";
import { SortAsc, SortDesc } from "lucide-react";

export default function Library() {
  const { books, library, updateStatus, updateRating, toggleOwned } = useOutletContext<LibraryContextType>();

  // Filters State
  const [filterStatus, setFilterStatus] = useState<ReadingStatus | "all">("all");
  const [filterOwned, setFilterOwned] = useState<"all" | "owned" | "not-owned">("all");
  const [sortOrder, setSortOrder] = useState<"priority" | "recent">("recent");

  // Filter Logic
  const filteredLibrary = library.filter((entry) => {
    if (filterStatus !== "all" && entry.status !== filterStatus) return false;
    if (filterOwned === "owned" && !entry.owned) return false;
    if (filterOwned === "not-owned" && entry.owned) return false;
    return true;
  });

  // Sort Logic
  const sortedLibrary = [...filteredLibrary].sort((a, b) => {
    if (sortOrder === "priority") {
      // High priority first (5 -> 1)
      return b.priority - a.priority;
    } else {
      // Recent (by finishedAt if finished, or general id/misc)
      // For mock, we can just use ID or simulate relevance.
      // Let's use Priority as secondary sort.
      // Or simply index order.
      // Real app would sort by `updatedAt`.
      return 0;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">{filteredLibrary.length} books found</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReadingStatus | "all")}
              className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent/50 focus:ring-1 focus:ring-ring outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="reading">Reading</option>
              <option value="finished">Finished</option>
              <option value="wishlist">Wishlist</option>
              <option value="paused">Paused</option>
              <option value="abandoned">Abandoned</option>
              <option value="owned">Owned (TBR)</option>
            </select>
          </div>

          {/* Owned Filter */}
          <div className="relative">
            <select
              value={filterOwned}
              onChange={(e) => setFilterOwned(e.target.value as "all" | "owned" | "not-owned")}
              className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent/50 focus:ring-1 focus:ring-ring outline-none appearance-none cursor-pointer"
            >
              <option value="all">Ownership</option>
              <option value="owned">Owned</option>
              <option value="not-owned">Not Owned</option>
            </select>
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(prev => prev === "priority" ? "recent" : "priority")}
            className="h-9 px-3 flex items-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent/50 transition-colors"
          >
            {sortOrder === "priority" ? <SortDesc size={16} /> : <SortAsc size={16} />}
            <span>{sortOrder === "priority" ? "Priority" : "Default"}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedLibrary.map((entry) => {
          const book = books.find(b => b.id === entry.bookId)!;
          return (
            <BookCard
              key={entry.id}
              book={book}
              entry={entry}
              onUpdateStatus={(s) => updateStatus(entry.id, s)}
              onUpdateRating={(r) => updateRating(entry.id, r)}
              onToggleOwned={() => toggleOwned(entry.id)}
            />
          );
        })}
        {sortedLibrary.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No books match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
