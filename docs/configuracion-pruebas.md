# Configuración y pruebas

Issue #39. Revisión original del 4 de noviembre de 2026; actualizada el 9 de noviembre sobre `develop` (`0fb9d4a`) con el frontend ya conectado, Playwright configurado y los resultados de esa fecha.

## Entorno e instalación

El entorno local dispone de Node.js `v24.19.0` y npm `11.17.0`. Los archivos de bloqueo permiten Node.js 22 desde 22.12 en esa rama o Node.js 24 para Vite, Vitest y Prisma. El proyecto no fija una versión; CI utiliza `lts/*`.

Desde la raíz, instalar los proyectos por separado:

```sh
cd frontend
npm ci
cd ../backend
npm ci
```

El `package.json` de la raíz solo contiene Playwright para las pruebas E2E. En PowerShell puede usarse `npm.cmd` cuando `npm.ps1` esté bloqueado. En el backend, `npm ci` genera también el cliente de Prisma (`postinstall`).

Preparar `frontend/.env` y `backend/.env` copiando los respectivos `.env.example` solo si el destino no existe. Completar valores de forma privada. No versionar esos archivos ni usar credenciales reales en evidencias.

## Variables del backend

`src/server.js` y `src/lib/prisma.js` importan `dotenv/config`; el servidor ya carga el entorno. La configuración de Prisma también lo hace.

| Variable | Uso actual | Tratamiento |
|---|---|---|
| `PORT` | Puerto HTTP; valor predeterminado `3000` | Configuración de servidor, no un secreto. |
| `DATABASE_URL` | Conexión PostgreSQL para Prisma y su adaptador | Privada; puede contener credenciales. Guillermo debe proporcionar la conexión adecuada. |
| `DIRECT_URL` | Declarada en el ejemplo, sin consumo en código o configuración Prisma | Privada si contiene credenciales; no se usa automáticamente para migrar. |
| `TMDB_API_KEY` | Se envía como `Authorization: Bearer ...` a TMDB | Privada. Aunque se llame API_KEY, el código espera una credencial válida como token Bearer, no la envía como parámetro `api_key`. Confirmar con Michael. |
| `SUPABASE_URL` | Construye la URL de claves públicas `/auth/v1/.well-known/jwks.json` | URL del proyecto; debe ser válida para importar el middleware. |
| `SUPABASE_JWT_SECRET` | Declarada, pero no consumida por el middleware actual | Secreto privado si se utiliza; el flujo revisado usa JWKS. Confirmar si debe mantenerse en el ejemplo. |
| `FRONTEND_URL` | Origen configurado en CORS | Para desarrollo, el origen efectivo de Vite, por ejemplo `http://localhost:5173`. No es una credencial. |

No confundir CORS con autenticación. El backend verifica el token y sincroniza al usuario antes de las rutas protegidas. La revisión de su configuración no sustituye pruebas con tokens válidos, vencidos, ausentes y de otro proyecto.

## Variables del frontend

Todas las variables `VITE_` son públicas y pueden quedar en la compilación enviada al navegador.

| Variable | Propósito previsto | Estado en el código |
|---|---|---|
| `VITE_API_URL` | URL base de la API sin `/api` ni `/` final, por ejemplo `http://localhost:3000` | Consumida por `lib/config.js` y `lib/api.js`. |
| `VITE_SUPABASE_URL` | URL del proyecto para el cliente Supabase | Consumida por `lib/supabase.js` para el login con Google y GitHub. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública del cliente Supabase | Consumida por `lib/supabase.js`; nunca utilizar una clave de servicio o administrativa en su lugar. |

Si falta cualquiera de las tres, la aplicación funciona en modo demostración con datos de ejemplo y lo indica en pantalla. Reiniciar Vite después de modificar el entorno; en Vercel, volver a desplegar. La seguridad de los datos no depende de ocultar la clave pública.

## Prisma y base de datos

Desde `backend/`, después de instalar dependencias y configurar una conexión autorizada:

```sh
npx prisma validate --config ./prisma7.config.ts
npx prisma generate --config ./prisma7.config.ts
```

La configuración tiene un nombre explícito, `prisma7.config.ts`; los comandos lo indican mediante `--config`. El generador produce el cliente importado desde `src/generated/prisma/client.js`, excluido de Git. Sin ese cliente no basta con ejecutar `npm run dev`.

Existen modelos `User`, `MoodEntry`, `Favorite` y `Recommendation`, con relaciones por usuario. La favorita es única por usuario, ID de TMDB y tipo de contenido. Las recomendaciones pueden vincularse opcionalmente a una entrada de ánimo.

Para una base de desarrollo autorizada, Guillermo debe revisar el historial y su estado antes de aplicar las migraciones existentes:

```sh
npx prisma migrate status --config ./prisma7.config.ts
npx prisma migrate deploy --config ./prisma7.config.ts
```

Estos comandos son un procedimiento documentado, **no ejecutado en esta revisión**. `migrate deploy` modifica la base. La migración `20261104051513_ajustes_moods_favoritas_perfil` reemplaza el enum y advierte que fallará si existen registros `TIRED` o `ADRENALINE`; no define su conversión. Guillermo debe resolver esa transición sin asumir equivalencias emocionales. No se utilizó una base compartida ni se ejecutaron resets o migraciones.

## Ejecución local

Frontend desde `frontend/`:

```sh
npm run dev
```

Vite informa la URL efectiva; normalmente usa el puerto 5173. Con las variables `VITE_` completas y el backend levantado, la interfaz usa la cuenta, la API y TMDB; sin ellas, recorre el modo demostración. Para el login local, `http://localhost:5173/consentimiento` debe estar en las Redirect URLs de Supabase.

Backend desde `backend/`, con configuración y base preparadas:

```sh
npm run dev
```

Ejecuta `tsx watch src/server.js`. `npm start` ejecuta `tsx src/server.js`. El puerto predeterminado es 3000. El servidor importa Prisma y configura JWKS al cargar módulos; no se debe suponer que podrá iniciar solo para probar `/health` sin preparar sus dependencias.

En otra terminal, una vez levantado el servidor:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health
```

Se espera `status: ok`; la ruta no consulta la base ni TMDB. En la API publicada, `https://proyecto-butaca-dev.onrender.com/health` responde lo mismo.

## Contratos que consume el frontend

Todas las rutas `/api` listadas requieren `Authorization: Bearer <token de sesión>`. No copiar tokens a documentación ni capturas.

| Ruta | Entrada y comportamiento relevante |
|---|---|
| `GET /api/me` | Devuelve perfil; el middleware crea o actualiza identificador Auth, correo, nombre y avatar según el token. |
| `POST /api/moods` | JSON con `mood` entre las siete claves y `confidence` numérica de 0 a 1 o `null`. Ambos campos son requeridos. Responde 201 o 400. |
| `GET /api/recommendations` | Query `mood` requerida; `moodId` opcional y perteneciente al usuario. Responde 400 si la emoción no existe o 404 si no se encuentra ese ánimo del usuario. Consulta TMDB y guarda resultados antes de responder. |
| `GET /api/favorites` | Lista del usuario por fecha descendente. |
| `POST /api/favorites` | JSON con `tmdbId` entero positivo, `mediaType` como `MOVIE` o `TV`, `title` no vacío y `posterPath` opcional o nulo. Responde 201, 400 o 409. |
| `DELETE /api/favorites/:id` | Usa el ID del registro de favorita, no el ID TMDB. Responde 204 o 404 y limita por usuario. |
| `GET /api/dashboard` | Devuelve `historial`, `porEmocion`, `porTipo` y `porGenero` del usuario. Cuenta recomendaciones registradas, no reproducciones ni títulos vistos. |

La respuesta normalizada de recomendaciones contiene `tmdbId`, `mediaType`, `title`, `posterPath`, `overview`, `year`, `voteAverage` y `genres`. `frontend/src/lib/adaptadores.js` la convierte a la forma de las tarjetas (`titulo`, `tipo`, `calificacion`, póster completo de TMDB y nombres de género) y conserva el `id` del registro de favorita para poder borrarla.

Las favoritas se envían con `tmdbId`, `mediaType`, `title` y `posterPath`, que es lo que procesa el validador. No hay campos persistidos para origen manual/cámara, intención de recomendación o participantes del grupo.

## Pruebas automatizadas

Backend, desde `backend/`:

```sh
npm test
```

El script actual es **`vitest run`**. Los cuatro archivos en `tests/` ejercitan rutas Express con Supertest: salud, validación y escritura de ánimos, favoritas, recomendaciones y agregados del tablero. Sustituyen autenticación y Prisma por dobles; recomendaciones también simula `fetch`. No prueban JWT real, PostgreSQL, migraciones ni respuestas reales de TMDB. No requieren credenciales de producción ni conexión a esos servicios por diseño.

Frontend, desde `frontend/`:

```sh
npm test
npm run lint
npm run build
```

El test ejecuta `vitest run --passWithNoTests`, con jsdom y `src/test/setup.js`. Hay casos de rutas, consentimiento, favoritas locales, recomendaciones, componentes, grupo, expresiones, simulación y tema. El detector y `getUserMedia` se simulan en las pruebas de cámara; no miden la precisión del modelo ni verifican hardware real. Revisar el número de casos descubiertos: el indicador permite finalizar aunque no haya pruebas.

Lint utiliza Oxlint y build utiliza Vite. Son verificaciones distintas de las pruebas. Para consultar una compilación ya generada:

```sh
npm run preview
```

No hay scripts de lint ni build en el backend.

## E2E y ayudas de simulación

Playwright está configurado en la raíz (`package.json` y `playwright.config.js`) y `e2e/butaca-flow.spec.js` contiene 5 recorridos en Chromium: estado de carga, estado de error, detección simulada, botones de login y filtros por ánimo. Desde la raíz:

```sh
npm ci
cd frontend && npm ci && cd ..
npx playwright install chromium
npx playwright test
```

Los recorridos usan estas rutas de simulación, que también sirven para demostrar sin cámara:

| Ruta de frontend | Efecto implementado |
|---|---|
| `/detectar?simular=happy` | Inyecta un resultado sin encender cámara; acepta cualquiera de las siete claves. |
| `/detectar?simular=grupo` | Simula tres personas: dos `happy` y una `sad`. |
| `/recomendaciones?simular=error` | Simula un error del catálogo local. |
| `/recomendaciones?simular=vacio` | Devuelve una lista simulada vacía. |

Los recorridos E2E usan la simulación y no reemplazan la comprobación con cámara, cuenta y servicios reales, que se hizo en la aplicación publicada (#61).

## CI y resultados

GitHub Actions ejecuta tres jobs en cada push a `main`, `develop` y `feature/**`, y en los PR hacia `main` y `develop`:

- **Backend:** `npm ci`, `npx prisma generate` y `npm test`.
- **Frontend:** `npm ci` y `npm test`.
- **E2E:** instala dependencias y Chromium, ejecuta `npx playwright test` y sube `reporte-playwright` como artefacto.

Las ramas `main` y `develop` están protegidas: exigen que pasen Backend y Frontend, la rama al día y la aprobación de un responsable.

| Comprobación del 9 de noviembre (`0fb9d4a`) | Resultado |
|---|---|
| `npm test` en backend | 78 pruebas en 9 archivos, todas aprobadas. |
| `npm test` en frontend | 84 pruebas en 13 archivos, todas aprobadas. |
| `npm run lint` y `npm run build` en frontend | Sin errores; dos avisos conocidos del lint. |
| `npm audit --omit=dev` | 0 vulnerabilidades en backend y frontend. |
| Secretos en el repositorio | Ninguno: solo `.env.example`, y ningún `.env` en el historial. |
| Auditoría en navegador (axe) | 0 violaciones en siete pantallas, tema claro y oscuro, móvil y escritorio. |
| CI remoto de `develop` | Backend, Frontend y E2E en verde. |
| Servicios reales | Login, detección, recomendaciones de TMDB, favoritas persistentes y tablero verificados en la aplicación publicada con HTTPS. |
