```
-- Allow anyone to upload to the book bucket
create policy "Public upload book"
on storage.objects
for insert
to public
with check (bucket_id = 'book');

-- Allow anyone to delete from the book bucket
create policy "Public delete book"
on storage.objects
for delete
to public
using (bucket_id = 'book');
```

```
-- Allow anyone to read book images
create policy "Public read book"
on storage.objects
for select
to public
using (bucket_id = 'book');
```

```
create policy "Public delete recent book uploads"
on storage.objects
for delete
to public
using (
  bucket_id = 'book'
  AND created_at > now() - interval '10 minutes'
);
```