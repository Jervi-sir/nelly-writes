import { Link, Outlet, useLocation } from "react-router-dom";
import { Book, Menu, Plus } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { LibraryContextType } from "../app";

interface LayoutProps {
  context?: LibraryContextType;
}

export function Layout({ context }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Library", path: "/library" },
    { label: "Wishlist", path: "/wishlist" },
  ];

  return (
    // Restricted width wrapper to simulate mobile device on desktop
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 max-w-md mx-auto border-x border-border shadow-2xl">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Book size={20} />
              </div>
              <span>NellyReads</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-2 h-9 rounded-full px-3"
                onClick={() => context?.openBookForm?.()}
              >
                <Plus size={16} />
                <span className="sr-only">Add Book</span> {/* Icon only for mobile look */}
              </Button>
              <ModeToggle />
            </div>

            {/* Mobile Nav - Always Visible */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`w-full cursor-pointer ${location.pathname === item.path ? "font-bold text-primary" : ""}`}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => context?.openBookForm?.()} className="font-bold text-primary cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" /> Add Book
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mx-auto animate-in fade-in duration-500">
          <Outlet context={context} />
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 Nelly Reads.</p>
      </footer>
    </div>
  );
}
