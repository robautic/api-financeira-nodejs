import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { generateTokens } from '../lib/jwt'

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existing = await knex('users').where({ email }).first()

  if (existing) {
    throw new Error('EMAIL_TAKEN')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const [user] = await knex('users')
    .insert({
      id: randomUUID(),
      name,
      email,
      password_hash: passwordHash,
    })
    .returning(['id', 'name', 'email'])

  return user
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
