import { buildApp } from './app'
import { env } from './env'

const app = buildApp()

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running!')
  })
