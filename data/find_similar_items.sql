DROP FUNCTION match_moviews_tmdb;

create or replace function match_moviews_tmdb (
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)

returns table (
    id bigint,
    tmdb_id integer,
    title text,
    release_date text,
    genres text[],
    description text,
    poster text,
    rating float,
    context text,
    similarity float
)

language sql stable
as $$
    select
        id
        , tmdb_id
        , title
        , release_date
        , genres
        , description
        , poster
        , rating
        , context
        , 1 - (embedding <=> query_embedding) as similarity
    from movies_tmdb
    where 1 - (embedding <=> query_embedding) > match_threshold
    order by (embedding <=> query_embedding) asc
    limit match_count;
$$;