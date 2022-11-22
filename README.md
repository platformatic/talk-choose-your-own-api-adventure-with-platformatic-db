# talk-choose-your-own-api-adventure-with-platformatic-db

## Steps: Before the talk

```bash
mkdir adventure-app

cd adventure-app

npm init --yes

npm install platformatic
```

- [ ] Open project in VS Code
  - [ ] Open `package.json`
	- [ ] Open terminal
	- [ ] Toggle on Screencast Mode
- [ ] Open Firefox

## Steps: Live

### Create a Platformatic DB application

```bash
# Create an initial Platformatic DB application
npx platformatic db init

# Copy paste command to install dependencies for types

# Explore platformatic.db.json

# Explore migrations

# Run migration
npx platformatic db migrate

# Start the server
npx platformatic db start

# Click on URL in terminal to open in browser

# Explore REST API documentation: /documentation

# Create a new movie: POST /movies

# Request all movies with cURL
curl http://127.0.0.1:3042/movies/ --verbose
```

### Add movie quotes

```sql
-- Create 002.do.sql in migrations directory

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY,
  quote TEXT NOT NULL,
  said_by VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  movie_id INTEGER NOT NULL REFERENCES movies(id)
);
```

```sql
-- Create 002.undo.sql in migrations directory

DROP TABLE quotes;
```

```bash
# Apply migrations
npx platformatic db migrate

# Restart the server
touch platformatic.db.json

# Refresh /documentation in the browser

# Explore nested relationships

# Explore /graphiql

# Look at docs in sidebar
```

```graphql
# Add query to get all quotes
query getAllQuotes {
  quotes {
    id
    quote
    saidBy
    movie {
      title
    }
  }
}

# Run getAllQuotes query

# Add mutation to create a quote
mutation createQuote {
  saveQuote(
    input: {movieId: 1, quote: "Toto, I don't think we're in Kansas anymore", saidBy: "Dorothy"}
  ) {
    id
    quote
    saidBy
    movie {
      title
    }
  }
}

# Run createQuote mutation
```

```bash
# Request all quotes with curl
curl http://127.0.0.1:3042/quotes/ --verbose
```

### Add custom functionality

```sql
-- Create 003.do.sql in migrations directory

ALTER TABLE quotes ADD COLUMN likes INTEGER default 0;
```

```sql
-- Create 003.undo.sql in migrations directory

ALTER TABLE quotes DROP COLUMN quotes;
```

```bash
# Apply migrations
npx platformatic db migrate

# Restart the server
touch platformatic.db.json

# Re-fetch GraphQL schema in GraphiQL

# Add `likes` to getAllQuotes query

# Explore platformatic.db.json and plugin.js

# Explore types in global.d.ts
```

```javascript
// Add a new query to the GraphQL schema in plugin.js

// Use an SQL Mapper entity to retrieve database records.

app.graphql.extendSchema(`
  extend type Query {
    topQuotes: [Quote]
  }
`)

app.graphql.defineResolvers({
  Query: {
    topQuotes: async () => {
      return await app.platformatic.entities.quote.find({
        where: {
          likes: {
            gte: 3
          }
        }
      })
    }
  }
})
```

```graphql
# Re-fetch GraphQL schema in GraphiQL

query getTopQuotes {
  topQuotes {
    id
    quote
    saidBy
    likes
    movie {
      title
    }
  }
}
```

```javascript
// Add a new mutation to the GraphQL schema in plugin.js

// Use the SQL Mapper database wrapper and query builder
// to update a database record.

app.graphql.extendSchema(`
  // ...

  extend type Mutation {
    likeQuote(id: ID!): Int
  }
`)

app.graphql.defineResolvers({
  // ...,
  Mutation: {
    likeQuote: async (_, { id }) => {
      const { db, sql } = app.platformatic

      const result = await db.query(sql`
        UPDATE quotes SET likes = likes + 1 WHERE id=${id} RETURNING likes
      `)

      return result[0]?.likes
    }
  }
})
```

```graphql
# Re-fetch GraphQL schema in GraphiQL

# Run the getTopQuotes query

mutation likeWizardOfOzQuote {
  likeQuote(id: 1)
}

# Run the likeWizardOfOzQuote mutation 4 times

# Run the getTopQuotes query
```
