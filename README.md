# Butaca

Proyecto final del curso de Programación Web de la Universidad Rafael Landívar. Butaca propone recomendar películas y series a partir de un ánimo elegido por la persona o de una expresión facial estimada con la cámara. La estimación es una señal para orientar el catálogo; no determina el estado emocional ni constituye un diagnóstico.

## Objetivos

- Permitir elegir el ánimo sin obligar a utilizar la cámara.
- Relacionar las siete expresiones del detector con géneros de TMDB, diferenciando películas y series.
- Integrar una interfaz React con una API Express y persistencia en PostgreSQL mediante Prisma y Supabase.
- Incorporar consentimiento, documentación reproducible y verificaciones del recorrido funcional.

## Estado del proyecto

Revisión documental del **2 de noviembre de 2026**, sobre `docs/luis`, base `f06a7ba`. Esta rama permite iniciar una interfaz que muestra «Butaca» y una API con `GET /health`, cuya respuesta definida es `{"status":"ok"}`. Las carpetas de rutas y controladores están vacías, el esquema Prisma no tiene modelos de dominio y todavía no hay pruebas implementadas.

Se consultaron referencias remotas disponibles localmente, sin mezclarlas ni actualizar su contenido desde el servidor:

| Referencia | Avance observado en código | Limitación |
|---|---|---|
| `origin/feature/frontend-rodrigo` (`b2a4778`) | Consentimiento, cámara, selección manual, recomendaciones simuladas, favoritas en memoria y pruebas de componentes | Sin autenticación real ni conexión al catálogo o persistencia; tablero con espacios reservados para gráficas |
| `origin/feature/backend-guille` (`0767817`) | Modelos de usuario, ánimo, favoritas y recomendaciones; validación JWT y `/api/me` | No integrado aquí; ejecución y migraciones no verificadas |
| `origin/develop` (`d4c2fff`) | Identificación del equipo en el README | Consultada para respetar nombres y carnets |

**Pendientes de integración:** autenticación, consulta real a TMDB, almacenamiento del historial y favoritas, gráficas, contrato de ánimo y pruebas E2E. El frontend de Rodrigo maneja siete expresiones y el esquema de Guille usa `HAPPY`, `SAD`, `TIRED` y `ADRENALINE`: el equipo debe acordar su correspondencia antes de guardar resultados.

## Tecnologías y arquitectura

| Tecnología | Uso y estado |
|---|---|
| React 19 y Vite 8 | Interfaz y servidor de desarrollo; instalables desde `frontend/` |
| Node.js y Express 5 | API HTTP; configuración JSON y ruta de salud existentes |
| Prisma 7 y Supabase (PostgreSQL) | Persistencia prevista; configuración Prisma existente, sin conexión utilizada por la API de esta rama |
| face-api.js | Análisis facial previsto en el navegador; Rodrigo utiliza `@vladmandic/face-api` en su rama |
| TMDB | Fuente prevista de títulos y géneros; integración no disponible en esta rama |
| `node:test`, Supertest y Vitest | Herramientas declaradas para backend y frontend; sin casos en esta rama |
| Playwright | Herramienta prevista para E2E; sin dependencia, configuración ni casos aquí |
| GitHub Actions | Jobs separados de instalación y pruebas para frontend y backend |

La arquitectura prevista sigue este recorrido: navegador → API Express → TMDB para el catálogo y Prisma → PostgreSQL en Supabase para los datos. Supabase también participa en la autenticación prevista. El análisis de cámara se plantea dentro del navegador; enviar un resultado de ánimo es distinto de enviar imágenes. Actualmente la interfaz y `/health` funcionan como piezas independientes: no hay llamadas entre ellas ni acceso a servicios externos en su código.

## Estructura

```text
frontend/
  src/                  Entrada React y componente inicial
  .env.example          Variables públicas previstas
  vite.config.js        Configuración de Vite y React
backend/
  src/
    app.js              Aplicación Express y GET /health
    server.js           Escucha HTTP; puerto predeterminado 3000
    controllers/        Reservado para controladores
    routes/             Reservado para rutas
    middlewares/        Reservado para intermediarios HTTP
    schemas/            Reservado para validación
    services/           Reservado para servicios
  prisma/schema.prisma  Generador y proveedor PostgreSQL
  prisma7.config.ts     Configuración Prisma con nombre explícito
  tests/                Sin casos; contiene .gitkeep
e2e/                    Sin casos; contiene .gitkeep
docs/                   Entregables de documentación
.github/workflows/      Integración continua
```

## Requisitos previos

- Git, Node.js y npm. Para esta base se recomienda Node.js 24; los requisitos registrados en los archivos de bloqueo permiten Node.js 22.12 o posterior dentro de la rama 22, o la rama 24. Vitest 5 descarta versiones anteriores que sí podrían ejecutar Vite.
- Dos terminales disponibles para ejecutar frontend y backend por separado.
- Para las integraciones futuras: proyecto Supabase, acceso autorizado a TMDB y variables proporcionadas por el responsable, nunca publicadas en Git.
- Para probar la cámara cuando se integre: navegador con cámara disponible y acceso por `localhost` o HTTPS.

## Instalación y ejecución

Desde una copia del repositorio, verifica que estás en `docs/luis`. Los siguientes comandos parten de la raíz. No hay un `package.json` raíz que instale o ejecute ambos proyectos.

Primera terminal, backend:

```sh
cd backend
npm ci
npm run dev
```

La API utiliza el puerto 3000 salvo que `PORT` esté definido en el entorno del proceso. Abre `http://localhost:3000/health` para comprobar la respuesta. `npm start` ejecuta el servidor sin el modo de observación.

Segunda terminal, frontend:

```sh
cd frontend
npm ci
npm run dev
```

Abre la dirección que imprima Vite, normalmente `http://localhost:5173`. Si el puerto está ocupado puede asignar otro. En esta rama se verá únicamente el título «Butaca».

Para preparar y consultar la compilación del frontend, desde `frontend/`:

```sh
npm run build
npm run preview
```

`preview` requiere la compilación previa. Para detener los servidores, usa `Ctrl+C`. En PowerShell, si la política bloquea `npm.ps1`, utiliza `npm.cmd` en los mismos comandos.

## Configuración y pruebas

Los ejemplos de entorno contienen nombres de variables, sin credenciales. La API actual no carga `.env` automáticamente y solo consume `PORT`; copiar los ejemplos no habilita por sí solo Supabase o TMDB. Consulta [configuración y pruebas](docs/configuracion-pruebas.md) para preparar los archivos, ejecutar los scripts existentes y conocer las limitaciones de Prisma y E2E.

Desde cada carpeta (`frontend/` y `backend/`) se ejecuta `npm test`. En frontend también existe `npm run lint`. Un proceso de pruebas que finalice sin errores y descubra cero casos no demuestra aceptación funcional. CI solo ejecuta `npm ci` y `npm test` en ambos proyectos; no ejecuta compilación, lint ni E2E.

## Documentación

- [Propuesta de expresiones y géneros](docs/emociones-generos.md): issue #9; requiere validación de Michael.
- [Consentimiento y privacidad](docs/consentimiento-privacidad.md): issue #30; textos para Rodrigo y alcance revisado.
- [Configuración y pruebas](docs/configuracion-pruebas.md): issue #39; variables, comandos y verificaciones realizadas.
- [Checklist de aceptación](docs/checklist-aceptacion.md): issue #40; evidencia y requisitos pendientes.
- [Guion de presentación](docs/guion-presentacion.md): issue #49; intervención de los cinco integrantes y preguntas técnicas.

Este README cubre los issues #21 y #50. Su versión para la entrega deberá actualizarse cuando se integren las funcionalidades pendientes y existan resultados de pruebas.

## Equipo y roles

| Integrante | Carnet | Rol |
|---|---|---|
| J. Rodrigo Herrera | 1042619 | Frontend |
| Michael Gutiérrez | 1199723 | Backend (API y TMDB) |
| Guillermo Contreras | 1154322 | Backend (datos y sesión) |
| Julio Portillo | 1160822 | QA y DevOps |
| Luis Samayoa | 1227421 | Documentación y apoyo |

## Flujo de trabajo con Git

Cada integrante trabaja en su rama y propone sus cambios hacia `develop`; `main` se reserva para las entregas. El acuerdo documentado exige una revisión aprobada y CI en verde para integrar un PR. La protección efectiva de ramas no se verificó desde la configuración del repositorio remoto.

La documentación de Luis se mantiene en `docs/luis`. Esta actualización no mezcla ramas ni modifica implementación, dependencias, migraciones o CI.
