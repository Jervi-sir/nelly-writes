import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Pen, Trash2 } from "lucide-react";
import type { LibraryContextType } from "../app";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

import { RatingStars } from "@/components/rating-stars";

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, library, updateRating, updateDate, openBookForm, deleteBook } = useOutletContext<LibraryContextType>();

  const book = books.find(b => b.id === id);
  const entry = library.find(e => e.bookId === id);

  if (!book || !entry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Book not found.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Back
      </Button>

      <div className="flex flex-col gap-8 items-start">
        {/* Left Column: Cover & Quick Actions */}
        <div className="w-full shrink-0 space-y-4">
          <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-border/50 bg-muted relative">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <span className="text-sm">No Cover</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button className="w-full" variant="outline" onClick={() => openBookForm(book.id)}>
              <Pen className="mr-2 h-4 w-4" /> Edit Details
            </Button>

            <Button
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              variant="outline"
              onClick={() => {
                deleteBook(book.id);
                navigate(-1);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Book
            </Button>

            {/* Status Select could go here or just badge */}
            <div className="flex justify-center pt-2">
              <StatusBadge status={entry.status} />
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground font-medium">{book.author}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-card border border-border/50 rounded-xl">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Priority</span>
              <div className="font-bold text-lg">P{entry.priority}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Rating</span>
              <div className="flex items-center gap-1">
                {entry.rating ? (
                  <>
                    <span className="font-bold text-lg">{entry.rating}</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  </>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Started</span>
              <div className="pt-1">
                <input
                  type="date"
                  className="bg-transparent text-sm font-medium w-full focus:outline-none focus:ring-1 focus:ring-ring rounded px-1"
                  value={entry.startedAt || ""}
                  onChange={(e) => updateDate(entry.id, "startedAt", e.target.value || null)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Finished</span>
              <div className="pt-1">
                <input
                  type="date"
                  className="bg-transparent text-sm font-medium w-full focus:outline-none focus:ring-1 focus:ring-ring rounded px-1"
                  value={entry.finishedAt || ""}
                  onChange={(e) => updateDate(entry.id, "finishedAt", e.target.value || null)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Synopsis</h3>
            <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
              {book.description || "No description available."}
            </p>
          </div>

          {/* Editors */}
          {/* <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="text-lg font-semibold">My Notes</h3>
            <NotesEditor
              initialNotes={entry.richNotes || entry.notes}
              onSave={(notes) => updateRichNotes(entry.id, notes)}
            />
          </div> */}
        </div>

        {/* Interactive Rating (if finished) */}
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-sm font-semibold mb-3">Your Rating</h3>
          <div className="flex">
            <RatingStars
              rating={entry.rating}
              onChange={(r) => updateRating(entry.id, r)}
              size={24}
            />
          </div>
        </div>

      </div>
    </div>

  );
}
