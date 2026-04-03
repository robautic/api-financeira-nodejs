import { knex } from '../database.js'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { authenticate } from '../plugins/authenticate.js'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const userId = (request.user as { id: string }).id

      const transactions = await knex('transactions')
        .where('user_id', userId)
        .select()

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)
      const userId = (request.user as { id: string }).id

      const transaction = await knex('transactions')
        .where({
          user_id: userId,
          id,
        })
        .first()

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const userId = (request.user as { id: string }).id

      const summary = await knex('transactions')
        .where('user_id', userId)
        .sum({ amount: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })

      const { title, amount, type } = createTransactionBodySchema.parse(
        request.body,
      )

      const userId = (request.user as { id: string }).id

      await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        user_id: userId,
      })
      return reply.status(201).send()
    },
  )
}
