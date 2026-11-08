# Guion de presentación de Butaca

Issue #49. Versión del 4 de noviembre de 2026 sobre `docs/luis`, base `0cb87c9`. Propuesta de diez minutos, pendiente de confirmar con el ingeniero. Las intervenciones describen lo implementado y los límites de integración; cada integrante debe adaptar la redacción a su forma de hablar.

## Preparación del equipo

Julio registra el commit de la demostración, prepara las dependencias y comprueba el recorrido antes del ensayo. Rodrigo revisa navegador, modelos y permisos. Guillermo y Michael preparan los servicios únicamente en un entorno autorizado. Luis contrasta el guion y el checklist con esa versión.

El recorrido disponible en el frontend usa datos simulados. Puede mostrarse selección manual, intención, recomendaciones, favoritas temporales y el diseño del tablero, explicando su alcance. Las cuentas reales, la persistencia y el catálogo TMDB no deben atribuirse a esa pantalla hasta conectarlos.

No mostrar `.env`, tokens o conexiones privadas. Para una demostración grupal, explicar el uso a todas las personas antes de encuadrarlas. Si la cámara falla, continuar manualmente o utilizar la simulación identificándola como tal.

## 1. Luis Samayoa — problema, arquitectura y aceptación (1 minuto)

«Butaca parte de una necesidad sencilla: reducir el tiempo que pasamos eligiendo qué ver. El proyecto propone orientar películas y series con un ánimo elegido por la persona o una expresión estimada con la cámara. Esa clasificación puede equivocarse y no nos permite afirmar cómo se siente alguien.

La arquitectura combina React y Vite para la interfaz, Express para la API y Prisma con PostgreSQL en Supabase para los datos. El catálogo real se consulta desde el backend. Mi responsabilidad fue documentar esa separación, preparar el consentimiento y convertir el brief en criterios que podamos verificar».

Mostrar la tabla de estado del README: «Los módulos ya están reunidos en esta rama, pero aún falta conectar la interfaz con las rutas de datos. Rodrigo mostrará el recorrido que sí ofrece el frontend actual».

## 2. J. Rodrigo Herrera — interfaz y detección (3 minutos)

«La cámara es opcional. Desde el consentimiento puedo rechazarla y elegir el ánimo a mano. Después puedo pedir recomendaciones que lo acompañen o seleccionar “Cambiarlo”, que orienta el filtro hacia otra categoría. Esa opción cambia la búsqueda, no garantiza un efecto emocional».

Demostración principal:

1. Abrir el login y mostrar que Google/GitHub todavía están deshabilitados; continuar sin iniciar sesión.
2. En consentimiento, elegir «No acepto» y seleccionar manualmente «Triste».
3. Elegir «Cambiarlo», explicar la ruta hacia «Feliz» y abrir recomendaciones.
4. Agregar una favorita, abrir Favoritas y quitarla.
5. Abrir Tablero y explicar que las gráficas todavía son espacios reservados.

«En este recorrido los títulos vienen del catálogo simulado y las favoritas quedan en memoria. Recargar borra esos datos de la visita. El tema claro u oscuro sí se recuerda en este navegador».

Si la cámara fue comprobada antes del ensayo:

«Si acepto, el navegador pide su propio permiso y aparece una vista previa. El análisis comienza con “Analizar” y la cámara se detiene al terminar. Los modelos están incluidos en la aplicación y procesan el cuadro localmente».

Mostrar modo individual y, con participantes informados, modo grupal. Explicar que admite hasta seis rostros, calcula una categoría por persona y suma puntuaciones para obtener un resultado común. «Una categoría con mayor peso puede ganar sin representar a la mayoría; no estamos midiendo un sentimiento colectivo».

Alternativa de demostración: `/detectar?simular=grupo` representa dos personas felices y una triste sin usar cámara. Nombrarlo explícitamente como simulación; no presentarlo como prueba del detector real.

## 3. Michael Gutiérrez — API, géneros y TMDB (2 minutos)

«La ruta de recomendaciones recibe una de las siete claves de expresión. Para cada clave existe un conjunto de géneros. Consultamos películas y series por separado porque TMDB usa categorías distintas: Acción y Aventura son IDs separados en películas y se agrupan en televisión.

El backend pide contenido en español de México, ordenado por popularidad, con al menos 200 votos, y devuelve hasta cinco películas y cinco series. Los géneros se unen con comas, por lo que se exige su combinación. Esta decisión puede reducir mucho el catálogo y debemos validar los resultados».

Mostrar `GET /api/recommendations?mood=happy` en el código o su contrato, sin ejecutar una consulta externa no autorizada.

«La consulta está implementada, pero la pantalla todavía no la consume. También registra las recomendaciones para alimentar el tablero. Al repetirla pueden crecer los conteos, así que debemos revisar qué representa cada consulta en el historial».

Señalar la tabla actual de géneros: «La documentación ya refleja la lógica del backend. Quedan por validar el género repetido de series para “Enojado”, los conjuntos con pocos resultados y la relación con la opción “Cambiarlo” del frontend».

Si existe una integración comprobada al ensayar, sustituir la explicación de conexión pendiente por una petición real desde la interfaz y mostrar la evidencia correspondiente.

## 4. Guillermo Contreras — Prisma, Supabase y autenticación (2 minutos)

«El modelo tiene usuarios, entradas de ánimo, favoritas y recomendaciones. El enum de ánimo ya contempla las siete categorías del detector. Cada registro se asocia a un usuario, y una favorita se diferencia por usuario, ID de TMDB y tipo de contenido.

Las rutas verifican un token de Supabase con claves públicas y audiencia autenticada. El middleware también sincroniza correo, nombre y avatar cuando están disponibles. Eso protege la API; el login con Google o GitHub en el frontend sigue pendiente».

Mostrar el esquema y las rutas de ánimo, favoritas y tablero sin exponer conexiones.

«Guardar una categoría y su puntuación es distinto de guardar una fotografía. El backend dispone de persistencia de resultados, pero el frontend aún no la utiliza. No hay campos para identificar participantes de un grupo ni guardar la intención de recomendación: necesitamos cerrar ese contrato antes de conectarlo».

«El tablero agrega ánimos y recomendaciones registradas; no informa qué películas vio realmente la persona. Además, la migración más reciente elimina dos categorías antiguas. Debemos revisar los datos existentes antes de aplicarla».

## 5. Julio Portillo — pruebas, CI y despliegue (2 minutos)

«Ambos proyectos usan Vitest. En backend combinamos Vitest con Supertest para ejercitar las rutas; Prisma, autenticación y TMDB se simulan. En frontend hay pruebas de componentes, consentimiento, grupo y navegación, con cámara simulada.

En la revisión documental del 4 de noviembre se intentaron ejecutar ambas suites, pero faltaban las dependencias y no se encontró Vitest. Esos intentos no produjeron pruebas aprobadas. Antes de la entrega debemos ejecutarlas y registrar sus conteos sobre el commit que presentamos».

Mostrar el registro de pruebas y el checklist, reemplazando ese resultado solo si ya existen evidencias nuevas.

«CI instala y ejecuta los tests para cambios en main y develop. Falta revisar su cobertura para cada push de las ramas de trabajo, como pide el brief. Playwright todavía no está configurado: disponer de rutas de simulación no reemplaza probar el recorrido completo».

«También debemos confirmar qué alternativa del punto final del brief entregaremos: nube con HTTPS, integración de música o GIF, o Rekognition. No contamos con evidencia de despliegue en esta revisión».

Finalizar con el pendiente concreto que el equipo esté resolviendo o con la evidencia de aceptación obtenida en el ensayo. Evitar anunciar el proyecto como terminado si todavía no cumple el flujo con cuenta, catálogo, persistencia y tablero.

## Preguntas técnicas para ensayar

| Pregunta del ingeniero | Responsable | Respuesta fundamentada |
|---|---|---|
| ¿Saben cómo se siente el usuario? | Rodrigo y Luis | El modelo clasifica expresiones; su puntuación no acredita un estado emocional. La selección manual permite indicar otra preferencia. |
| ¿Cuándo se enciende la cámara? | Rodrigo | Después de aceptar y obtener permiso, al preparar la pantalla. La vista previa precede al análisis. |
| ¿Se guardan las fotos? ¿Se guardan resultados? | Rodrigo y Guillermo | El flujo revisado no sube ni guarda imágenes. La API sí permite persistir categorías y datos de cuenta; el frontend aún no envía esos resultados. |
| ¿El resultado grupal es una mayoría? | Rodrigo | Es un voto ponderado por puntuación, con desempates por número de personas y orden de claves; puede diferir de la mayoría numérica. |
| ¿Cambiar el ánimo usa la misma emoción al recomendar? | Rodrigo y Michael | El frontend transforma el objetivo; la API solo recibe una clave. Falta acordar el envío y distinguir el ánimo observado del objetivo en el historial. |
| ¿Por qué podrían aparecer pocos títulos? | Michael | Se exige la intersección de géneros y al menos 200 votos. No hay una consulta alternativa automática. |
| ¿Dónde está la clave TMDB? | Michael | En el entorno backend y enviada como Bearer; ninguna variable pública del frontend debe contenerla. |
| ¿Qué protege los datos por usuario? | Guillermo | Middleware JWT y filtros por usuario; deben comprobarse con dos cuentas, porque los tests actuales simulan la sesión. |
| ¿Las favoritas permanecen al recargar? | Rodrigo y Guillermo | Las de la interfaz actual no; las rutas backend ofrecen persistencia, todavía sin conexión con esa pantalla. |
| ¿El tablero mide películas vistas? | Guillermo | No: agrega las recomendaciones guardadas y los resultados de ánimo. |
| ¿Pasar los tests demuestra que TMDB o Supabase funcionan? | Julio | No cuando esos servicios se simulan. Se necesitan verificaciones autorizadas de integración y del recorrido E2E. |
| ¿Qué falta para entregar según el brief? | Luis y Julio | Conectar cuentas, catálogo, datos y tablero; verificar servicios, seguridad y cámara; ejecutar pruebas, configurar E2E y demostrar la alternativa final elegida. |

## Decisiones que cada integrante debe poder explicar

El brief pide responder qué decisión fue más difícil, qué alternativas se descartaron y de qué se está menos seguro. No corresponde inventar experiencias personales. Cada integrante debe preparar respuestas propias con evidencia; estos temas sirven como guía:

| Integrante | Decisión para explicar | Alternativas para contrastar | Incertidumbre que conviene reconocer |
|---|---|---|---|
| Rodrigo | Inferencia local y combinación de resultados grupales | Individual frente a grupo; cámara frente a selección manual | Comportamiento del modelo con iluminación y rostros distintos |
| Michael | Géneros, condición AND y filtros de catálogo | AND frente a OR; fallback ante pocos resultados | Calidad real de las recomendaciones |
| Guillermo | Relaciones por usuario y transición de enum | Persistencia del observado frente al objetivo; datos individuales frente a agregados | Migración de registros anteriores y contrato grupal |
| Julio | Separación de pruebas simuladas y reales | Componentes, HTTP y recorrido Playwright | Cobertura de servicios, permisos y despliegue |
| Luis | Documentar evidencia y alcance del consentimiento | Descripción de código frente a aceptación verificada | Acuerdos de conservación y eliminación aún sin definir |

Antes del ensayo final, Luis actualiza las frases de estado con los resultados aportados por sus responsables. Confirmar duración, fecha, alternativa del punto 6 y commit de demostración; no modificar cifras o declarar integraciones por suposición.
