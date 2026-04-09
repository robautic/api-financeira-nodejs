import { knex } from './src/database.js'

const users = await knex('users').select('id', 'email', 'created_at')
console.table(users)
process.exit(0)
