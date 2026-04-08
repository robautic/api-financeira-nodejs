import { knex } from './src/database.js'

const USER_ID = '31b1156d-b639-4810-90c5-2e2aaf6cec0a'
const BALANCE = 3000

await knex('user_config')
  .insert({ user_id: USER_ID, initial_balance: BALANCE })
  .onConflict('user_id')
  .merge({ initial_balance: BALANCE })

console.log(`Saldo inicial de R$ ${BALANCE} definido para o usuário ${USER_ID}`)
process.exit(0)
