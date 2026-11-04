import { createRemoteJWKSet, jwtVerify } from 'jose'
import { prisma } from '../lib/prisma.js'

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Falta el token' })
  }

  let payload
  try {
    ({ payload } = await jwtVerify(token, JWKS, { audience: 'authenticated' }))
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  // Garantiza que el usuario exista en nuestra tabla antes de cualquier ruta protegida
  req.user = await prisma.user.upsert({
    where: { authId: payload.sub },
    update: { email: payload.email },
    create: { authId: payload.sub, email: payload.email },
  })
  req.auth = { id: payload.sub, email: payload.email }
  next()
}