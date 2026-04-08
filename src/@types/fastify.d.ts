import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string }
    user: { id: string }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string }
  }
}
