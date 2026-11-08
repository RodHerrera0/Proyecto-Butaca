# Configuración segura de TMDB

En `backend/.env` configura `TMDB_API_KEY` con el **API Read Access Token** de tu cuenta TMDB. El backend lo lee exclusivamente desde `process.env.TMDB_API_KEY` y lo envía como `Authorization: Bearer`. No uses aquí la API key v3.

Pasos manuales: inicia sesión en TMDB, abre Configuración → API, solicita acceso si todavía no lo tienes y copia el API Read Access Token únicamente a tu archivo local. No lo pegues en chats, issues, capturas ni commits. Reinicia el backend después de configurarlo.

`.gitignore` excluye `backend/.env`; únicamente se versiona `.env.example`, sin credenciales. Si falta el token o está vacío, una recomendación válida responde HTTP 503 con `{"error":"Servicio de recomendaciones no configurado"}` sin llamar a TMDB. La autenticación de Supabase sigue siendo obligatoria.

Las pruebas usan `fetch` y Prisma simulados y una credencial ficticia. No verifican acceso a una cuenta TMDB ni conectividad con el catálogo real. Esa comprobación manual queda pendiente hasta configurar el token local.
