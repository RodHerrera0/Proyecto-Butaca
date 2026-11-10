# Checklist de aceptación

Issue #40. Actualizado el **9 de noviembre de 2026** sobre `develop` (`0fb9d4a`, PR #67), con la aplicación publicada en https://proyecto-butaca-eta.vercel.app y la API en Render. Los criterios salen del brief del cliente («Criterios de aceptación» y «Definición de terminado»).

## Cómo leer este documento

- **[x] Verificado:** se comprobó en ejecución; se indica la evidencia.
- **[ ] Pendiente:** falta comprobarlo o decidirlo; se indica qué falta.

Las pruebas automatizadas usan dobles de Supabase, Prisma y TMDB. Por eso cada criterio funcional indica también si se probó con los servicios reales.

## Funcionamiento

| Criterio | Evidencia |
|---|---|
| [x] Login con Google o GitHub | Probado en la aplicación publicada con las dos cuentas: muestra nombre y avatar y permite cerrar sesión. |
| [x] Estimar la expresión individual con cámara | Probado en navegador con cámara integrada y webcam externa; pruebas de `DetectorEmocion`. |
| [x] Selección manual sin usar cámara | Al rechazar el consentimiento no se llama a `getUserMedia` (pruebas de `App` y `DetectorEmocion`; auditoría en navegador). |
| [x] Detección grupal de hasta seis rostros | Agregación ponderada con desempates (`grupo.test.js`), presentación por persona y `?simular=grupo`. |
| [x] Opción de acompañar o cambiar el ánimo | `emocionObjetivo` y selector de intención; las recomendaciones se piden para la emoción objetivo. |
| [x] Películas y series reales con póster y sinopsis | Recomendaciones reales de TMDB en la aplicación publicada (por ejemplo, «Proyecto Fin del Mundo», «The Office»). |
| [x] Manejo de carga, error y lista vacía | Esqueletos de carga, aviso con «Reintentar» y lista vacía, en datos reales y con `?simular=error|vacio`; pruebas de pantallas y E2E. |
| [x] Favoritas guardadas y recuperadas por cuenta | Se agregaron favoritas, se cerró y volvió a abrir la página y seguían; también se pueden quitar. |
| [x] Tablero con evolución, tipos y géneros | Datos reales de la cuenta: ánimo en el tiempo, conteo por emoción, géneros y reparto películas/series. |
| [x] Navegación accesible y adaptable | Auditoría con axe en las siete pantallas, tema claro y oscuro, móvil (375 px) y escritorio: 0 violaciones, sin scroll horizontal; el primer Tab lleva a «Saltar al contenido». |

## Integración y datos

- [x] Frontend conectado al backend por HTTP con el token de Supabase (`lib/api.js`, `App.conectado.test.jsx`).
- [x] Contratos adaptados: `tmdbId`, `mediaType`, `title`, `posterPath`, `overview`, `year`, `voteAverage` y `genres` se convierten a la forma de las tarjetas (`adaptadores.js` y sus pruebas).
- [x] Migraciones aplicadas en la base del despliegue (`npx prisma migrate deploy` en el build de Render) y cliente Prisma generado en la instalación (`postinstall`).
- [x] Mapeo de géneros aprobado (#10), con géneros unidos por OR (`|`) para no vaciar el catálogo.
- [x] Las escrituras de recomendaciones alimentan el tablero: los conteos crecen con cada consulta (comprobado en el tablero publicado).
- [ ] Pendiente de acuerdo: guardar el origen (cámara, manual o grupo) y la intención junto al ánimo. Hoy se guardan la emoción y la confianza.

## Seguridad

| Criterio | Evidencia |
|---|---|
| [x] Llave TMDB solo en el servidor | Se revisó el JavaScript publicado: solo contiene la URL de la API y la clave pública de Supabase. |
| [x] Validación de entradas | Zod en ánimos y favoritas, lista cerrada de emociones y `moodId` del usuario (`validation.test.js`, `recommendations.test.js`). |
| [x] Sesión y rutas protegidas | Sin token o con token falso, la API publicada responde 401 (comprobado contra Render). |
| [x] Datos aislados por usuario | Filtros por usuario y 404 ante registros ajenos (`favorites.test.js`, `recommendations.test.js`). Falta una prueba manual con dos cuentas reales. |
| [x] CORS, Helmet y límite de peticiones | Origen ajeno rechazado con 403 y dominio de Vercel aceptado; CSP, HSTS y `nosniff` presentes en Render; 429 probado en `security.test.js`. |
| [x] HTTPS | Vercel y Render sirven por HTTPS con HSTS. |

## Privacidad

- [x] Consentimiento previo con explicación, más el permiso propio del navegador; sin audio.
- [x] La imagen no sale del navegador: el código no convierte ni envía cuadros, y `POST /api/moods` solo lleva `mood` y `confidence` (`api.test.js`).
- [x] La cámara se detiene después del análisis, aunque no haya rostro, al elegir a mano y al salir de la pantalla (pruebas de `DetectorEmocion`).
- [x] En modo grupo se pide que todas las personas estén informadas antes de encuadrarlas (guion y pista en pantalla).
- [ ] Pendiente de acuerdo: plazo de conservación y forma de solicitar la eliminación de los datos de la cuenta.

## Pruebas y CI

- [x] Backend: 78 pruebas en 9 archivos (Vitest y Supertest).
- [x] Frontend: 84 pruebas en 13 archivos, más lint y build sin errores.
- [x] E2E: 5 recorridos de Playwright en Chromium (`e2e/butaca-flow.spec.js`).
- [x] CI en cada push a `main`, `develop` y `feature/**`, y en los PR: jobs Backend, Frontend y E2E, con el reporte de Playwright como artefacto.
- [x] Último CI de `develop` en verde (merge del PR #67).
- [x] Flujo completo verificado con servicios reales en la aplicación publicada (#61).

## Entrega académica

- [x] README con funciones, arquitectura, instalación, pruebas y despliegue.
- [x] Mapeo de expresiones y géneros (#9 y #10).
- [x] Consentimiento y privacidad (#30).
- [x] Configuración y pruebas (#39).
- [x] Guion de presentación con los cinco roles (#49).
- [x] Alternativa del punto 6 de «terminado»: **nube con HTTPS real** (Vercel y Render).
- [ ] PR final de `develop` a `main` (#52).
- [ ] Ensayo completo de la demo (#53).
- [ ] Cada integrante prepara su decisión más difícil, alternativas y dudas (#54).
