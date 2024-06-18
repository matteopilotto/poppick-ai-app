create table movies_tmdb (
  id bigserial primary key,
  tmdb_id integer,
  title text,
  release_date text,
  genres text[],
  description text,
  poster text,
  rating float,
  context text,
  embedding vector(1536)
)