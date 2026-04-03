import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken } from '../lib/jwt'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer')) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    request.user = { id: payload.sub }
  } catch {
    return reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
}
