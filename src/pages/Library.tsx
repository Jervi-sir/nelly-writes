import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReadingStatus } from "../data/mockLibrary";
import { BookCard } from "../components/book-card";
import { SortAsc, SortDesc, Plus, Search, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "../hooks/use-library";
import { BookForm } from "../components/book-form";

export default function Library() {
  const {
    books,
    library,
    updateStatus,
    updateRating,
    toggleOwned,
    openBookForm,
    deleteBook,
    searchLibrary,
    isFormOpen,
    setIsFormOpen,
    handleFormSubmit,
    initialFormData,
    loading,
    error
  } = useLibrary();

  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State - Initialize from URL
  const [filterStatus, setFilterStatus] = useState<ReadingStatus | "all">((searchParams.get("status") as ReadingStatus | "all") || "all");
  const [sortOrder, setSortOrder] = useState<"priority" | "recent">("recent");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Trigger search when debounced query changes
  useEffect(() => {
    searchLibrary(debouncedQuery);
  }, [debouncedQuery, searchLibrary]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect, just prevent form restart
  }

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
      return 0;
    }
  });

  const isSearchActive = searchInput.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Library</h1>
            <p className="text-muted-foreground">{loading ? "Updating..." : `${filteredLibrary.length} books found`}</p>
          </div>
          <Button onClick={() => openBookForm()} size="sm" className="gap-2 rounded-full">
            <Plus size={16} /> Add Book
          </Button>
        </div>
        {error && <div className="text-red-500">{error}</div>}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className={`relative transition-[width,flex] duration-300 ease-in-out ${isSearchActive ? 'w-full' : 'flex-1'}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search title/author..."
              className="pl-8 h-9 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {loading && (
              <div className="absolute right-2.5 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </form>

          {/* Status Filter - Hidden when searching */}
          {!isSearchActive && (
            <div className="relative w-[180px] animate-in fade-in zoom-in duration-300">
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
          )}

          {/* Sort - Hidden when searching */}
          {!isSearchActive && (
            <button
              onClick={() => setSortOrder(prev => prev === "priority" ? "recent" : "priority")}
              className="h-9 px-3 flex items-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent/50 transition-colors animate-in fade-in zoom-in duration-300"
            >
              {sortOrder === "priority" ? <SortDesc size={16} /> : <SortAsc size={16} />}
              <span>{sortOrder === "priority" ? "Priority" : "Default"}</span>
            </button>
          )}
        </div>
      </header>

      <div className={`grid grid-cols-1 gap-6 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {sortedLibrary.map((entry) => {
          const book = books.find(b => b.id === entry.bookId);
          if (!book) return null; // Should not happen
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
        {sortedLibrary.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No books match your filters.
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
