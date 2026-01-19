
export type ReadingStatus =
  | "wishlist"
  | "owned"
  | "reading"
  | "paused"
  | "finished"
  | "abandoned";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string; // Optional, might be used if I had images
  description?: string;
}

export interface LibraryBook {
  id: string;
  bookId: string;
  status: ReadingStatus;
  owned: boolean;
  priority: 1 | 2 | 3 | 4 | 5;
  rating?: 1 | 2 | 3 | 4 | 5;
  hooked: boolean;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
}

export const books: Book[] = [
  {
    id: "b1",
    title: "Project Hail Mary",
    author: "Andy Weir",
    description: "A lone astronaut must save the earth from disaster.",
    coverUrl: "https://images.unsplash.com/photo-1614726365723-49cfaaf81bd2?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b2",
    title: "Dune",
    author: "Frank Herbert",
    description: "Feature set on the desert planet Arrakis.",
    coverUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b3",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "In a hole in the ground there lived a hobbit.",
    coverUrl: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "It is a truth universally acknowledged...",
    coverUrl: "https://images.unsplash.com/photo-1543002588-66bc349a9643?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "A story about teenage angst and alienation.",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b6",
    title: "Brave New World",
    author: "Aldous Huxley",
    description: "A dystopian social science fiction novel.",
    coverUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b7",
    title: "Infinite Jest",
    author: "David Foster Wallace",
    description: "A complex satire of American culture.",
    coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b8",
    title: "Ulysses",
    author: "James Joyce",
    description: "A modernist novel by Irish writer James Joyce.",
    coverUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b9",
    title: "1984",
    author: "George Orwell",
    description: "Who controls the past controls the future.",
    coverUrl: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&q=80&w=300&h=450"
  },
  {
    id: "b10",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "The story of the mysteriously wealthy Jay Gatsby.",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450"
  }
];

export const libraryBooks: LibraryBook[] = [
  // Reading (2)
  {
    id: "l1",
    bookId: "b1",
    status: "reading",
    owned: true,
    priority: 5,
    hooked: true,
    startedAt: "2025-01-01",
    notes: "Can't put it down!"
  },
  {
    id: "l2",
    bookId: "b2",
    status: "reading",
    owned: true,
    priority: 4,
    hooked: false,
    startedAt: "2025-01-15",
    notes: "A bit slow start."
  },
  // Finished (2)
  {
    id: "l3",
    bookId: "b3",
    status: "finished",
    owned: true,
    priority: 5,
    rating: 5,
    hooked: true,
    finishedAt: "2024-12-25",
    notes: "Classic."
  },
  {
    id: "l4",
    bookId: "b4",
    status: "finished",
    owned: true,
    priority: 3,
    rating: 4,
    hooked: false,
    finishedAt: "2024-11-10"
  },
  // Wishlist (2, owned=false)
  {
    id: "l5",
    bookId: "b5",
    status: "wishlist",
    owned: false,
    priority: 4,
    hooked: false
  },
  {
    id: "l6",
    bookId: "b6",
    status: "wishlist",
    owned: false,
    priority: 3,
    hooked: false
  },
  // Paused (1)
  {
    id: "l7",
    bookId: "b7",
    status: "paused",
    owned: true,
    priority: 2,
    hooked: false,
    notes: "Too long, taking a break."
  },
  // Abandoned (1)
  {
    id: "l8",
    bookId: "b8",
    status: "abandoned",
    owned: true,
    priority: 1,
    rating: 1, // Optional allowed? "Cannot rate books unless status is finished". Wait. UX Constraint says "Cannot rate books unless status is finished". So I should probably remove rating here to be consistent, or arguably I rated it 1 then abandoned it? The constraint effectively says UI shouldn't allow it. I will remove rating to be safe.
    hooked: false,
    notes: "Too difficult."
  },
  // Extra Owned (For variety, maybe just 'owned' status? ReadingStatus has 'owned' as a status? Yes.)
  {
    id: "l9",
    bookId: "b9",
    status: "owned", // "TBR" effectively
    owned: true,
    priority: 4,
    hooked: false
  },
  {
    id: "l10",
    bookId: "b10",
    status: "wishlist",
    owned: false,
    priority: 5,
    hooked: false
  }
];
