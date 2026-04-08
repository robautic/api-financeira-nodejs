import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken } from '../lib/jwt.js'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Já autenticado via API key no preHandler
  if (request.user?.id) return

  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token not provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyAccessToken(token)
    request.user = { id: payload.sub }
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}
