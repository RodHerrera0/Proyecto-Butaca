import express from 'express'

// Crea y configura la app de Express (sin levantar el servidor, para poder probarla con supertest)
const app = express()

app.use(express.json())

// Ruta de salud: permite verificar que la API está viva
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default app
