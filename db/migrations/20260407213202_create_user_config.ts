import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_config', (table) => {
    table.text('user_id').primary()
    table.decimal('initial_balance', 10, 2).defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user_config')
}
