import { buildApp } from './app'
import { env } from './env'

const app = buildApp()

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server running at ${address}`)
})
