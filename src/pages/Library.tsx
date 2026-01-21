import { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import type { ReadingStatus } from "../data/mockLibrary";
import { BookCard } from "../components/book-card";
import type { LibraryContextType } from "../app";
import { SortAsc, SortDesc } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Library() {
  const { books, library, updateStatus, updateRating, toggleOwned, openBookForm, deleteBook } = useOutletContext<LibraryContextType>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State - Initialize from URL
  const [filterStatus, setFilterStatus] = useState<ReadingStatus | "all">((searchParams.get("status") as ReadingStatus | "all") || "all");
  const [sortOrder, setSortOrder] = useState<"priority" | "recent">("recent");

  // Sync state to URL when changed (optional, but good UX)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (filterStatus && filterStatus !== "all") {
      params.set("status", filterStatus);
    } else {
      params.delete("status");
    }

    setSearchParams(params, { replace: true });
  }, [filterStatus, searchParams, setSearchParams]);

  // Filter Logic
  const filteredLibrary = library.filter((entry) => {
    if (filterStatus !== "all" && entry.status !== filterStatus) return false;
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
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">{filteredLibrary.length} books found</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative flex-1">
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as ReadingStatus | "all")
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="wishlist">Wishlist</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                  <SelectItem value="owned">Owned (TBR)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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

      <div className="grid grid-cols-1 gap-6">
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
              onEdit={() => openBookForm?.(book.id)}
              onDelete={() => deleteBook(book.id)}
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
