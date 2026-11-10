# Butaca

Proyecto final de Programación Web de la Universidad Rafael Landívar. Butaca ayuda a elegir películas y series a partir de un ánimo elegido a mano o de una expresión facial estimada con la cámara. La clasificación facial orienta la búsqueda en el catálogo; no determina con certeza cómo se siente una persona.

**Aplicación publicada:** https://proyecto-butaca-eta.vercel.app (frontend en Vercel) con la API en https://proyecto-butaca-dev.onrender.com (Render). Ambas con HTTPS.

## Funciones

| Función | Qué hace |
|---|---|
| Cuenta | Inicio de sesión con Google o GitHub mediante Supabase Auth. Sin sesión, la aplicación funciona en modo demostración con datos de ejemplo. |
| Consentimiento | Antes de pedir la cámara se explica para qué se usa. Si la persona no acepta, elige su ánimo a mano y la cámara nunca se enciende. |
| Detección | face-api analiza un cuadro dentro del navegador y estima una de siete expresiones. La imagen no se guarda ni se envía; la cámara se apaga al terminar el análisis. |
| Modo grupo | Detecta hasta seis rostros, muestra la expresión de cada persona y combina los resultados con un voto ponderado por la confianza. |
| Elección de cámara | Si hay una webcam externa conectada se prefiere sobre la integrada; con varias cámaras aparece un selector y se recuerda la elección. |
| Acompañar o cambiar el ánimo | La persona decide si quiere títulos acordes a su ánimo o que la lleven hacia otro (por ejemplo, de triste a feliz). |
| Recomendaciones | Películas y series reales de TMDB según el ánimo objetivo: destacado, filas por tipo y filtros por emoción, con estados de carga, error y lista vacía. |
| Favoritas | Agregar y quitar títulos; con sesión se guardan en la base de datos y se recuperan al volver. |
| Tablero | Ánimo en el tiempo, conteo por emoción, géneros más recomendados y reparto entre películas y series, con los datos de la cuenta. |
| Interfaz | Tema claro y oscuro, diseño adaptable a móvil, navegación con teclado y un título por página. |

## Seguridad y privacidad

- La imagen de la cámara se procesa solo en el navegador; al backend llega únicamente la emoción y su confianza.
- La credencial de TMDB vive solo en el servidor. Las variables `VITE_` del frontend son públicas (URL de la API y clave pública de Supabase).
- Las rutas `/api/*` exigen un token de Supabase, verificado con JWKS, y cada consulta se filtra por el usuario de la sesión.
- Validación de entradas con Zod, cabeceras de seguridad con Helmet, CORS limitado a los dominios de `FRONTEND_URL` y límite de peticiones (300 generales y 30 de recomendaciones cada 15 minutos por IP).

## Tecnologías y arquitectura

| Tecnología | Responsabilidad |
|---|---|
| React 19, Vite 8 y React Router 7 | Interfaz y navegación |
| `@vladmandic/face-api` | Detección de rostros y expresiones en el navegador; modelos en `frontend/public/models/` |
| Supabase Auth (`@supabase/supabase-js`) | Inicio de sesión con Google y GitHub en el cliente |
| Node.js, Express 5 y tsx | API HTTP |
| Prisma 7 y PostgreSQL (Supabase) | Usuarios, ánimos, favoritas e historial de recomendaciones |
| jose | Verificación del token de Supabase mediante JWKS |
| TMDB | Catálogo de películas y series, consultado desde el backend |
| Zod, Helmet, CORS y express-rate-limit | Validación y controles HTTP |
| Vitest, Testing Library, Supertest y Playwright | Pruebas unitarias, de componentes, de rutas HTTP y de extremo a extremo |
| GitHub Actions, Vercel y Render | Integración continua y despliegue |

Flujo: el navegador detecta la expresión, envía `POST /api/moods` con la emoción y pide `GET /api/recommendations`. El backend consulta TMDB con los géneros asociados a esa emoción, guarda lo recomendado y responde títulos normalizados. Favoritas y tablero usan sus propias rutas con el mismo token.

### Endpoints

Todas las rutas `/api/*` requieren `Authorization: Bearer <token de Supabase>`. `/health` es pública.

| Método y ruta | Comportamiento |
|---|---|
| `GET /health` | Responde `{"status":"ok"}` |
| `GET /api/me` | Perfil del usuario, sincronizado desde el token |
| `POST /api/moods` | Guarda `mood` (una de las siete claves) y `confidence` (0 a 1 o `null`) |
| `GET /api/recommendations?mood=happy` | Películas y series de TMDB para esa emoción; registra lo recomendado. Admite `moodId` del usuario |
| `GET /api/favorites` | Favoritas del usuario |
| `POST /api/favorites` | Agrega una favorita; 409 si ya existe |
| `DELETE /api/favorites/:id` | Elimina una favorita del usuario; 404 si no es suya |
| `GET /api/dashboard` | Historial y conteos por emoción, tipo y género |

El detalle de contratos está en [contrato de la API](docs/contrato-api.md) y el mapeo de emociones a géneros en [emociones y géneros](docs/emociones-generos.md).

## Estructura del repositorio

```text
frontend/
  src/
    pantallas/           Login, consentimiento, detección, recomendaciones, favoritas y tablero
    components/          Detector, gráficas, tarjetas, navegación y controles
    lib/                 Sesión, API, adaptadores, detector, cámaras, grupo, emociones, simulación y tema
    data/                Datos de ejemplo para el modo demostración
    estilos/             Estilos globales y tokens
  public/models/         Modelos de detección de rostro y expresión
  vercel.json            Reescritura de rutas para la SPA
backend/
  src/
    app.js               Middleware HTTP y montaje de rutas
    server.js            Carga del entorno e inicio del servidor
    routes/              Rutas de ánimos, recomendaciones, favoritas y tablero
    controllers/         Lógica de cada ruta
    services/tmdb.js     Consulta y normalización de TMDB
    schemas/api.js       Esquemas Zod
    middleware/auth.js   Verificación JWT y sincronización del usuario
  prisma/                Esquema y migraciones
  tests/                 Pruebas de rutas con Supertest
e2e/                     Pruebas Playwright del recorrido
docs/                    Documentación del proyecto
.github/workflows/       CI de backend, frontend y E2E
```

## Requisitos

- Git, Node.js 22.12 o superior (CI usa `lts/*`) y npm.
- Un navegador moderno. La cámara necesita `localhost` o HTTPS.
- Para el modo conectado: proyecto de Supabase con Google y GitHub habilitados, base PostgreSQL y token de lectura de TMDB.

## Instalación y ejecución local

Instalar cada proyecto por separado:

```sh
cd frontend
npm ci
cd ../backend
npm ci
```

`npm ci` en el backend genera el cliente de Prisma automáticamente (`postinstall`).

Crear los archivos de entorno a partir de los ejemplos y completarlos con los valores del equipo (nunca se suben al repositorio):

```powershell
Copy-Item -LiteralPath frontend/.env.example -Destination frontend/.env
Copy-Item -LiteralPath backend/.env.example -Destination backend/.env
```

| Archivo | Variables |
|---|---|
| `frontend/.env` | `VITE_API_URL` (por ejemplo `http://localhost:3000`), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `backend/.env` | `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `TMDB_API_KEY` (token Bearer de lectura), `FRONTEND_URL` (orígenes permitidos separados por comas), `PORT` opcional |

Sin las tres variables `VITE_`, el frontend arranca en modo demostración con datos de ejemplo.

Levantar cada parte en su terminal:

```sh
cd backend
npm run dev      # http://localhost:3000
```

```sh
cd frontend
npm run dev      # http://localhost:5173
```

Para usar el login en local, la URL `http://localhost:5173/consentimiento` debe estar en las Redirect URLs de Supabase.

### Modo de simulación

Sirve para demostrar o probar sin cámara:

| Ruta | Efecto |
|---|---|
| `/detectar?simular=happy` | Resultado simulado; acepta cualquiera de las siete claves |
| `/detectar?simular=grupo` | Grupo simulado de tres personas (dos felices y una triste) |
| `/recomendaciones?simular=error` | Muestra el estado de error |
| `/recomendaciones?simular=vacio` | Muestra la lista vacía |

## Pruebas

| Proyecto | Comando | Contenido |
|---|---|---|
| Backend | `cd backend && npm test` | 78 pruebas (Vitest y Supertest): rutas, validación, CORS, seguridad, TMDB y tablero |
| Frontend | `cd frontend && npm test` | 84 pruebas (Vitest y Testing Library): pantallas, detector, grupo, cámaras, API, adaptadores y conexión con el backend |
| Frontend | `npm run lint` y `npm run build` | Oxlint y compilación de Vite |
| E2E | `npm ci` en la raíz y en `frontend/`, luego `npx playwright install chromium` y `npx playwright test` | 5 recorridos en Chromium con el modo de simulación |

Las pruebas de backend sustituyen Supabase, Prisma y TMDB por dobles; el recorrido con servicios reales se verificó en la aplicación publicada (login, detección, recomendaciones, favoritas que persisten al recargar y tablero con datos de la cuenta).

GitHub Actions ejecuta los jobs **Backend**, **Frontend** y **E2E** en cada push a `main`, `develop` y `feature/**`, y en los PR hacia `main` y `develop`. Las ramas `main` y `develop` están protegidas: exigen que pasen Backend y Frontend, la rama al día y la aprobación de un responsable.

## Despliegue

| Parte | Servicio | Configuración |
|---|---|---|
| Frontend | Vercel | Carpeta `frontend`, preset Vite, variables `VITE_` en Production. Se publica automáticamente desde la rama de producción |
| API | Render | Carpeta `backend`, build `npm ci && npx prisma migrate deploy`, inicio `npm start`, variables del backend |
| Auth y datos | Supabase | Proveedores Google y GitHub; `https://<dominio>/consentimiento` en Redirect URLs |

Al agregar un dominio nuevo hay que incluirlo en `FRONTEND_URL` del backend (CORS) y en las Redirect URLs de Supabase. En el plan gratuito, Render suspende la API sin uso: la primera petición puede tardar cerca de un minuto.

## Documentación

- [Contrato de la API](docs/contrato-api.md)
- [Emociones y géneros](docs/emociones-generos.md)
- [Consentimiento y privacidad](docs/consentimiento-privacidad.md)
- [Configuración y pruebas](docs/configuracion-pruebas.md)
- [Checklist de aceptación](docs/checklist-aceptacion.md)
- [Guion de presentación](docs/guion-presentacion.md)

## Equipo y flujo de Git

| Integrante | Carnet | Responsabilidad |
|---|---|---|
| J. Rodrigo Herrera | 1042619 | Frontend y detección |
| Michael Gutiérrez | 1199723 | API, géneros y TMDB |
| Guillermo Contreras | 1154322 | Datos, Prisma, Supabase y autenticación |
| Julio Portillo | 1160822 | Pruebas, CI y despliegue |
| Luis Samayoa | 1227421 | Documentación y apoyo |

Cada integrante trabaja en su rama (`feature/frontend-rodrigo`, `feature/backend-michael`, `feature/backend-guille`, `feature/qa-julio` y `docs/luis`) y entrega por PR hacia `develop`, con CI en verde y revisión. `develop` se integra en `main` para la entrega final.
