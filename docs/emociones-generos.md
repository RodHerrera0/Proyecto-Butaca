# Expresiones faciales y géneros de TMDB

Issue #9. Documento original revisado el 4 de noviembre de 2026 sobre `docs/luis`, base `0cb87c9`; actualizado con las correcciones del 5 de noviembre y la decisión aprobada de Asco del issue #10. La tabla principal describe `backend/src/services/tmdb.js`, invocado desde `controllers/recommendations.js`. Michael confirmó la aprobación de Rodrigo para cambiar Asco a Comedia/Aventura; las otras seis asignaciones se conservan.

## Qué representa el resultado

El detector utiliza las siete claves de `frontend/src/lib/emociones.js`. En modo individual selecciona la expresión con mayor puntuación; si no encuentra rostro devuelve `null`. El resultado no prueba un estado emocional. Tampoco corresponde tratar el porcentaje como certeza de lo que siente la persona.

La API recibe las mismas claves en minúsculas. `POST /api/moods` las convierte a mayúsculas para el enum Prisma `Mood`, que ahora contiene las siete categorías. El antiguo desajuste con `TIRED` y `ADRENALINE` ya no aparece en el esquema actual; queda por comprobar la aplicación de las migraciones en la base utilizada por el equipo.

## Mapeo implementado en el backend

Los géneros se combinan con barras (`|`) en `with_genres`: la consulta acepta cualquiera de los géneros (OR). Corrección del 5 de noviembre de 2026 para #10 y #43. Los nombres de la tabla son etiquetas en español para facilitar su lectura; los signos `+` enumeran alternativas.

| Clave | Etiqueta | Películas: género e ID | Series: género e ID enviados | Lectura editorial del mapeo |
|---|---|---|---|---|
| `neutral` | Neutral | Aventura `12` + Comedia `35` | Acción y aventura `10759` + Comedia `35` | Historias dinámicas con humor cuando no hay una orientación expresiva marcada. |
| `happy` | Feliz | Comedia `35` + Animación `16` | Comedia `35` + Animación `16` | Entretenimiento animado con humor. |
| `sad` | Triste | Familia `10751` + Comedia `35` | Familia `10751` + Comedia `35` | Un tono familiar y cómico como alternativa de exploración. |
| `angry` | Enojado | Acción `28` + Aventura `12` | Acción y aventura `10759` | Relatos activos; ambos IDs de películas convergen en una categoría de televisión, sin duplicarla. |
| `fearful` | Miedo | Animación `16` + Familia `10751` | Animación `16` + Familia `10751` | Opciones animadas y familiares en lugar de asociar miedo con terror por defecto. |
| `disgusted` | Asco | Comedia `35` + Aventura `12` | Comedia `35` + Acción y aventura `10759` | Opciones de humor y aventura para «cambiar de aire»; cambio aprobado por Rodrigo y confirmado por Michael. |
| `surprised` | Sorpresa | Ciencia ficción `878` + Misterio `9648` | Ciencia ficción y fantasía `10765` + Misterio `9648` | Historias de descubrimiento e intriga. |

La última columna interpreta la selección observada; no atribuye al equipo una justificación científica ni garantiza un efecto emocional. La pertinencia y disponibilidad de títulos debe validarse con respuestas reales.

## Consulta y diferencias de catálogo

La conversión implementada para series es `28 → 10759`, `12 → 10759` y `878 → 10765`. Los demás IDs usados se conservan. Acción y aventura es una categoría conjunta en televisión; Ciencia ficción y fantasía también agrupa conceptos separados en películas.

Para `angry`, el código transforma `[28, 12]` y elimina duplicados con `Set`, enviando `[10759]` para series. Fantasía `14` no forma parte del mapeo actual, aunque se mencionara en la propuesta anterior.

El backend consulta `/discover/movie` y `/discover/tv` en paralelo con:

- Géneros unidos por barras, con semántica OR.
- Idioma `es-MX`, orden `popularity.desc` y mínimo de 200 votos.
- Hasta cinco resultados de cada respuesta, devueltos primero como películas y luego como series.

Así puede devolver hasta diez títulos; no es un ranking único por calificación. Guarda los IDs de género devueltos como cadenas de texto, junto con `MOVIE` o `TV`. Cada consulta tiene un máximo de ocho segundos, incluyendo lectura del JSON; se cancela con AbortController. Si ambos catálogos están vacíos responde `200 []` sin insertar recomendaciones. Un JSON sin arreglo `results` se trata como error del proveedor. Los errores TMDB se propagan al manejador general: HTTP 500 con `{"error":"Error interno"}`, sin persistir resultados parciales. No existe un catálogo alternativo en esa ruta.

La documentación oficial distingue los catálogos de [películas](https://developer.themoviedb.org/reference/genre-movie-list) y [series](https://developer.themoviedb.org/reference/genre-tv-list). Las referencias de [Discover para películas](https://developer.themoviedb.org/reference/discover-movie) y [Discover para series](https://developer.themoviedb.org/reference/discover-tv) especifican que las comas combinan con AND y las barras con OR. No se hicieron consultas autenticadas al catálogo en esta revisión.

## Ánimo objetivo y grupos en el frontend

La integración de Rodrigo en `develop` ya consulta la API mediante `frontend/src/lib/api.js`; los datos simulados siguen disponibles en modo de demostración. La opción «Acompañarlo» conserva la expresión; «Cambiarlo» aplica la transformación de `emocionObjetivo`:

| Expresión inicial | Objetivo al elegir «Cambiarlo» |
|---|---|
| `neutral` | `surprised` |
| `happy` | `surprised` |
| `sad` | `happy` |
| `angry` | `neutral` |
| `fearful` | `happy` |
| `disgusted` | `happy` |
| `surprised` | `neutral` |

Esa transformación es una preferencia de recomendación, no evidencia de que el ánimo cambie. La integración actual ya distingue los datos: `frontend/src/App.jsx` registra la expresión original mediante `POST /api/moods`; `Recomendaciones.jsx` calcula `emocionObjetivo` y envía la emoción objetivo como `mood`. Enlaza `moodId` cuando el filtro coincide con ese objetivo y omite la relación al elegir otro chip. Así puede conservarse `disgusted` en el historial y consultar `happy` al elegir «Cambiarlo». La API no recibe la intención ni calcula esa transformación por su cuenta. Falta validar este recorrido con sesión, base de datos y catálogo reales.

En grupo se analizan hasta seis rostros y se suman las puntuaciones de cada expresión dominante. Gana el mayor peso; los empates se resuelven por número de personas y luego por el orden de las siete claves. La confianza agregada es el promedio de quienes aportan a la categoría ganadora. Puede ganar una categoría que no sea mayoría numérica y no representa el sentir de todas las personas. El backend no tiene un contrato para participantes, conteo u origen grupal.

## Diferencias con la propuesta inicial y alternativas

La propuesta anterior incluía más alternativas por fila y no describía el filtro AND que existía antes de la corrección a OR. Para `disgusted` proponía comedia, aventura y fantasía; el backend utilizaba documental y drama antes de la decisión del issue #10. Ahora implementa comedia o aventura, sin añadir fantasía. Para `neutral` la propuesta sugería drama y documental además de aventura, mientras la API conserva aventura o comedia.

Las demás alternativas de aquella propuesta no forman parte de la configuración implementada. Se conservan OR, deduplicación de series y respuesta vacía `200 []`. El único cambio de asignación en esta unidad del issue #10 es Asco: de `[99, 18]` a `[35, 12]`; las otras seis emociones permanecen iguales.

La intención del frontend ya se aplica como se describe arriba; el resultado grupal sigue sin tener un contrato propio de participantes en el backend. Queda pendiente verificar la calidad del catálogo obtenido. El umbral `0.5` de `TinyFaceDetectorOptions` controla la detección del rostro, no una confianza mínima para aceptar una emoción.

## Decisión aprobada de Asco — issue #10

Estado: cambio aprobado por Rodrigo, responsable del frontend, y confirmado por Michael para su implementación en el backend. Rodrigo se encargará de actualizar el frontend; esta unidad no modifica sus archivos.

| Catálogo | Géneros aprobados | Filtro TMDB |
|---|---|---|
| Películas | Comedia `35` o Aventura `12` | `with_genres=35|12` |
| Series | Comedia `35` o Acción y aventura `10759` | `with_genres=35|10759` |

Se eligió Comedia/Aventura por coherencia con el mensaje «Te proponemos cambiar de aire». Documental/Drama podía ofrecer distracción intelectual, pero su tono variable no justificaba conservarlo como selección de Asco. Es un criterio editorial de descubrimiento, no una intervención terapéutica ni garantía de bienestar. Coincide en géneros con Neutral; no existe una regla técnica que exija conjuntos exclusivos por emoción. Cuando la persona elige «Cambiarlo», el frontend ya consulta `happy`, independientemente de esta decisión sobre `disgusted`.

El servicio convierte Aventura `12` a `10759` para series, elimina IDs repetidos mediante `Set` y une los géneros con `|` (OR). La prueba parametrizada de `backend/tests/recommendations.test.js` comprueba las dos consultas para las siete emociones: solo cambian los valores esperados de `disgusted`. Los endpoints y el formato JSON se conservan.

Verificación de esta unidad: `npm test` desde `backend` aprobó 76 de 76 pruebas en 8 archivos; `git diff --check` terminó sin errores. La validación automatizada utiliza TMDB y Prisma simulados. No se han consultado títulos con una credencial real en esta revisión; la comprobación del catálogo real sigue siendo distinta de la aprobación editorial, que ya está confirmada.

Comentario propuesto para GitHub, todavía no publicado:

> Implementado el cambio de Asco (`disgusted`) aprobado por Rodrigo y confirmado por Michael: películas Comedia (35) O Aventura (12), y series Comedia (35) O Acción y aventura (10759). Se conserva OR (`|`) y la deduplicación con `Set`; las otras seis emociones, los endpoints y el JSON no cambian. `npm test`: 76/76 pruebas aprobadas en 8 archivos, con TMDB y Prisma simulados; `git diff --check` sin errores. La revisión del catálogo con credenciales reales se realiza por separado. Rodrigo actualizará el frontend.
