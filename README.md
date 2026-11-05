# Butaca

Proyecto final de Programación Web de la Universidad Rafael Landívar. Butaca busca facilitar la elección de películas y series a partir de un ánimo elegido manualmente o de una expresión facial estimada con la cámara. La clasificación facial orienta la exploración del catálogo; no determina con certeza cómo se siente una persona.

## Objetivos y alcance académico

- Ofrecer detección local con consentimiento y una alternativa manual.
- Consultar películas y series de TMDB mediante una API propia en Express.
- Asociar ánimos, favoritas y recomendaciones a la cuenta de cada usuario.
- Mostrar un historial de ánimos y estadísticas del contenido recomendado.
- Entregar un flujo full-stack con validación, protección de secretos, pruebas y CI.



## Estado actual


| Área | Implementado en el código | Integración o verificación pendiente |
|---|---|---|
| Interfaz | Login visual, consentimiento, detección, recomendaciones, favoritas, tablero, navegación y tema claro/oscuro | Comprobación en navegador y aceptación visual/accesible |
| Detección | face-api local, modo individual y grupal de hasta seis personas, selector manual y opción de acompañar o cambiar el ánimo | Cámara real, permisos y comportamiento en los navegadores de entrega |
| Recomendaciones | Frontend con catálogo simulado; backend consulta TMDB, normaliza títulos y registra recomendaciones | La pantalla no llama al backend; falta verificar el catálogo real con credenciales autorizadas |
| Cuenta | Backend valida JWT de Supabase y crea o actualiza el perfil | Google/GitHub están deshabilitados en el login; no hay sesión real en la interfaz |
| Datos | Prisma define usuario, siete ánimos, favoritas e historial de recomendaciones; existen migraciones y rutas | Migraciones y persistencia real no verificadas; la interfaz mantiene ánimo y favoritas en memoria |
| Tablero | API agrega historial y conteos por emoción, tipo y género | La pantalla muestra espacios reservados para gráficas y no consume la API |
| Calidad | Casos Vitest en ambos proyectos, Supertest en backend y jobs de CI | Ambas suites se intentaron ejecutar, pero falta instalar Vitest; E2E todavía sin configurar |

Al recargar la interfaz se pierden el consentimiento, el ánimo y las favoritas de la visita. La preferencia de tema sí se guarda en `localStorage` con la clave `butaca-tema`.

## Tecnologías y arquitectura

| Tecnología | Responsabilidad |
|---|---|
| React 19, Vite 8 y React Router 7 | Interfaz, navegación y herramientas de desarrollo |
| `@vladmandic/face-api` | Inferencia facial en el navegador; modelos incluidos en `frontend/public/models/` |
| Node.js, Express 5 y tsx | Servidor HTTP y ejecución del backend |
| Prisma 7, adaptador PostgreSQL y Supabase | Modelo relacional y conexión a datos |
| Supabase Auth y jose | Validación del token mediante JWKS; login cliente pendiente |
| TMDB | Catálogo consultado desde el backend |
| Zod, CORS, Helmet y express-rate-limit | Validación de entradas y controles HTTP |
| Vitest, Testing Library, jsdom y Supertest | Pruebas de lógica, componentes y rutas HTTP |
| GitHub Actions | Instalación y pruebas de ambos proyectos |

La cámara y los modelos se utilizan dentro del navegador. La arquitectura de servicios implementada en el backend conecta Express con TMDB y con PostgreSQL mediante Prisma. Las rutas protegidas reciben un token Bearer de Supabase; el middleware verifica la audiencia `authenticated` y sincroniza el perfil antes de atender la petición.

**Falta conectar el cliente con esos servicios.** En el frontend actual, las recomendaciones proceden de `mock-titulos.js` y las favoritas se gestionan en el estado de React. La opción «Cambiarlo» modifica el ánimo objetivo de ese filtro local, sin garantizar un cambio emocional.

### Endpoints existentes

Todos los endpoints `/api/*` de esta tabla requieren autenticación. `/health` es público.

| Método y ruta | Comportamiento implementado |
|---|---|
| `GET /health` | Responde `{"status":"ok"}`; no comprueba los servicios externos |
| `GET /api/me` | Devuelve el perfil sincronizado por el middleware |
| `POST /api/moods` | Valida y guarda `mood` y `confidence` para el usuario |
| `GET /api/recommendations?mood=happy` | Consulta películas y series, registra los resultados y devuelve hasta diez títulos |
| `GET /api/favorites` | Lista favoritas del usuario |
| `POST /api/favorites` | Agrega una favorita; responde 409 ante duplicado |
| `DELETE /api/favorites/:id` | Elimina una favorita del usuario o responde 404 |
| `GET /api/dashboard` | Devuelve historial y conteos por emoción, tipo y género |

Recomendaciones admite `moodId` opcional y comprueba que pertenezca al usuario. Esta petición GET también escribe registros: repetirla puede aumentar los conteos del tablero. Los contratos y límites se explican en [configuración y pruebas](docs/configuracion-pruebas.md).

## Estructura del repositorio

```text
frontend/
  src/
    pantallas/           Login, consentimiento, detección y catálogo
    components/          Detector, navegación, tarjetas y controles
    lib/                 Expresiones, agregación grupal, simulación y tema
    data/                Catálogo simulado
    estilos/             Estilos globales y tokens
    test/                Preparación de pruebas con jsdom
  public/models/         Modelos de detección de rostro y expresión
  .env.example           Variables públicas previstas
backend/
  src/
    app.js               Middleware HTTP y montaje de rutas
    server.js            Carga de entorno e inicio del servidor
    routes/              Ánimos, recomendaciones, favoritas y tablero
    middleware/auth.js   Verificación JWT y sincronización de usuario
    lib/prisma.js        Cliente Prisma y adaptador PostgreSQL
  prisma/                Esquema y migraciones
  prisma7.config.ts      Configuración explícita de Prisma
  tests/                 Pruebas de rutas con servicios simulados
e2e/                     Solo .gitkeep; sin configuración Playwright
docs/                    Documentación y criterios de aceptación
.github/workflows/       CI para frontend y backend
```

Las carpetas `controllers/`, `services/`, `schemas/` y `middlewares/` del backend siguen reservadas mediante `.gitkeep`; las rutas actuales concentran sus manejadores en `routes/`. El middleware de autenticación se encuentra en `middleware/`, en singular.

## Requisitos previos

- Git, Node.js y npm. Node.js 24 es una referencia compatible con los requisitos registrados en los archivos de bloqueo; también se admite Node.js 22 desde 22.12 en esa rama. El repositorio no fija una versión propia y CI utiliza `lts/*`.
- Para ejecutar el frontend: navegador moderno; para cámara, un dispositivo disponible y acceso mediante `localhost` o HTTPS.
- Para ejecutar el backend real: proyecto Supabase autorizado, conexión PostgreSQL, cliente Prisma generado y credencial TMDB válida como token Bearer.
- Dos terminales para levantar los procesos por separado.

## Instalación y configuración

Desde la raíz del repositorio, instalar cada proyecto por separado; no existe un `package.json` raíz.

```sh
cd frontend
npm ci
cd ../backend
npm ci
```

Preparar los archivos `.env` a partir de los ejemplos **solo si todavía no existen**. En PowerShell, desde la raíz:

```powershell
Copy-Item -LiteralPath frontend/.env.example -Destination frontend/.env
Copy-Item -LiteralPath backend/.env.example -Destination backend/.env
```

Completar los valores con los responsables de los servicios. El backend ya importa `dotenv/config`. La credencial TMDB y las conexiones privadas permanecen en el servidor; las variables `VITE_` son públicas. El inventario completo está en [configuración y pruebas](docs/configuracion-pruebas.md).

Antes de iniciar el backend, desde `backend/`, preparar Prisma con el archivo de configuración que realmente existe:

```sh
npx prisma validate --config ./prisma7.config.ts
npx prisma generate --config ./prisma7.config.ts
```

El servidor importa `src/generated/prisma/client.js`, por lo que necesita el cliente generado. Aplicar las migraciones únicamente en una base de desarrollo autorizada y después de revisar el procedimiento con Guillermo. La migración del 4 de noviembre elimina `TIRED` y `ADRENALINE`; si la base conserva esos valores, requiere resolverlos antes de aplicarla. No se ejecutaron migraciones en esta revisión.

## Ejecución

Frontend, desde una terminal en la raíz:

```sh
cd frontend
npm run dev
```

Abrir la URL impresa por Vite, normalmente `http://localhost:5173`. Puede usar otro puerto si está ocupado. Este prototipo se puede explorar sin levantar el backend y permite continuar sin iniciar sesión.

Backend, desde otra terminal en la raíz, después de configurar entorno, cliente y base:

```sh
cd backend
npm run dev
```

El puerto predeterminado es 3000. `npm start` ejecuta `tsx src/server.js` sin observación. Abrir `http://localhost:3000/health` para comprobar HTTP; eso no valida una sesión ni la conexión con TMDB.

Para compilar y consultar el frontend desde `frontend/`:

```sh
npm run build
npm run preview
```

Detener procesos con `Ctrl+C`. En PowerShell puede utilizarse `npm.cmd` si la política local bloquea `npm.ps1`.

## Pruebas y entrega

Desde cada carpeta se ejecuta `npm test`: backend usa `vitest run` y frontend `vitest run --passWithNoTests`. Frontend también tiene `npm run lint` y `npm run build`. No hay scripts de lint o build en backend ni un procedimiento E2E configurado.

Las pruebas backend simulan autenticación, Prisma y, en recomendaciones, TMDB. Las de cámara utilizan dobles del detector y del video. Aunque pasen, deben complementarse con verificaciones de servicios reales y navegador.

CI ejecuta `npm ci` y `npm test` en ambos proyectos, para pushes y PR dirigidos a `main` y `develop`. No incluye lint, compilación ni E2E; tampoco se ejecuta con todos los pushes a ramas de trabajo, como pide el brief. El checklist conserva esa diferencia para Julio.

## Documentación

- [Expresiones y géneros implementados](docs/emociones-generos.md): issue #9; mapeo real y alternativas por validar.
- [Consentimiento y privacidad](docs/consentimiento-privacidad.md): issue #30; textos para incorporar y alcance de los datos.
- [Configuración y pruebas](docs/configuracion-pruebas.md): issue #39; variables, contratos y procedimientos.
- [Checklist de aceptación](docs/checklist-aceptacion.md): issue #40; requisitos del brief, integración y evidencias.
- [Guion de presentación](docs/guion-presentacion.md): issue #49; recorrido y participación del equipo.



## Equipo y flujo de Git

| Integrante | Carnet | Responsabilidad |
|---|---|---|
| J. Rodrigo Herrera | 1042619 | Frontend y detección |
| Michael Gutiérrez | 1199723 | API, géneros y TMDB |
| Guillermo Contreras | 1154322 | Datos, Prisma, Supabase y autenticación |
| Julio Portillo | 1160822 | Pruebas, CI y despliegue |
| Luis Samayoa | 1227421 | Documentación y apoyo |

Para organizar el desarrollo de Butaca, cada integrante trabaja en una rama independiente según sus responsabilidades. Esto permite desarrollar nuevas funcionalidades y realizar correcciones sin afectar directamente el trabajo de los demás.Para organizar el desarrollo de Butaca, cada integrante trabaja en una rama independiente según sus responsabilidades. Esto permite desarrollar nuevas funcionalidades y realizar correcciones sin afectar directamente el trabajo de los demás.