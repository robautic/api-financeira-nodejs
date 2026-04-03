import fastify from 'fastify'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { transactionsRoutes } from './routes/transactions.js'
import { authRoutes } from './routes/auth.js'

export function buildApp() {
  const app = fastify()

  app.register(cookie)

  app.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET!,
  })

  app.register(authRoutes, {
    prefix: '/auth',
  })
  app.register(transactionsRoutes, {
    prefix: '/transactions',
  })

  return app
}
