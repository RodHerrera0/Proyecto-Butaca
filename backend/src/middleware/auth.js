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

  // Google y GitHub mandan nombre y foto con nombres distintos según el proveedor
  const meta = payload.user_metadata ?? {}
  const name = meta.full_name ?? meta.name ?? meta.user_name ?? undefined
  const avatarUrl = meta.avatar_url ?? meta.picture ?? undefined

  // Garantiza que el usuario exista en nuestra tabla antes de cualquier ruta protegida
  req.user = await prisma.user.upsert({
    where: { authId: payload.sub },
    update: { email: payload.email, name, avatarUrl },
    create: { authId: payload.sub, email: payload.email, name, avatarUrl },
  })
  req.auth = { id: payload.sub, email: payload.email }
  next()
}