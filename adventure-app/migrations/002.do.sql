CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY,
  quote TEXT NOT NULL,
  said_by VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  movie_id INTEGER NOT NULL REFERENCES movies(id)
);
