import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Book, LibraryBook } from "../data/mockLibrary";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { ImageUpload } from "./image-upload";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  status: z.enum(["wishlist", "reading", "finished", "paused", "abandoned", "owned"]),
  priority: z.coerce.number().min(1).max(5),
  owned: z.boolean().default(false),
  rating: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export type BookFormValues = z.infer<typeof formSchema>;

interface BookFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BookFormValues) => void;
  initialData?: { book: Book; entry: LibraryBook } | null;
}

export function BookForm({ open, onOpenChange, onSubmit, initialData }: BookFormProps) {
  const methods = useForm<BookFormValues>({
    resolver: zodResolver(formSchema) as Resolver<BookFormValues>,
    defaultValues: {
      title: "",
      author: "",
      description: "",
      coverUrl: "",
      status: "wishlist",
      priority: 3,
      owned: false,
      notes: "",
      rating: undefined
    } as BookFormValues
  });

  useEffect(() => {
    if (initialData) {
      methods.reset({
        title: initialData.book.title,
        author: initialData.book.author || "",
        description: initialData.book.description || "",
        coverUrl: initialData.book.coverUrl || "",
        status: initialData.entry.status,
        priority: initialData.entry.priority,
        owned: initialData.entry.owned,
        rating: initialData.entry.rating,
        notes: initialData.entry.notes || ""
      });
    } else {
      methods.reset({
        title: "",
        author: "",
        description: "",
        coverUrl: "",
        status: "wishlist",
        priority: 3,
        owned: false,
        notes: "",
        rating: undefined
      });
    }
  }, [initialData, methods, open]);

  const onFormSubmit = (data: BookFormValues) => {
    onSubmit(data);
    onOpenChange(false);
    methods.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Book" : "Add New Book"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Make changes to your book entry here." : "Add a new book to your library."}
          </DialogDescription>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={methods.handleSubmit((data) => onFormSubmit(data as unknown as BookFormValues))} className="space-y-6">
            <div className="flex flex-col gap-6">
              {/* Left Column: Image */}
              <div className="shrink-0 flex justify-center">
                <FormField
                  // control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Cover Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column: Details */}
              <div className="flex-1 space-y-4">
                <FormField
                  // control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Book Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                // control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wishlist">Wishlist</SelectItem>
                        <SelectItem value="owned">Owned (TBR)</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="abandoned">Abandoned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  // control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Priority (1-5)</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? field.value.toString() : "3"}
                        defaultValue={field.value ? field.value.toString() : "3"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="3" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              // control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description or synopsis..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
