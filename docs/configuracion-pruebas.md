# Configuración y pruebas

Issue #39. Revisión del 4 de noviembre de 2026 sobre `docs/luis`, base `0cb87c9`. Los scripts se contrastaron con ambos `package.json`; los comandos de preparación se distinguen de las verificaciones realmente ejecutadas.

## Entorno e instalación

El entorno local dispone de Node.js `v24.19.0` y npm `11.17.0`. Los archivos de bloqueo permiten Node.js 22 desde 22.12 en esa rama o Node.js 24 para Vite, Vitest y Prisma. El proyecto no fija una versión; CI utiliza `lts/*`.

Desde la raíz, instalar los proyectos por separado:

```sh
cd frontend
npm ci
cd ../backend
npm ci
```

No existe paquete raíz. En PowerShell puede usarse `npm.cmd` cuando `npm.ps1` esté bloqueado. Esta revisión no instaló dependencias ni cambió archivos de bloqueo.

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
| `VITE_API_URL` | URL de la API, por ejemplo `http://localhost:3000` | No consumida; debe acordarse si la base incluye `/api`. |
| `VITE_SUPABASE_URL` | URL del proyecto para el cliente Supabase | No consumida; no existe cliente Auth integrado. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública del cliente Supabase | No consumida; nunca utilizar una clave de servicio o administrativa en su lugar. |

Cambiar estas variables no conecta por sí solo las pantallas al backend. Cuando se incorporen, reiniciar Vite después de modificar el entorno. La seguridad de los datos no debe depender de ocultar una clave pública.

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

Vite informa la URL efectiva; normalmente usa el puerto 5173. La interfaz puede recorrerse con datos simulados sin conectar servicios externos.

Backend desde `backend/`, con configuración y base preparadas:

```sh
npm run dev
```

Ejecuta `tsx watch src/server.js`. `npm start` ejecuta `tsx src/server.js`. El puerto predeterminado es 3000. El servidor importa Prisma y configura JWKS al cargar módulos; no se debe suponer que podrá iniciar solo para probar `/health` sin preparar sus dependencias.

En otra terminal, una vez levantado el servidor:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health
```

Se espera `status: ok`; la ruta no consulta la base ni TMDB. La comprobación HTTP real no se ejecutó en esta revisión.

## Contratos que deberá consumir el frontend

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

La respuesta normalizada de recomendaciones contiene `tmdbId`, `mediaType`, `title`, `posterPath`, `overview`, `year`, `voteAverage` y `genres`. El frontend simulado utiliza nombres como `titulo`, `tipo`, `calificacion` y `guardadaEn`; hace falta adaptar los contratos.

El esquema de favoritas contempla sinopsis, año, calificación y géneros, pero el validador POST actual no admite esos campos como parte del contrato procesado. Debe confirmarse cómo conservar o reconstruirlos para la pantalla de favoritas. Tampoco hay campos persistidos para origen manual/cámara, intención de recomendación o participantes del grupo.

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

`e2e/` contiene únicamente `.gitkeep`. No hay configuración, dependencia ni script de Playwright; todavía no existe un procedimiento E2E ejecutable del proyecto.

La interfaz sí incluye ayudas para un futuro recorrido automatizado:

| Ruta de frontend | Efecto implementado |
|---|---|
| `/detectar?simular=happy` | Inyecta un resultado sin encender cámara; acepta cualquiera de las siete claves. |
| `/detectar?simular=grupo` | Simula tres personas: dos `happy` y una `sad`. |
| `/recomendaciones?simular=error` | Simula un error del catálogo local. |
| `/recomendaciones?simular=vacio` | Devuelve una lista simulada vacía. |

Estas rutas y los `data-testid` no equivalen a una suite E2E. Julio debe configurar Playwright y cubrir el recorrido con cuentas, API, persistencia y tablero cuando estén conectados. Separar las pruebas con cámara simulada de una comprobación con cámara real.

## CI y resultados de esta revisión

GitHub Actions ejecuta `npm ci` y `npm test` para ambos proyectos en pushes a `main`/`develop` y PR hacia esas ramas. No incluye lint, build, E2E, generación de cliente ni migraciones. El brief solicita pruebas en cada push; Julio debe revisar la cobertura de eventos de las ramas de trabajo.

| Comprobación del 4 de noviembre | Resultado observado |
|---|---|
| Estado inicial y base | Rama `docs/luis`, árbol limpio, HEAD `0cb87c9`. |
| Paquetes, entorno, código, pruebas y brief | Revisados en lectura; se encontró el brief completo en los recursos locales del HTML guardado. |
| `npm.cmd test` en backend | Salida 1: `vitest` no reconocido; sin dependencias instaladas. No se ejecutaron casos. |
| `npm.cmd test` en frontend | Salida 1: `vitest` no reconocido; sin dependencias instaladas. No se ejecutaron casos. |
| Instalación, lint, build, Prisma y servidores | No ejecutados; el alcance de escritura se limita a seis documentos. |
| Cámara, Auth, PostgreSQL y TMDB reales | No verificados; sin uso de credenciales ni conexión a esos servicios. |
| Playwright, CI remoto y despliegue HTTPS | No verificados; Playwright aún no está configurado. |
| Revisión documental | Enlaces relativos existentes, bloques de código cerrados, diez variables documentadas y comandos contrastados con los scripts actuales. |
| Alcance y formato | Solo los seis documentos autorizados modificados, rama `docs/luis`; `git diff --check` sin errores de formato. |

Los resultados antiguos del runner backend sin casos corresponden a una versión anterior y no describen esta base, que ya usa Vitest y contiene pruebas. Después de instalar dependencias en un entorno autorizado, Julio deberá registrar conteos, fallos y evidencias del commit evaluado.
