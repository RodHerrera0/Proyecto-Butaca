## ¿Qué cambia?

Las recomendaciones exigían todos los géneros a la vez y repetían el ID de acción/aventura en series. Ahora Discover usa OR y deduplica los IDs TV, conserva las siete asignaciones existentes y normaliza hasta cinco películas y cinco series. Cada consulta se cancela a los ocho segundos; catálogo vacío responde 200 con un arreglo vacío, los fallos conservan el error seguro y la ausencia de credencial responde 503.

Se añade CORS con varios orígenes exactos desde FRONTEND_URL, preflight y acceso legítimo sin Origin; se conservan Helmet y rate limiting. Zod valida mood, moodId UUID y params de favoritas. JSON malformado y UUID rechazado por Prisma reciben 400. Se separan controladores y servicio TMDB sin cambiar endpoints, autenticación ni esquema Prisma.

Contrato de las ocho operaciones, ejemplos Postman/Supertest y errores: [docs/contrato-api.md](contrato-api.md). Configuración sin secretos: [docs/tmdb-configuracion.md](tmdb-configuracion.md). Repaso y commits independientes: [docs/defensa-backend-michael.md](defensa-backend-michael.md).

Closes #14
Closes #26
Closes #34
Closes #43

Relacionados y pendientes, sin cierre automático:

- #5: obtener/configurar y compartir la credencial por un canal privado. La configuración de código está terminada; no se ha validado una credencial real.
- #10: aprobación editorial del mapeo, especialmente Asco (se conserva documental/drama).
- #44: configurar el dominio real de Vercel y verificar el despliegue.

## ¿Cómo se probó?

- Backend: `npm test`, 8 archivos / 76 pruebas aprobadas (base inicial: 4 archivos / 14 pruebas).
- Frontend integrado desde develop: `npm test`, 12 archivos / 76 pruebas aprobadas; `npm run build` correcto, con advertencia de tamaño del bundle face-api existente.
- `git diff --check` sin errores; cambios revisados por bloque y publicados en commits separados sobre feature/backend-michael.
- Fetch, Prisma y verificación JWT simulados según cada suite: sin tokens privados ni base de datos externa. Cobertura de siete emociones, OR, géneros TV sin duplicados, límites y normalización, vacío, HTTP TMDB, red, JSON, timeout incluido body, CORS/OPTIONS, Zod, autenticación y rate limiting.
- No se hicieron llamadas autenticadas al catálogo, migraciones ni cambios a la cuenta Supabase. La comprobación manual con servicios reales queda pendiente del token local, la base de datos y el despliegue.

## Checklist

- [ ] El CI está en verde (comprobar los checks del PR)
- [x] No se añadieron keys ni secretos al código; .env sigue ignorado
- [ ] Revisado por un compañero

Base solicitada: develop. Este PR queda sujeto a revisión y no autoriza un merge automático.
