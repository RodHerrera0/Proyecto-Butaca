# Expresiones faciales y géneros de TMDB

Issue #9. Revisión del 4 de noviembre de 2026 sobre `docs/luis`, base `0cb87c9`. La tabla principal describe `backend/src/routes/recommendations.js`; no sustituye su lógica por la propuesta documental anterior. Michael Gutiérrez debe validar las decisiones definitivas.

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
| `disgusted` | Asco | Documental `99` + Drama `18` | Documental `99` + Drama `18` | Explorar contenido documental con componente dramático; combinación por revisar con Michael. |
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

Esa transformación es una preferencia de recomendación, no evidencia de que el ánimo cambie. La API solo recibe `mood`; no tiene un parámetro de intención ni decide entre expresión observada y objetivo. Michael y Rodrigo deben acordar qué valor se enviará para recomendar y cómo conservar el dato original del historial.

En grupo se analizan hasta seis rostros y se suman las puntuaciones de cada expresión dominante. Gana el mayor peso; los empates se resuelven por número de personas y luego por el orden de las siete claves. La confianza agregada es el promedio de quienes aportan a la categoría ganadora. Puede ganar una categoría que no sea mayoría numérica y no representa el sentir de todas las personas. El backend no tiene un contrato para participantes, conteo u origen grupal.

## Diferencias con la propuesta inicial y alternativas

La propuesta anterior incluía más alternativas por fila y no describía el filtro AND actual. Por ejemplo, para `disgusted` proponía comedia, aventura y fantasía; el backend utiliza documental y drama. Para `neutral` sugería drama y documental además de aventura, mientras la API combina aventura y comedia.

Esas opciones quedan como recomendaciones para discutir, no como configuración implementada. Se implementaron OR, deduplicación de series y respuesta vacía `200 []`, conforme a #10 y #43. Las siete asignaciones originales se conservan; cambiar Asco u otra asociación requiere aprobación del equipo y validación del catálogo real.

También queda pendiente decidir cómo integrar la intención del frontend y el resultado grupal, y verificar la calidad del catálogo obtenido. El umbral `0.5` de `TinyFaceDetectorOptions` controla la detección del rostro, no una confianza mínima para aceptar una emoción.
