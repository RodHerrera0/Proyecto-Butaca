# Guion de presentación de Butaca

Issue #49. Propuesta de diez minutos para los cinco integrantes; confirmar duración con el ingeniero. El guion distingue lo que ejecuta `docs/luis` de los avances leídos en ramas de trabajo. No debe anunciarse una funcionalidad como terminada antes de integrarla y verificarla.

## Preparación

Julio confirma la rama y el commit que se van a presentar, instala dependencias, levanta los servicios y recorre los pasos con el equipo. Preparar una alternativa manual si falla la cámara y evitar mostrar archivos `.env`, tokens o datos personales. Rodrigo comprueba el navegador y sus permisos antes de la exposición.

Si se presenta la base actual `docs/luis`, la demostración se limita al título del frontend y a `/health`, después de comprobar su ejecución. Las pantallas de Rodrigo solo se presentan como prototipo en su entorno preparado por el equipo. No cambiar ramas ni mezclar trabajo para improvisar una demostración.

## Intervenciones

### 1. Luis Samayoa — propósito y alcance (1 minuto)

«Butaca es nuestro proyecto final de Programación Web. La propuesta es ayudar a explorar películas y series a partir de un ánimo elegido por la persona o de una expresión facial estimada con la cámara. La cámara es opcional: una expresión no nos permite saber con certeza cómo se siente alguien.

Mi responsabilidad fue documentar el funcionamiento comprobable, preparar el consentimiento y relacionar las expresiones con los géneros del catálogo. También organizamos una lista de aceptación para distinguir lo implementado de lo que todavía necesita integración o pruebas».

Mostrar el estado del proyecto en el README y dar paso a Rodrigo: «Rodrigo explica ahora el recorrido de la interfaz y las decisiones del uso de cámara».

### 2. J. Rodrigo Herrera — interfaz y recorrido (3 minutos)

«La interfaz está construida con React y Vite. En el prototipo revisado, el inicio de sesión todavía está pendiente y se puede continuar sin una cuenta. Antes de habilitar la cámara se explica su uso y se permite rechazarla.

Si aceptamos, el navegador también debe permitir el acceso. Aparece la vista previa; el detector analiza cuando presionamos “Analizar”. Los modelos se cargan desde la aplicación y el procesamiento del cuadro ocurre en el navegador. La categoría y la puntuación son una estimación. La persona puede elegir otro ánimo manualmente».

En el prototipo preparado, mostrar rechazo → selección manual → recomendaciones → agregar y quitar una favorita. Después, si el equipo lo verificó, volver al consentimiento y mostrar aceptación → permiso → análisis → cámara apagada. Comentar que la vista previa está activa antes de presionar «Analizar».

«Las recomendaciones de esta versión usan datos simulados y las favoritas están en memoria. Al recargar no se conservan. El tablero tiene el diseño preparado, pero las gráficas todavía no consumen historial real».

Si cámara o modelos fallan, explicar el mensaje y continuar por selección manual. No presentar un error simulado como una falla real del servicio TMDB.

### 3. Michael Gutiérrez — API y catálogo (2 minutos)

«Mi área es la API de recomendaciones y la conexión con TMDB. En la base documentada existe Express con una ruta de salud. La consulta real al catálogo no está integrada en esa rama, así que no corresponde presentar los títulos del prototipo como una respuesta de TMDB.

La propuesta documental relaciona las siete expresiones con géneros de películas y series por separado. Por ejemplo, Acción usa el ID 28 en películas y televisión agrupa Acción y aventura con el ID 10759. Debo validar la tabla y definir cómo combinar los filtros y responder si no hay resultados».

Mostrar una fila de la tabla, explicar que la relación es editorial y que no garantiza cambios de ánimo. Si al preparar la exposición ya existe una integración verificada, sustituir este bloque por una petición real y su respuesta, indicando endpoint y commit probados. No inventar rutas.

### 4. Guillermo Contreras — datos y sesión (2 minutos)

«Mi responsabilidad es la persistencia y la sesión. En mi rama se definieron modelos Prisma para usuarios, entradas de ánimo, favoritas y recomendaciones, con PostgreSQL en Supabase. También existe validación del token mediante las claves públicas de Supabase y una ruta `/api/me` que identifica o registra al usuario en la base.

Esto es un avance de esa rama y no demuestra que el frontend ya guarde datos. Además, debemos alinear las siete expresiones del frontend con las categorías del modelo, que actualmente son cuatro. Antes de conectar el historial necesitamos cerrar ese contrato».

Mostrar el esquema sin credenciales. Explicar la diferencia entre el cuadro de video procesado, el resultado de clasificación y un registro persistido. No prometer que ya existe eliminación de cuenta o historial si no se ha implementado y probado.

### 5. Julio Portillo — pruebas y entrega (2 minutos)

«Mi responsabilidad es QA y DevOps. Tenemos jobs de GitHub Actions que instalan y ejecutan las pruebas de frontend y backend. En la base revisada todavía no hay casos: el runner del backend terminó con cero pruebas y el intento del frontend no pudo arrancar Vitest porque faltaban dependencias. Esos resultados no certifican el recorrido funcional.

La lista de aceptación incluye permisos de cámara, alternativa manual, respuestas vacías o con error, sesión y persistencia. Playwright está previsto para las pruebas E2E, pero su infraestructura todavía no existe en esta rama. Para la entrega debemos registrar resultados sobre un commit concreto y confirmar que CI ejecuta casos reales».

Mostrar el checklist y sustituir las cifras solo con resultados obtenidos durante la preparación. Cerrar indicando el pendiente concreto que el equipo está resolviendo o, si se completó la integración, la evidencia que permitió aceptarla.

## Preguntas técnicas para ensayar

| Pregunta posible | Responsable | Respuesta basada en la revisión |
|---|---|---|
| ¿El detector sabe cómo se siente la persona? | Luis y Rodrigo | Clasifica expresiones; no determina el estado emocional. El usuario puede elegir manualmente. |
| ¿Qué significa el porcentaje mostrado? | Rodrigo | Es la puntuación de la expresión seleccionada por el modelo; no la certeza de un sentimiento. |
| ¿Cuándo se enciende la cámara? | Rodrigo | Tras aceptar y obtener permiso, al preparar la pantalla de detección. El análisis empieza con «Analizar». |
| ¿Se suben las fotos? | Rodrigo | El flujo de detector revisado procesa video localmente y no incluye subida de imágenes. Falta verificar la red del despliegue que se evalúe. |
| ¿Por qué esos géneros? | Michael y Luis | Son una propuesta editorial de exploración; Michael debe validarla. Los catálogos de películas y series tienen IDs distintos. |
| ¿Dónde está la clave de TMDB? | Michael | Debe permanecer en el backend. La base declara la variable, pero todavía no implementa la consulta. |
| ¿Qué se guarda al recargar? | Guille | En el prototipo de Rodrigo se pierden los estados en memoria. El esquema de Guille prevé persistencia, todavía sin flujo integrado probado. |
| ¿Cómo se valida la sesión? | Guille | La referencia revisada usa `jose`, JWKS de Supabase y audiencia `authenticated`; la conexión completa debe probarse. |
| ¿Qué pasa si la cámara no funciona? | Rodrigo y Julio | Mostrar el error correspondiente y permitir selección manual. Ejecutar los casos antes de afirmarlos como aprobados. |
| ¿CI verde implica que está terminado? | Julio | No: revisar cuántos casos se ejecutaron; CI actual no cubre build, lint ni E2E. |
| ¿Por qué hay siete expresiones y cuatro ánimos en datos? | Guille, Michael y Rodrigo | Es una diferencia de contrato pendiente; no hay una equivalencia automática documentada como definitiva. |

## Acuerdos antes del ensayo final

Confirmar versión integrada y duración; validar tabla de géneros; resolver contrato de ánimo; incorporar textos de privacidad; comprobar la persistencia realmente disponible; registrar resultados con Julio. Luis actualizará el README y las frases de este guion con esa evidencia antes de la presentación final.
