# Pantallas de Butaca

Lista de pantallas del frontend y los datos que cada una necesita del backend. Sirve para acordar los contratos entre frontend y backend antes de implementarlos.

| Pantalla | Ruta | Qué muestra | Datos que necesita del backend |
|---|---|---|---|
| Login | `/login` | Botones "Entrar con Google" y "Entrar con GitHub". | Ninguno (el login lo resuelve Supabase). |
| Consentimiento | `/consentimiento` | Para qué se usa la cámara, que la imagen no se guarda ni se envía, y los botones "Acepto" / "No acepto". | Ninguno. |
| Detección | `/detectar` | Video de la cámara, botón "Analizar", emoción detectada con su porcentaje y opción de elegir el ánimo a mano. | **Envía:** emoción (`neutral`, `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`) y confianza (0 a 1; `null` si se eligió a mano). **Nunca** envía la imagen. |
| Recomendaciones | `/recomendaciones` | Tarjetas con póster, título, año, tipo (película/serie), sinopsis, calificación y botón de favorito. | **Recibe:** id de TMDB, título, tipo, póster, sinopsis, año, calificación y géneros. |
| Favoritas | `/favoritas` | Las películas y series guardadas, con botón para quitarlas. | **Recibe:** lo mismo que Recomendaciones + fecha en que se guardó. **Envía:** agregar / quitar favorita (id de TMDB y tipo). |
| Tablero | `/tablero` | Ánimo en el tiempo, conteo por emoción, géneros más recomendados y películas vs. series. | **Recibe:** historial de ánimos (emoción + fecha), conteo por emoción, conteo por género y conteo por tipo. |
| Encabezado | Todas | Nombre y foto del usuario, botón de cerrar sesión. | **Recibe:** nombre y foto del usuario (de la sesión de Supabase). |

## Notas

- Las emociones viajan con la clave en inglés que devuelve face-api; el frontend las traduce al español solo para mostrarlas.
- La detección ocurre por completo en el navegador. Al backend solo llega el resultado (emoción y confianza).
