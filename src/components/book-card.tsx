import { StatusBadge } from "./status-badge";
import { RatingStars } from "./rating-stars";
import { Clock, Calendar, Bookmark, BookOpen, ChevronDown } from "lucide-react";
import type { Book, LibraryBook, ReadingStatus } from "../data/mockLibrary";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  entry: LibraryBook;
  onUpdateStatus: (newStatus: ReadingStatus) => void;
  onUpdateRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onToggleOwned: () => void;
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  wishlist: "Wishlist",
  owned: "Owned (TBR)",
  reading: "Reading",
  paused: "Paused",
  finished: "Finished",
  abandoned: "Abandoned",
};

export function BookCard({ book, entry, onUpdateStatus, onUpdateRating, onToggleOwned }: BookCardProps) {
  const isFinished = entry.status === "finished";

  return (
    <div className="group relative flex flex-row gap-4 p-4 rounded-xl bg-card border border-border hover:border-border/80 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 w-full">
      {/* Cover Image Section */}
      <div className="shrink-0 relative w-24 sm:w-32 aspect-[2/3] rounded-md overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 ring-1 ring-border/10">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground p-2 text-center">
            <BookOpen size={20} className="mb-1 opacity-50" />
            <span className="text-[10px] font-medium leading-tight">No Cover</span>
          </div>
        )}

        {/* Hooked Badge Overlay */}
        {entry.hooked && (
          <div className="absolute top-0 right-0 p-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <StatusBadge status={entry.status} />
              {entry.hooked && (
                <span className="hidden xs:inline-flex text-[10px] font-bold tracking-wider uppercase text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                  Hooked
                </span>
              )}
            </div>
            <h3 className="font-bold text-base sm:text-lg leading-tight text-foreground line-clamp-2" title={book.title}>
              {book.title}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 line-clamp-1">{book.author}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleOwned}
            className={cn(
              "h-8 w-8 shrink-0 transition-colors -mr-2 -mt-2",
              entry.owned ? "text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-700" : "text-muted-foreground/50 hover:text-foreground"
            )}
            title={entry.owned ? "Owned" : "Mark as Owned"}
          >
            <Bookmark className={cn("h-4 w-4", entry.owned && "fill-current")} />
          </Button>
        </div>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-muted-foreground my-3 font-medium">
          {entry.startedAt && (
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md whitespace-nowrap">
              <Clock size={10} />
              <span>{entry.startedAt}</span>
            </div>
          )}
          {isFinished && entry.finishedAt && (
            <div className="flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md whitespace-nowrap">
              <Calendar size={10} />
              <span>{entry.finishedAt}</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md whitespace-nowrap" title="Priority">
            <span className="text-primary font-bold">P{entry.priority}</span>
          </div>
        </div>

        {/* Description (Hide on very small screens if needed, mostly ok) */}
        {book.description && (
          <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-auto hidden sm:block">
            {book.description}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2 gap-x-2 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <RatingStars
              rating={entry.rating}
              onChange={onUpdateRating}
              disabled={!isFinished}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 ml-auto text-[10px] sm:text-xs font-medium px-2">
                <span className="truncate max-w-[80px] sm:max-w-none">{STATUS_LABELS[entry.status]}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={entry.status}
                onValueChange={(val) => onUpdateStatus(val as ReadingStatus)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <DropdownMenuRadioItem key={value} value={value} className="text-xs cursor-pointer">
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
