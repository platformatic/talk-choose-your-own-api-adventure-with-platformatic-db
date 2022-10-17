/// <reference path="./global.d.ts" />
'use strict'

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function (app) {
  app.graphql.extendSchema(`
    extend type Query {
      topQuotes: [Quote]
    }

    extend type Mutation {
      likeQuote(id: ID!): Int
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
    },
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
}
