# Checklist de aceptación

Issue #40. Corte del **4 de noviembre de 2026**, rama `docs/luis`, base integrada `0cb87c9`. Se utiliza el brief completo del cliente, encontrado en los recursos locales del HTML de Moodle suministrado, y la implementación presente en esta rama.

Fuente académica: copia guardada de `Brief_Cliente_Butaca_tlae.htm`, apartados «Criterios de aceptación» y «Definición de terminado». El archivo está incluido en la carpeta de recursos de la página suministrada; no se deducen requisitos del menú o de los demás contenidos del curso.

## Estados y evidencia

- **Implementado:** comportamiento identificable en código; no implica que se haya ejecutado o aceptado.
- **Integración pendiente:** hay piezas disponibles, pero falta unirlas para el recorrido completo.
- **No verificado:** requiere ejecución o evidencia todavía no obtenida.
- **Completo documental:** entregable redactado y revisado dentro del alcance de Luis.

Las casillas funcionales permanecen abiertas hasta disponer de resultados. Para aceptar un criterio, registrar commit, fecha, entorno, pasos, resultado esperado, resultado obtenido y evidencia. Las pruebas simuladas y las comprobaciones contra servicios reales se registran por separado.

## Funcionamiento

| Criterio de aceptación | Estado observado | Condición para aceptar |
|---|---|---|
| [ ] Login con Google o GitHub | Integración pendiente: botones deshabilitados y usuario invitado en frontend | Completar autenticación, mostrar perfil real, cerrar sesión y comprobar errores. |
| [ ] Estimar expresión individual con cámara | Implementado en detector local; no verificado con hardware | Confirmar modelos, permiso, análisis y resultado en navegador. |
| [ ] Selección manual sin usar cámara | Implementado, con casos automatizados existentes sin ejecutar | Rechazar consentimiento y comprobar que no se solicita video. |
| [ ] Detección grupal de hasta seis rostros | Implementada agregación ponderada y presentación individual | Probar grupo, ausencia de rostros, empates y límite; confirmar acuerdo de participantes. |
| [ ] Opción de acompañar o cambiar el ánimo | Implementada sobre catálogo simulado | Acordar intención con la API y comprobar el filtro efectivo sin prometer efectos emocionales. |
| [ ] Películas y series reales con póster y sinopsis | Integración pendiente: API TMDB disponible, interfaz simulada | Mostrar respuestas reales del backend y adaptar campos, imágenes y estados. |
| [ ] Manejo de carga, error y lista vacía | Implementado en interfaz con simulación | Probar también errores y vacíos reales de la integración. |
| [ ] Favoritas guardadas y recuperadas por cuenta | Integración pendiente: API y modelos presentes; frontend en memoria | Agregar, recargar, consultar y eliminar; verificar duplicado y aislamiento. |
| [ ] Tablero con evolución y tipos/géneros recomendados | Integración pendiente: endpoint agrega datos, pantalla sin gráficas | Consumir API y presentar historial y conteos reales. |
| [ ] Navegación accesible y adaptable | Componentes, navegación móvil y tema presentes; no verificado | Recorrido con teclado y comprobación móvil/escritorio, contraste y mensajes. |

La detección grupal y la intención amplían el prototipo; no sustituyen los requisitos del brief de cuenta, catálogo y persistencia.

## Integración y datos

- [ ] **Integración pendiente:** conectar el frontend por HTTP con el backend. No se encontraron llamadas a sus endpoints en el cliente.
- [ ] **No verificado:** aplicar y comprobar migraciones en una base autorizada, generar cliente Prisma y arrancar el backend.
- [ ] **No verificado:** resolver con Guillermo registros antiguos `TIRED`/`ADRENALINE` antes de aplicar la migración que elimina esos valores. El esquema actual ya tiene siete categorías.
- [ ] **Integración pendiente:** adaptar objetos del frontend a `tmdbId`, `mediaType`, `title`, `posterPath`, `overview`, `year`, `voteAverage` y `genres`.
- [ ] **Pendiente de acuerdo:** definir almacenamiento de expresión original frente a ánimo objetivo, origen manual/cámara y modo grupal. Los modelos no guardan participantes ni intención.
- [ ] **Pendiente de acuerdo:** completar el contrato de favoritas para los campos adicionales del esquema que el POST actual no procesa.
- [ ] **Pendiente de validación de Michael:** confirmar mapeo de géneros, condición AND, ID repetido para series en `angry` y respuesta ante escasez de títulos.
- [ ] **No verificado:** comprobar que repetir `GET /api/recommendations` y sus escrituras produce los conteos esperados. El tablero mide recomendaciones registradas, no visualizaciones.
- [ ] **No verificado:** comprobar estado vacío y errores de PostgreSQL/TMDB sin exponer información sensible al cliente.

## Seguridad

| Criterio del brief | Evidencia implementada | Verificación pendiente |
|---|---|---|
| [ ] Llave TMDB solo en servidor | Token Bearer leído de entorno backend | Revisar compilación final, logs y despliegue; no basta con excluir `.env`. |
| [ ] Validación de entradas | Zod en ánimos y favoritas; lista permitida de emociones para recomendar | Ejecutar casos inválidos y revisar los demás parámetros del contrato. |
| [ ] Sesión y rutas protegidas | JWKS, audiencia `authenticated` y middleware en rutas de datos | Probar tokens ausentes, inválidos, vencidos y ajenos; revisar validación del emisor para la configuración de entrega. |
| [ ] Datos aislados por usuario | Filtros por usuario y comprobación de pertenencia de `moodId` | Probar con dos cuentas reales y accesos cruzados; los tests sustituyen autenticación. |
| [ ] CORS, Helmet y rate limit | Origen por entorno; límite general de 300 y de recomendaciones de 30 por 15 minutos, por IP en la configuración actual | Probar origen permitido/rechazado y respuesta 429; revisar funcionamiento tras proxy si se despliega. |
| [ ] HTTPS | Sin evidencia de despliegue incluida en esta revisión | Comprobar certificado y URLs reales; `localhost` no acredita HTTPS en nube. |

## Privacidad

- [ ] **Implementado, no verificado en navegador:** consentimiento previo y permiso adicional del navegador, sin audio.
- [ ] **Completo documental; incorporación pendiente:** texto definitivo de consentimiento y aviso de privacidad en el documento de Luis.
- [ ] **No verificado:** confirmar con inspección de red que el flujo de cámara no sube imágenes en la versión evaluada; el código revisado no incluye esa subida.
- [ ] **No verificado:** cámara detenida después del análisis, incluso sin rostro, al elegir manualmente y al abandonar la pantalla.
- [ ] **Pendiente de incorporación:** informar a todas las personas del modo grupal; la aceptación actual es única para la visita y no registra decisiones por participante.
- [ ] **Pendiente de acuerdo:** informar cuándo se guardarán resultados por cuenta, definir contacto y conservación, y acordar eliminación de datos sin prometer rutas inexistentes.
- [ ] **No verificado:** confirmar que los datos temporales de ánimo se distinguen de `butaca-tema`, preferencia que sí se guarda localmente.

## Pruebas y CI

- [ ] **Implementado, ejecución pendiente:** cuatro archivos backend con Vitest y Supertest para salud, ánimos, favoritas, recomendaciones y tablero.
- [ ] **Implementado, ejecución pendiente:** pruebas frontend de componentes, rutas, consentimiento, grupo, simulación y tema.
- [ ] **No verificado:** ejecutar ambas suites con dependencias instaladas. Los dos intentos de esta revisión fallaron al no encontrar Vitest; no se ejecutaron casos.
- [ ] **No verificado:** ejecutar lint y compilación del frontend. No hay scripts equivalentes en backend.
- [ ] **Pendiente:** complementar pruebas HTTP con validación de JWT, PostgreSQL y TMDB reales en un entorno autorizado; las actuales usan dobles.
- [ ] **Pendiente:** configurar Playwright y comprobar el flujo completo. `e2e/` solo contiene `.gitkeep`; las rutas `?simular=` no son una suite E2E.
- [ ] **Implementado parcialmente respecto al brief:** CI instala y ejecuta tests, pero solo ante pushes/PR a `main` y `develop`; revisar el requisito de pruebas en cada push.
- [ ] **No verificado:** revisar la ejecución remota de CI del commit de entrega y sus conteos, además de su color de estado.

## Entrega académica

- [x] **Completo documental:** README con arquitectura, estado, comandos y pendientes (#21 y #50).
- [x] **Completo documental:** mapeo real de siete expresiones y alternativas separadas (#9).
- [x] **Completo documental:** consentimiento y privacidad individual/grupal (#30).
- [x] **Completo documental:** configuración, pruebas y límites de la evidencia (#39).
- [x] **Completo documental:** checklist trazable al brief (#40).
- [x] **Completo documental:** guion distribuido entre los cinco roles (#49).
- [ ] **Pendiente de revisión del equipo:** validar textos y contratos antes de presentar el producto.
- [ ] **No verificado:** PR de entrega con revisión y CI aprobado. Esta tarea no crea PR, commit ni push.
- [ ] **Pendiente:** ensayar una demostración reproducible del flujo full-stack y separar avances simulados de funciones conectadas.
- [ ] **Pendiente:** cada integrante prepara respuestas propias sobre decisión difícil, alternativa descartada y aspecto del que está menos seguro, como pide el brief.
- [ ] **Pendiente de confirmación:** elegir y demostrar la alternativa del punto 6 de terminado: nube con HTTPS real, música/GIF o AWS Rekognition. El documento no exige las tres; no se encontró evidencia suficiente para aceptar ninguna.
- [ ] **Pendiente de confirmación:** fecha, duración y condiciones de exposición; el brief guardado deja fecha y equipo como campos por definir.

El brief se usa como criterio académico del producto. No autoriza a modificar implementación o publicar cambios durante esta tarea documental. Los resultados ejecutados se registran en [configuración y pruebas](configuracion-pruebas.md).
