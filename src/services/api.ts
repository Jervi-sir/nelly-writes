import { supabase } from "../lib/supabase";
import type { BookFormValues } from "../components/book-form";
import type { LibraryBook } from "../data/mockLibrary";

export const createBookAndEntry = async (
  bookId: string,
  entryId: string,
  data: BookFormValues
) => {
  // 1. Insert Book
  const { error: bookError } = await supabase.from("books").insert({
    id: bookId,
    title: data.title,
    author: data.author,
    cover_url: data.coverUrl,
    description: data.description,
  });

  if (bookError) throw bookError;

  // 2. Insert Library Entry
  const { error: libraryError } = await supabase.from("library").insert({
    id: entryId,
    book_id: bookId,
    status: data.status,
    owned: data.owned,
    priority: data.priority,
    rating: data.rating,
    notes: data.notes,
    started_at: data.status === "reading" ? new Date().toISOString().split("T")[0] : null,
    finished_at: data.status === "finished" ? new Date().toISOString().split("T")[0] : null,
    hooked: false, // Default
  });

  if (libraryError) {
    // Cleanup book if library insert fails to avoid orphans
    await supabase.from("books").delete().eq("id", bookId);
    throw libraryError;
  }
};

export const fetchLibraryData = async () => {
  const { data, error } = await supabase
    .from('library')
    .select(`
      *,
      book:books (
        *
      )
    `);

  if (error) throw error;
  return data;
};

export const updateBookAndEntry = async (
  bookId: string,
  data: BookFormValues,
  existingEntry: LibraryBook
) => {
  // 1. Update Book
  const { error: bookError } = await supabase
    .from("books")
    .update({
      title: data.title,
      author: data.author,
      cover_url: data.coverUrl,
      description: data.description,
    })
    .eq("id", bookId);

  if (bookError) throw bookError;

  // 2. Update Library Entry
  const updates: Record<string, unknown> = {
    status: data.status,
    owned: data.owned,
    priority: data.priority,
    rating: data.rating,
    notes: data.notes,
  };

  // Preserve existing dates or set new ones
  if (data.status === 'reading' && !existingEntry.startedAt) {
    updates.started_at = new Date().toISOString().split("T")[0];
  }
  if (data.status === 'finished' && !existingEntry.finishedAt) {
    updates.finished_at = new Date().toISOString().split("T")[0];
  }

  // Handle case where status changes away from connection to dates? 
  // Usually we keep the history, but if I reset 'finished' to 'reading', 
  // maybe I want to keep 'finishedAt' as null or keep previous?
  // Use logic from App.tsx:
  // "If status changed to finished, set finishedAt if missing"
  // It doesn't clear dates usually.

  const { error: libraryError } = await supabase
    .from("library")
    .update(updates)
    .eq("book_id", bookId);

  if (libraryError) throw libraryError;
};

export const updateDate = async (
  bookId: string,
  field: "started_at" | "finished_at",
  date: string | null
) => {
  const { error } = await supabase
    .from("library")
    .update({ [field]: date })
    .eq("book_id", bookId);

  if (error) throw error;
};

export const updateRating = async (
  bookId: string,
  rating: number | null
) => {
  const { error } = await supabase
    .from("library")
    .update({ rating })
    .eq("book_id", bookId);

  if (error) throw error;
};

export const updateNotes = async (
  bookId: string,
  notes: string | null
) => {
  const { error } = await supabase
    .from("library")
    .update({ notes })
    .eq("book_id", bookId);

  if (error) throw error;
};

export const updateRichNotes = async (
  bookId: string,
  richNotes: string | null
) => {
  const { error } = await supabase
    .from("library")
    .update({ rich_notes: richNotes })
    .eq("book_id", bookId);

  if (error) throw error;
};
export const deleteBookAndEntry = async (bookId: string) => {
  // 1. Get book info to clean up storage
  const { data: book } = await supabase
    .from("books")
    .select("cover_url")
    .eq("id", bookId)
    .single();

  if (book?.cover_url) {
    try {
      const url = new URL(book.cover_url);
      const parts = url.pathname.split('/');
      const bucket = "book"; // Default bucket
      const bucketIndex = parts.indexOf(bucket);

      if (bucketIndex > -1) {
        const filePath = parts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from(bucket).remove([filePath]);
      }
    } catch (error) {
      console.error("Error deleting cover image:", error);
    }
  }

  // 2. Delete Library Entry first
  const { error: libraryError } = await supabase
    .from("library")
    .delete()
    .eq("book_id", bookId);

  if (libraryError) throw libraryError;

  // 2. Delete Book
  const { error: bookError } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId);

  if (bookError) throw bookError;
};

export const updateStatus = async (
  bookId: string,
  status: string
) => {
  const { error } = await supabase
    .from("library")
    .update({ status })
    .eq("book_id", bookId);

  if (error) throw error;
};

export const updateOwnedStatus = async (
  bookId: string,
  owned: boolean,
  status: string
) => {
  const { error } = await supabase
    .from("library")
    .update({ owned, status })
    .eq("book_id", bookId);

  if (error) throw error;
}

export const fetchBookWithEntry = async (bookId: string) => {
  const { data, error } = await supabase
    .from('library')
    .select(`
      *,
      book:books (
        *
      )
    `)
    .eq('book_id', bookId)
    .single();

  if (error) throw error;
  return data;
};
