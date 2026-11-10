# Guion de presentación de Butaca

Issue #49. Versión del 9 de noviembre de 2026 para la demo con la aplicación conectada: https://proyecto-butaca-eta.vercel.app. Duración propuesta: 10 minutos más preguntas. Cada integrante adapta las frases a su forma de hablar; lo importante es que lo que se diga coincida con lo que se muestra.

## Antes de presentar

### El día anterior

- [ ] Cada integrante ensaya su parte con el cronómetro (#53).
- [ ] Rodrigo prueba la demo completa en la computadora y la red donde se presentará.
- [ ] Cada integrante tiene lista su respuesta de decisión difícil, alternativas y dudas (#54).

### 30 minutos antes

- [ ] Despertar la API: abrir https://proyecto-butaca-dev.onrender.com/health hasta ver `{"status":"ok"}`. En el plan gratuito de Render, la primera petición puede tardar cerca de un minuto.
- [ ] Abrir https://proyecto-butaca-eta.vercel.app y comprobar que carga sin aviso de certificado. Si la red de la sala lo bloquea, cambiar al hotspot del celular.
- [ ] Iniciar sesión con la cuenta de la demo y comprobar que Favoritas y Tablero tienen datos.
- [ ] Conectar la webcam si se va a usar y comprobar que aparece en el selector «Cámara».
- [ ] Buscar buena luz de frente; evitar ventanas detrás de la persona.
- [ ] Cerrar pestañas con `.env`, tokens o paneles de Supabase, Render o Vercel.
- [ ] Dejar abiertas en pestañas: la aplicación, el repositorio en GitHub (Actions en verde) y el README.

### Plan B

| Si falla | Hacer |
|---|---|
| La cámara no detecta el rostro | Mejorar la luz y repetir; si sigue fallando, elegir el ánimo a mano y continuar. |
| No hay cámara disponible | Usar `/detectar?simular=happy` o `/detectar?simular=grupo` y decir que es una simulación. |
| La API tarda o falla | Esperar a que despierte Render (`/health`); mientras, mostrar el código o la arquitectura. |
| El login no regresa a la aplicación | Continuar sin iniciar sesión (modo demostración) y explicar el login con capturas o el código. |
| No hay internet | Levantar la aplicación en local (`npm run dev` en `frontend/`): funciona completa en modo demostración. |

No mostrar `.env`, tokens ni conexiones privadas. Antes de encuadrar a varias personas en modo grupo, avisarles qué se va a analizar.

## 1. Luis — problema, arquitectura y aceptación (1 minuto)

«Butaca parte de una necesidad sencilla: reducir el tiempo que pasamos eligiendo qué ver. Propone películas y series según el ánimo, que la persona elige o que estimamos con la cámara. Esa clasificación puede equivocarse: estima una expresión, no sabe cómo se siente alguien.

La arquitectura tiene tres partes: React y Vite en el navegador, una API en Express desplegada en Render, y Supabase para el login y la base PostgreSQL con Prisma. El catálogo viene de TMDB a través de nuestra API. Mi parte fue documentar el proyecto, el consentimiento y convertir el brief en criterios verificables».

Mostrar el README (sección Funciones) y el checklist de aceptación: «Todos los criterios funcionales del brief están verificados en la aplicación publicada».

## 2. Rodrigo — interfaz y detección (3 minutos)

1. **Login.** Entrar con Google o GitHub. «La sesión la gestiona Supabase; el frontend nunca ve contraseñas».
2. **Consentimiento.** «Antes de pedir la cámara explicamos para qué se usa. Si alguien no acepta, elige su ánimo a mano y la cámara nunca se enciende». Aceptar.
3. **Detección individual.** Pulsar «Analizar». «El modelo corre dentro del navegador. La imagen no se guarda ni se envía: al servidor solo llega la emoción y la confianza. La cámara se apaga al terminar».
4. **Selector de cámara.** Si hay webcam externa: «Si hay una webcam conectada la usamos en lugar de la integrada, y se puede elegir».
5. **Modo grupo** (con las personas avisadas). «Detecta hasta seis rostros, muestra cada resultado y los combina con un voto ponderado por la confianza. Puede no coincidir con la mayoría numérica».
6. **Acompañar o cambiar.** Elegir «Cambiarlo». «La persona decide si quiere títulos acordes a su ánimo o que la lleven hacia otro; esto cambia la búsqueda, no promete un efecto emocional».
7. **Recomendaciones.** Mostrar el destacado y las filas. Agregar una favorita.

Si la cámara falla: elegir el ánimo a mano y seguir (ver Plan B).

## 3. Michael — API, géneros y TMDB (2 minutos)

«Cuando el frontend pide recomendaciones, la API recibe una de las siete emociones. Cada emoción tiene un conjunto de géneros, distinto para películas y series porque TMDB usa IDs distintos. Unimos los géneros con OR: al principio usábamos AND y había emociones que se quedaban casi sin títulos.

Pedimos contenido en español de México, ordenado por popularidad y con al menos 200 votos, y devolvemos películas y series normalizadas. La credencial de TMDB vive solo en el servidor; en el navegador no existe».

Mostrar `backend/src/services/tmdb.js` y la tabla de [emociones y géneros](emociones-generos.md). Mencionar que la tabla se aprobó en equipo (issue #10).

## 4. Guillermo — datos, Supabase y autenticación (2 minutos)

Mostrar Favoritas y Tablero en la aplicación.

«Cada petición a la API lleva el token de Supabase. El backend lo verifica con las claves públicas del proyecto y filtra todo por usuario: nadie puede ver ni borrar las favoritas de otro.

El modelo tiene usuarios, ánimos, favoritas y recomendaciones. Por eso las favoritas siguen ahí al volver a entrar, y el tablero muestra el ánimo en el tiempo, el conteo por emoción, los géneros y el reparto entre películas y series. Ojo: el tablero cuenta lo que recomendamos, no lo que la persona vio».

Mostrar `backend/prisma/schema.prisma` sin conexiones.

## 5. Julio — pruebas, CI y despliegue (2 minutos)

«Tenemos 78 pruebas en el backend con Vitest y Supertest, 84 en el frontend con Testing Library y 5 recorridos de extremo a extremo con Playwright. Las de backend sustituyen Supabase, la base y TMDB por dobles; el recorrido con servicios reales lo comprobamos en la aplicación publicada.

GitHub Actions corre Backend, Frontend y E2E en cada push y en cada PR. Las ramas main y develop están protegidas: no se puede unir nada sin que pasen las pruebas y sin revisión.

Para el punto final del brief elegimos la nube con HTTPS: el frontend en Vercel y la API en Render, con CORS limitado a nuestro dominio y cabeceras de seguridad con Helmet».

Mostrar la pestaña Actions en verde y la aplicación con el candado de HTTPS.

## Preguntas técnicas para ensayar

| Pregunta | Responde | Respuesta |
|---|---|---|
| ¿Saben cómo se siente el usuario? | Rodrigo y Luis | No. El modelo clasifica expresiones y su confianza no acredita un estado emocional; por eso existe la selección manual. |
| ¿Se guardan las fotos? | Rodrigo | No. El análisis ocurre en el navegador y al servidor solo llegan la emoción y la confianza. |
| ¿Cuándo se enciende la cámara? | Rodrigo | Solo después de aceptar el consentimiento y el permiso del navegador; se apaga al terminar el análisis. |
| ¿El resultado grupal es la mayoría? | Rodrigo | Es un voto ponderado por confianza, con desempate por número de personas; puede diferir de la mayoría. |
| ¿Por qué OR y no AND en los géneros? | Michael | Con AND algunas emociones devolvían muy pocos títulos; OR mantiene variedad y el orden por popularidad prioriza lo relevante. |
| ¿Dónde está la clave de TMDB? | Michael | Solo en las variables del servidor en Render; el navegador llama a nuestra API, nunca a TMDB con credenciales. |
| ¿Qué impide ver datos de otro usuario? | Guillermo | El middleware verifica el token y todas las consultas filtran por el usuario de la sesión; un registro ajeno responde 404. |
| ¿Qué pasa si alguien manda datos inválidos? | Guillermo y Michael | Zod valida cada entrada y la API responde 400 sin tocar la base. |
| ¿Las pruebas demuestran que Supabase y TMDB funcionan? | Julio | No por sí solas, porque usan dobles; por eso además verificamos el flujo real en la aplicación publicada. |
| ¿Qué pasa si se abusa de la API? | Julio | Hay límite de peticiones (30 recomendaciones y 300 en total cada 15 minutos por IP) y responde 429. |
| ¿Qué mejorarían? | Todos | Guardar el origen y la intención junto al ánimo, definir la conservación y eliminación de datos, y probar con más cuentas reales. |

## Decisiones que cada integrante debe poder explicar

El brief pide responder qué decisión fue más difícil, qué alternativas se descartaron y de qué se está menos seguro. Cada integrante prepara su respuesta con sus propias palabras; estos temas sirven de guía:

| Integrante | Decisión | Alternativas | Duda que conviene reconocer |
|---|---|---|---|
| Rodrigo | Detección en el navegador y combinación de resultados en grupo | Procesar en el servidor; promedio simple o mayoría | Precisión del modelo con poca luz y rostros distintos |
| Michael | Géneros por emoción unidos con OR | AND; búsqueda de respaldo si hay pocos resultados | Qué tan acertadas resultan las recomendaciones |
| Guillermo | Datos por usuario y verificación del token con JWKS | Secreto compartido; guardar el ánimo objetivo además del detectado | Conservación de datos y casos con muchas cuentas |
| Julio | Separar pruebas con dobles de la verificación real | Probar todo contra servicios reales; más casos E2E | Cobertura de cámara y servicios externos en CI |
| Luis | Documentar con evidencia y alcance del consentimiento | Describir el código frente a aceptar con pruebas | Acuerdos de conservación y eliminación aún sin definir |
