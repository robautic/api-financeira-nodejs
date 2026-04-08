import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { generateTokens } from '../lib/jwt'

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  try {
    console.log('[registerUser] Iniciando registro:', { name, email })

    const existing = await knex('users').where({ email }).first()
    if (existing) {
      console.warn('[registerUser] Email já cadastrado:', email)
      throw new Error('EMAIL_TAKEN')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    console.log('[registerUser] Hash gerado com sucesso')

    const [user] = await knex('users')
      .insert({
        id: randomUUID(),
        name,
        email,
        password_hash: passwordHash,
      })
      .returning(['id', 'name', 'email'])

    console.log('[registerUser] Usuário inserido no banco:', user.id)
    return user
  } catch (error) {
    console.error('[registerUser] ERRO CRÍTICO:')
    console.error(error)

    if (error instanceof Error) {
      console.error('[registerUser] Mensagem:', error.message)
      console.error('[registerUser] Stack:', error.stack)
    }

    // Log específico para erros do Knex/PostgreSQL
    if (typeof error === 'object' && error !== null) {
      interface DatabaseError {
        code?: string
        detail?: string
        table?: string
        constraint?: string
      }
      const dbError = error as DatabaseError
      console.error('[registerUser] Detalhes do erro:', {
        code: dbError.code,
        detail: dbError.detail,
        table: dbError.table,
        constraint: dbError.constraint,
      })
    }

    throw error
  }
}

export async function loginUser(email: string, password: string) {
  const user = await knex('users').where({ email }).first()

  if (!user) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatch) {
    throw new Error('INVALID_CREDENTIALS')
  }

  return generateTokens(user.id)
}
