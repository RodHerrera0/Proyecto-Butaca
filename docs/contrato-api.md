# Contrato de API para Julio y Rodrigo

Revisión: 5 de noviembre de 2026. Fuente: `backend/src/app.js`, `routes/`, `controllers/`, `schemas/api.js`, `services/tmdb.js`, `middleware/auth.js` y el esquema Prisma actual. Base local por defecto: `http://localhost:3000` (`PORT` permite cambiarla).

## Reglas comunes

- Todas las rutas `/api/*` existentes requieren `Authorization: Bearer <access_token_de_Supabase>`. El token TMDB solo se configura en el servidor; no se envía desde Postman ni el frontend.
- Los POST reciben `Content-Type: application/json`. No se envían imágenes, rostros ni contraseñas a estos endpoints.
- `Origin` es opcional para Postman, Supertest y clientes servidor. En navegador debe coincidir exactamente con una entrada de `FRONTEND_URL` (separadas por comas, sin espacios exteriores ni entradas vacías). Sin variable, se permite `http://localhost:5173`; una variable explícitamente vacía no autoriza orígenes de navegador. No se admiten comodines.
- Un origen ajeno recibe 403 `{"error":"Origen no permitido"}`, incluido OPTIONS. Un preflight permitido recibe 204 y permite los headers solicitados, incluidos Authorization y Content-Type; no exige token.
- Sin token: 401 `{"error":"Falta el token"}`. Token inválido: 401 `{"error":"Token inválido"}`. La verificación JWKS y el alta/actualización del usuario siguen en el middleware de Guillermo.
- JSON malformado: 400 `{"error":"JSON no válido"}`. Fallos internos de base de datos, red o TMDB: 500 `{"error":"Error interno"}`, sin stack en la respuesta. Los detalles internos se registran solo en el servidor.
- Límite general: 300 solicitudes por IP cada 15 minutos sobre `/api`; su 429 conserva el texto predeterminado de express-rate-limit. Recomendaciones además tiene límite de 30 por IP cada 15 minutos y 429 `{"error":"Demasiadas recomendaciones, intenta más tarde"}`. Ambos incluyen headers de rate limiting y Retry-After al exceder el límite. Las solicitudes fallidas también cuentan.
- Validación Zod de bodies, moodId y params: `{"error":{"formErrors":[],"fieldErrors":{"campo":["mensaje de validación"]}}}`. Los mensajes concretos dependen de Zod. Una emoción de recomendaciones ausente o inválida conserva `{"error":"Emoción no válida"}`.
- No hay paginación, filtros adicionales ni body en los GET actuales. Los campos extra de los objetos Zod se ignoran. Una ruta inexistente devuelve el 404 predeterminado de Express (HTML), no el JSON de las rutas registradas.

## Rutas existentes

| Método | Ruta completa | URL/query | Body | Éxito | Errores específicos, además de los comunes |
|---|---|---|---|---|---|
| GET | `/health` | Ninguno | Ninguno | 200 objeto de salud | No requiere autenticación; sí aplica CORS |
| GET | `/api/me` | Ninguno | Ninguno | 200 usuario Prisma | 401 / 429 / 500 |
| POST | `/api/moods` | Ninguno | mood, confidence | 201 ánimo creado | 400 / 401 / 429 / 500 |
| GET | `/api/recommendations` | mood obligatorio, moodId opcional UUID | Ninguno | 200 arreglo de recomendaciones | 400 / 401 / 404 ánimo ajeno o inexistente / 429 / 500 / 503 sin configuración TMDB |
| GET | `/api/favorites` | Ninguno | Ninguno | 200 arreglo de favoritas | 401 / 429 / 500 |
| POST | `/api/favorites` | Ninguno | tmdbId, mediaType, title, posterPath opcional | 201 favorita creada | 400 / 401 / 409 duplicada / 429 / 500 |
| DELETE | `/api/favorites/:id` | id de Favorite | Ninguno | 204 sin body | 400 / 401 / 404 ajena o inexistente / 429 / 500 |
| GET | `/api/dashboard` | Ninguno | Ninguno | 200 estadísticas del usuario | 401 / 429 / 500 |

No existen `POST /api/recommendations` ni `GET /api/movies/:id`. La integración actual no los necesita: usa el arreglo completo de recomendaciones y su `tmdbId`/`mediaType`.

## GET /health y GET /api/me

Salud: `{"status":"ok"}`. `/api/me` devuelve el usuario de la base de datos, no el JWT ni su payload:

```json
{
  "id": "954c047f-7cc5-4f20-8984-0d083314ca52",
  "authId": "c85e12d3-6ae1-4b55-9836-4f25c72df248",
  "email": "usuario@example.com",
  "name": null,
  "avatarUrl": null,
  "createdAt": "2026-11-05T15:00:00.000Z"
}
```

Los UUID, fechas y títulos de este documento son ejemplos ficticios. Email, nombre y avatar pueden ser null.

## POST /api/moods

Body: `{"mood":"happy","confidence":0.9}`. mood debe ser exactamente una de `neutral`, `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`. confidence es obligatorio: número entre 0 y 1, o null cuando se elige el ánimo manualmente. No se aceptan números como texto.

Éxito 201:

```json
{
  "id": "954c047f-7cc5-4f20-8984-0d083314ca52",
  "userId": "09507970-963d-423f-886a-2206e81e63b9",
  "mood": "HAPPY",
  "confidence": 0.9,
  "createdAt": "2026-11-05T15:00:00.000Z"
}
```

Guardar `id` como moodId si se quiere vincular la siguiente recomendación. El enum almacenado se devuelve en mayúsculas.

## GET /api/recommendations?mood=happy

Query: mood obligatorio con las mismas siete claves minúsculas; moodId opcional es el UUID real devuelto por POST moods. Un moodId vacío, repetido o malformado recibe 400. Si es válido pero no existe o no pertenece al usuario: 404 `{"error":"Ánimo no encontrado"}`. Sin moodId, la relación guardada es null.

Éxito 200: arreglo plano, primero hasta cinco películas y después hasta cinco series. Puede haber de cero a diez elementos; ambos catálogos vacíos devuelven `[]` y no insertan registros. No hay un objeto contenedor `results` ni `recommendations`.

```json
[
  {
    "tmdbId": 550,
    "mediaType": "MOVIE",
    "title": "Fight Club",
    "posterPath": "/p.jpg",
    "overview": "Sinopsis de ejemplo",
    "year": 1999,
    "voteAverage": 8.4,
    "genres": ["18"]
  },
  {
    "tmdbId": 456,
    "mediaType": "TV",
    "title": "Los Simpson",
    "posterPath": null,
    "overview": null,
    "year": 1989,
    "voteAverage": 8,
    "genres": ["16", "35"]
  }
]
```

posterPath es una ruta de imagen, no una URL completa. overview, year y voteAverage pueden ser null. genres contiene IDs como cadenas; los títulos de ambos tipos pueden compartir tmdbId, por lo que el frontend combina tipo e ID. Las respuestas conservan los campos usados por `frontend/src/lib/adaptadores.js`.

El servicio consulta Discover movie y tv en paralelo: géneros OR (`|`), IDs TV convertidos y sin duplicados, idioma es-MX, popularidad descendente, al menos 200 votos. Cada consulta tiene timeout de 8000 ms, incluida la lectura del JSON. Los géneros por emoción están en [emociones-generos.md](emociones-generos.md); Asco conserva documental/drama hasta aprobación del equipo.

Se guarda únicamente userId, moodEntryId, tmdbId, mediaType, title y genres para las estadísticas, antes de responder. Repetir un GET vuelve a registrar lo mostrado. Un error de un catálogo impide guardar resultados parciales; si falla la persistencia tampoco se responde éxito. Fallos HTTP de TMDB (incluidos 401, 429 y 5xx), JSON inválido, red o timeout conservan el 500 general. Token del servidor ausente o vacío: 503 `{"error":"Servicio de recomendaciones no configurado"}`. No hay fallback al catálogo simulado del frontend.

## GET y POST /api/favorites

GET lista solo las favoritas del usuario autenticado, ordenadas por createdAt descendente. Sin favoritas: `[]`.

POST body:

```json
{"tmdbId":550,"mediaType":"MOVIE","title":"Fight Club","posterPath":"/p.jpg"}
```

tmdbId: entero positivo; mediaType: MOVIE o TV; title: cadena no vacía; posterPath: cadena, null u omitido. Los demás campos no se incorporan desde el body. No se aceptan userId ni authId del cliente: la asociación usa la sesión. Duplicado de usuario + tmdbId + mediaType: 409 `{"error":"Ya está en favoritas"}`.

POST devuelve un objeto Prisma completo con 201; GET devuelve un arreglo de esos objetos con 200:

```json
{
  "id": "5ec7494e-aa9e-46f8-89a2-146776d5c4dc",
  "userId": "09507970-963d-423f-886a-2206e81e63b9",
  "tmdbId": 550,
  "mediaType": "MOVIE",
  "title": "Fight Club",
  "posterPath": "/p.jpg",
  "overview": null,
  "year": null,
  "voteAverage": null,
  "genres": [],
  "createdAt": "2026-11-05T15:00:00.000Z"
}
```

Los campos opcionales del modelo se conservan en la respuesta; este POST solo guarda los cuatro campos admitidos. No consulta TMDB para completar metadata.

## DELETE /api/favorites/:id

Usar el id UUID de Favorite devuelto por GET/POST favoritas, no tmdbId ni un id compuesto del frontend. Zod usa `z.object({id:z.string().min(1)})`; si Prisma rechaza el UUID con P2023 se responde 400 `{"error":"Identificador no válido"}`. Los params vacíos o de tipo incorrecto se rechazan con 400 al validar. Sin el segmento :id, la URL no coincide y Express responde 404.

El borrado se limita al usuario de la sesión: 204 sin JSON cuando elimina una fila; 404 `{"error":"No encontrada"}` cuando no existe o pertenece a otra persona. No revela de quién es una favorita.

## GET /api/dashboard

Responde 200:

```json
{
  "historial": [{"emocion":"happy","confianza":0.9,"fecha":"2026-11-05T15:00:00.000Z"}],
  "porEmocion": {"happy":1},
  "porTipo": {"MOVIE":1,"TV":0},
  "porGenero": [{"id":18,"nombre":"Drama","total":1}]
}
```

Historial ascendente por fecha; confianza puede ser null. porEmocion solo contiene emociones registradas. porTipo siempre incluye MOVIE y TV; cuenta recomendaciones guardadas, no favoritas. porGenero cuenta cada género de cada recomendación y ordena por total descendente; nombres desconocidos se muestran como Otro. Sin datos: `{"historial":[],"porEmocion":{},"porTipo":{"MOVIE":0,"TV":0},"porGenero":[]}`.

## Ejemplos para Postman y Supertest

En Postman crear variables locales `baseUrl=http://localhost:3000`, `supabaseToken` (access token de una sesión de prueba), `moodId` y `favoriteId`. No sincronizar ni exportar tokens reales. Configurar Bearer Token `{{supabaseToken}}` a nivel de colección.

1. `GET {{baseUrl}}/health` → 200.
2. `POST {{baseUrl}}/api/moods`, body JSON `{"mood":"happy","confidence":null}` → 201; copiar id a moodId.
3. `GET {{baseUrl}}/api/recommendations?mood=happy&moodId={{moodId}}` → 200 con TMDB configurado.
4. `POST {{baseUrl}}/api/favorites`, body JSON `{"tmdbId":550,"mediaType":"MOVIE","title":"Fight Club"}` → 201; copiar id a favoriteId.
5. `GET {{baseUrl}}/api/favorites` y `GET {{baseUrl}}/api/dashboard` → 200.
6. `DELETE {{baseUrl}}/api/favorites/{{favoriteId}}` → 204; repetir → 404.

Ejemplo Supertest con la app, middleware de autenticación y Prisma simulados como en las pruebas existentes:

```js
import request from 'supertest'
import { app } from '../src/app.js'

const res = await request(app)
  .get('/api/recommendations')
  .query({ mood: 'happy' })
expect(res.status).toBe(200)
expect(Array.isArray(res.body)).toBe(true)

const invalid = await request(app).get('/api/recommendations').query({ mood: 'tired' })
expect(invalid.status).toBe(400)
```

Para ejecutar sin mocks se necesita un token Supabase válido, migraciones aplicadas y una credencial TMDB local. Las pruebas de `backend/tests/` no requieren esos servicios: simulan fetch, Prisma y verificación JWT según el caso. Ejecutar desde backend: `npm test` (en PowerShell con scripts restringidos, `npm.cmd test`).
