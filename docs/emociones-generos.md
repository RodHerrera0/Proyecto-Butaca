# Relación entre emociones y géneros

Issue #9. Propuesta documental del 2 de noviembre de 2026, **pendiente de validación de Michael Gutiérrez** antes de convertirla en configuración de la API.

## Alcance y criterio

face-api.js devuelve puntuaciones para siete expresiones. La categoría con mayor puntuación describe la clasificación del modelo, no una certeza sobre lo que siente la persona. La iluminación, la postura y las diferencias individuales pueden alterar el resultado. La selección manual debe permitir que la persona indique su propia preferencia.

La siguiente relación es una decisión editorial para explorar el catálogo. Propone comedia y opciones familiares ante expresiones asociadas con malestar, y relatos de aventura o intriga cuando se busca variedad. No está validada como intervención emocional ni garantiza que una película mejore el ánimo. Las alternativas de cada fila no exigen que un título pertenezca a todos los géneros simultáneamente.

## Propuesta por expresión

Los nombres en español son etiquetas de lectura; la integración debe obtener los nombres localizados de TMDB.

| Clave face-api.js | Etiqueta | Películas: género e ID | Series: género e ID | Motivo de la propuesta |
|---|---|---|---|---|
| `neutral` | Neutral | Drama `18`, Documental `99`, Aventura `12` | Drama `18`, Documental `99`, Acción y aventura `10759` | Ofrecer variedad cuando la expresión no orienta una preferencia clara. |
| `happy` | Feliz | Comedia `35`, Animación `16`, Aventura `12` | Comedia `35`, Animación `16`, Acción y aventura `10759` | Proponer entretenimiento de tono ligero o dinámico. |
| `sad` | Triste | Comedia `35`, Familia `10751` | Comedia `35`, Familia `10751` | Ofrecer un cambio de tono sin asumir que la persona desea historias tristes. |
| `angry` | Enojado | Acción `28`, Aventura `12`, Comedia `35` | Acción y aventura `10759`, Comedia `35` | Dar alternativas de ritmo activo y humor, sin prometer que reduzcan el enojo. |
| `fearful` | Miedo | Comedia `35`, Animación `16`, Familia `10751` | Comedia `35`, Animación `16`, Familia `10751` | Priorizar opciones potencialmente ligeras; no asociar miedo con terror por defecto. |
| `disgusted` | Asco | Comedia `35`, Aventura `12`, Fantasía `14` | Comedia `35`, Acción y aventura `10759`, Ciencia ficción y fantasía `10765` | Proponer un cambio de tema y exploración de otros escenarios. |
| `surprised` | Sorpresa | Misterio `9648`, Ciencia ficción `878`, Fantasía `14` | Misterio `9648`, Ciencia ficción y fantasía `10765` | Explorar relatos con descubrimientos o situaciones inesperadas. |

## Diferencias entre películas y series

TMDB mantiene catálogos distintos en `GET /3/genre/movie/list` y `GET /3/genre/tv/list`. No debe copiarse el conjunto de IDs de películas para consultar series: Acción `28` y Aventura `12` se agrupan como Acción y aventura `10759` en televisión; Ciencia ficción `878` y Fantasía `14` se agrupan como Ciencia ficción y fantasía `10765`. No son equivalencias exactas de contenido, sino categorías distintas del catálogo.

Comedia `35`, Animación `16`, Drama `18`, Documental `99`, Familia `10751` y Misterio `9648` existen en ambos catálogos. El género de películas «Película de TV» `10770` no identifica una serie. Debe conservarse el tipo de contenido junto al ID del título y seleccionar el catálogo correspondiente.

## Decisiones pendientes de integración

- Michael debe confirmar los géneros, la combinación de filtros, el orden de resultados y el comportamiento cuando no haya títulos disponibles; contrastar los IDs con respuestas autenticadas de TMDB antes de integrar.
- Rodrigo y Guille deben acordar un contrato: el frontend revisado usa las siete claves de esta tabla, mientras el enum `Mood` de Guille contiene `HAPPY`, `SAD`, `TIRED` y `ADRENALINE`. `neutral` no equivale a cansancio y `angry` no equivale automáticamente a adrenalina.
- No convertir ausencia de rostro en `neutral`. El detector revisado devuelve `null` si no encuentra rostro y permite reintentar o seleccionar manualmente.
- No fijar un umbral de confianza emocional sin validación. El umbral `0.5` observado en `TinyFaceDetectorOptions` corresponde a detección de rostro, no a aceptación de la expresión.
- El catálogo simulado de Rodrigo no demuestra que esta tabla esté implementada en TMDB.

## Fuentes consultadas

Consulta del 2 de noviembre de 2026. Se revisaron las siete etiquetas en el [código fuente de face-api.js](https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/src/faceExpressionNet/FaceExpressions.ts). Los catálogos separados se documentan en [géneros de películas](https://developer.themoviedb.org/reference/genre-movie-list) y [géneros de series](https://developer.themoviedb.org/reference/genre-tv-list); los IDs figuran en los ejemplos de la [especificación OpenAPI oficial de TMDB](https://developer.themoviedb.org/openapi/tmdb-api.json). No se consultó la API con credenciales del equipo.
