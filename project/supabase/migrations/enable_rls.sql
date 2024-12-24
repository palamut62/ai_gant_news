-- Enable RLS
alter table ai_developments enable row level security;

-- Create policy for anonymous access
create policy "Allow anonymous access to ai_developments"
  on ai_developments
  for select
  to anon
  using (true);

-- Verify the table exists and has data
do $$
declare
  row_count integer;
begin
  select count(*) into row_count from ai_developments;
  raise notice 'Number of rows in ai_developments: %', row_count;
end $$; 