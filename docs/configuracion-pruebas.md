# Configuración y pruebas

Issue #39. Alcance: `docs/luis`, base `f06a7ba`, revisada el 2 de noviembre de 2026. Los comandos corresponden a sus archivos `package.json`, no a scripts de otras ramas.

## Preparar el entorno

Usar Node.js 24 y npm; también es compatible la rama Node.js 22 desde 22.12 según los requisitos de las herramientas en los archivos de bloqueo. No existe una versión fijada por el proyecto; CI solicita `lts/*`. En la revisión local estaban disponibles Node.js `v24.19.0` y npm `11.17.0`.

Desde la raíz, en PowerShell, pueden prepararse los archivos locales cuando se necesiten las integraciones:

```powershell
Copy-Item -LiteralPath backend/.env.example -Destination backend/.env
Copy-Item -LiteralPath frontend/.env.example -Destination frontend/.env
```

Ejecutar estas copias solo si el destino no existe, para conservar la configuración local. Completar valores con los responsables. `.gitignore` excluye `.env` y `.env.*`, conservando `.env.example`. No incluir claves reales en capturas, logs, documentación o commits. Las variables `VITE_` forman parte del código público entregado al navegador.

## Variables del backend

| Variable | Propósito | Consumo observado en esta rama |
|---|---|---|
| `PORT` | Puerto HTTP; ejemplo local `3000` | `src/server.js`; usa `3000` si no se proporciona. |
| `DATABASE_URL` | Conexión PostgreSQL que debe proporcionar Guille | `prisma7.config.ts`; la API actual no usa Prisma. |
| `DIRECT_URL` | Conexión directa prevista para base de datos | Declarada, sin referencia en el código actual ni en la configuración Prisma. |
| `TMDB_API_KEY` | Credencial privada para la consulta de catálogo | Declarada, sin integración actual. Michael debe confirmar el mecanismo de autenticación. |
| `SUPABASE_URL` | URL del proyecto Supabase | Declarada, sin consumo actual. |
| `SUPABASE_JWT_SECRET` | Secreto previsto para validación de sesión | Declarada, sin consumo actual. La rama revisada de Guille valida con JWKS, por lo que debe confirmar si seguirá siendo necesaria. |
| `FRONTEND_URL` | Origen permitido previsto; ejemplo local `http://localhost:5173` | Declarada, sin CORS configurado en esta rama. |

El `server.js` de esta rama no importa `dotenv/config` y los scripts no incluyen `--env-file`. Por tanto, `npm run dev` y `npm start` no leen automáticamente `backend/.env`. Para variar el puerto en PowerShell, desde `backend/`:

```powershell
$env:PORT = '3000'
npm run dev
```

Esto define la variable del proceso en esa terminal. La configuración Prisma sí importa `dotenv/config`, un flujo separado del servidor.

## Variables del frontend

| Variable | Propósito previsto | Estado |
|---|---|---|
| `VITE_API_URL` | URL pública de la API; ejemplo local `http://localhost:3000` | No referenciada por la interfaz inicial. Confirmar si el contrato final incluye `/api`. |
| `VITE_SUPABASE_URL` | URL pública del proyecto Supabase | Sin cliente de autenticación integrado aquí. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de cliente prevista para Supabase | Sin consumo actual; nunca sustituir por una clave administrativa o de servicio. |

Vite utiliza el prefijo `VITE_` para variables expuestas al cliente. Reiniciar el servidor de desarrollo después de cambiar el entorno. La configuración de permisos de Supabase debe acordarse con Guille antes de conectar datos reales.

## Prisma

La configuración se llama `prisma7.config.ts`; no debe suponerse que la CLI la detecta como `prisma.config.ts`. Cuando se instalen dependencias y exista una `DATABASE_URL` local apropiada, desde `backend/` se puede validar el esquema especificando el archivo:

```sh
npx prisma validate --config ./prisma7.config.ts
```

Este procedimiento no se ejecutó durante la revisión. El esquema actual solo declara generador y proveedor PostgreSQL: no hay modelos de aplicación ni migraciones en esta rama. No se prescribe migrar o generar un cliente funcional sobre este esquema vacío. Las migraciones de Guille requieren instrucciones de su responsable después de integrarse y una base de desarrollo separada; no se ejecutaron sobre servicios compartidos.

## Pruebas del backend

Desde la raíz:

```sh
cd backend
npm ci
npm test
```

`npm test` ejecuta `node --test`. Supertest está declarado para probar la aplicación exportada por `src/app.js` sin iniciar el servidor de producción. No hay casos en `backend/tests/`; `.gitkeep` solo conserva la carpeta. El runner puede finalizar correctamente con cero pruebas, por lo que debe revisarse el conteo, además del código de salida.

Para una comprobación HTTP manual, después de instalar dependencias y arrancar el backend en otra terminal:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health
```

Resultado esperado según el controlador: propiedad `status` con valor `ok`. Esta llamada no se ejecutó durante la revisión y no demuestra conexión con Supabase o TMDB.

## Pruebas del frontend

Desde la raíz:

```sh
cd frontend
npm ci
npm test
npm run lint
npm run build
```

`npm test` ejecuta `vitest run --passWithNoTests`; el indicador permite terminar sin error aunque no se descubran casos. Lint ejecuta Oxlint y build ejecuta Vite; son verificaciones distintas de las pruebas. Esta rama no contiene casos de frontend. Los casos observados en la rama de Rodrigo no se ejecutaron ni se incorporaron aquí.

## Pruebas E2E

`e2e/` solo contiene `.gitkeep`. No hay dependencia de Playwright, configuración, casos, script E2E ni job de CI correspondiente. **Todavía no existe un procedimiento E2E ejecutable del proyecto.**

Julio debe definir la ubicación del paquete de pruebas, instalar y fijar Playwright y sus navegadores, configurar las URLs y el arranque de los servidores, y escribir los casos. Una vez incorporado ese trabajo, el procedimiento deberá indicar el directorio exacto y los comandos de instalación y ejecución. No usar `npx playwright test` ahora como si validara el proyecto: podría descargar una herramienta que esta rama no declara.

El recorrido que deberá cubrir incluye: consentimiento aceptado y rechazado, permiso denegado, cámara ausente, análisis sin rostro, selección manual, consulta de recomendaciones, estados vacío y error, favoritas y sesión. Deben diferenciarse pruebas con cámara simulada de verificaciones con cámara real y registrar el navegador utilizado.

## Integración continua

`.github/workflows/ci.yml` se activa con pushes y PR hacia `main` o `develop`. Cada job instala dependencias con `npm ci` y ejecuta `npm test` en su carpeta. No incluye lint, build, cobertura o E2E. No se consultaron ejecuciones remotas de Actions ni se verificó la protección de ramas. Un CI verde con cero casos no acredita el cumplimiento funcional.

## Registro de esta revisión

| Verificación | Resultado observado |
|---|---|
| Rama y estado inicial | `docs/luis`; árbol de trabajo limpio antes de editar. |
| Inspección de implementación y configuración | README, ejemplos, paquetes, esquema, servidor, interfaz y CI revisados; rutas y controladores adicionales vacíos. |
| Referencias de Rodrigo y Guille | Leídas mediante `git show`; sin checkout, merge ni ejecución de sus cambios. |
| `npm.cmd test` en `backend/` | Código de salida 0; **0 pruebas, 0 suites**. No constituye una prueba funcional aprobada. |
| `npm.cmd test` en `frontend/` | Código de salida 1: no se encontró `vitest`; `node_modules` no está instalado. |
| Lint, build, HTTP, cámara, base de datos y catálogo | No ejecutados; no se instalaron dependencias ni se usaron credenciales. |
| E2E | No ejecutado: infraestructura y casos pendientes. |
| Revisión documental | Enlaces relativos existentes, bloques de código cerrados y las 10 variables de los ejemplos documentadas; `git diff --check` sin errores. |
| Alcance final | Solo README y cinco archivos en `docs/`; rama `docs/luis`, sin cambios de implementación ni commits. |

En PowerShell, la invocación `npm` encontró un bloqueo de `npm.ps1` por la política de ejecución. Se utilizó `npm.cmd` sin modificar dicha política. Los resultados anteriores corresponden a los comandos realmente ejecutados, no al resultado esperado después de instalar dependencias.
