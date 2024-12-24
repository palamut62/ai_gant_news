-- Stored procedure to create the table
create or replace function create_ai_developments_table()
returns void
language plpgsql
as $$
begin
    -- Drop the table if it exists
    drop table if exists ai_developments;

    -- Create the table
    create table ai_developments (
        id bigint primary key generated always as identity,
        title text not null,
        description text,
        event_date timestamp with time zone not null,
        impact_score integer check (impact_score >= 0 and impact_score <= 10),
        created_at timestamp with time zone default now()
    );

    -- Add some indexes
    create index idx_ai_developments_event_date on ai_developments(event_date);
    create index idx_ai_developments_impact_score on ai_developments(impact_score);
end;
$$; 