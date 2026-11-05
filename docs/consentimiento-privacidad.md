# Consentimiento y privacidad

Issue #30. Revisión del 4 de noviembre de 2026, rama `docs/luis`, base `0cb87c9`. Los textos corresponden al código integrado. Se entregan para que Rodrigo los incorpore; no se modificaron componentes ni se considera terminada su integración en pantalla.

## Texto para la pantalla de consentimiento

`frontend/src/pantallas/Consentimiento.jsx` tiene título, introducción, cuatro puntos y dos botones. Los siguientes bloques respetan esa estructura e incluyen el modo grupal.

**Título:** Uso de la cámara

**Introducción:** Puedes usar la cámara para obtener una estimación de tu expresión facial y orientar las recomendaciones, o elegir tu ánimo a mano. Antes de decidir, conoce cómo funciona:

| Punto | Título | Texto para incorporar |
|---|---|---|
| 1 | Para qué | El detector estima expresiones faciales en modo individual o grupal. Puede equivocarse y no determina con certeza cómo se siente cada persona. En grupo se analizan hasta seis rostros y se obtiene un resultado combinado. |
| 2 | Cuándo se usa | Si aceptas y el navegador permite el acceso, se activa una vista previa sin audio. El análisis empieza al presionar «Analizar». La cámara se apaga al terminar el intento, al elegir un ánimo a mano o al salir de la pantalla. |
| 3 | Imágenes y resultados | El análisis se hace en tu navegador. El flujo actual no guarda ni envía fotografías o video. El resultado es un dato distinto: la interfaz lo conserva durante la visita y la API dispone de rutas para guardar ánimos y recomendaciones asociados a una cuenta, todavía sin conectar a esta pantalla. |
| 4 | Tú decides | Puedes continuar sin cámara y cambiar el permiso desde el navegador. Si usan el modo grupal, explica este uso y confirma que todas las personas estén de acuerdo antes de activarlo; quien no quiera participar debe quedar fuera del encuadre. |

**Botones:** «Acepto» y «No acepto».

«Acepto» registra la decisión en el estado de la aplicación y conduce a `/detectar`; no sustituye el permiso del navegador. «No acepto» conduce a la selección manual sin activar el video. La aceptación no se guarda como registro persistente ni identifica quiénes participan en un grupo.

El tercer punto describe la separación actual entre frontend y API. Debe actualizarse cuando se conecte la escritura de resultados, indicando cuándo se envían y a qué cuenta se asocian. No debe conservarse la frase «todavía sin conectar» después de implementar ese flujo.

## Aviso de privacidad

### Finalidad y elección

Butaca es un proyecto académico del curso de Programación Web de la Universidad Rafael Landívar. Utiliza un ánimo elegido por la persona o una expresión facial estimada para orientar la exploración de películas y series.

La cámara es opcional. Puedes rechazar su uso, denegar el permiso del navegador o elegir el ánimo a mano. La opción «Acompañarlo» o «Cambiarlo» modifica la orientación de las recomendaciones; no garantiza que cambie tu estado emocional.

### Cámara y análisis local

Después de aceptar en Butaca, la aplicación solicita acceso al video mediante el navegador, sin audio. Si el acceso está disponible, muestra una vista previa antes de analizar. Al presionar «Analizar», face-api procesa el cuadro de video en el propio navegador con modelos servidos desde `/models`.

El código revisado no contiene un flujo para guardar fotografías, grabar video o subir esas imágenes al backend. Sí descarga los archivos de la aplicación y los modelos; procesamiento local no significa ausencia de conexiones de red. No se verificaron registros del alojamiento ni tráfico de un despliegue real.

El componente detiene las pistas de video al terminar el análisis, incluso cuando no encuentra rostro o se produce un error de análisis, y también al elegir manualmente o abandonar la pantalla. Permite volver a usar la cámara con otro intento. La comprobación con hardware y navegador reales sigue pendiente.

### Modo individual y grupal

En modo individual se obtiene una categoría y una puntuación del modelo. En modo grupal se procesan hasta seis rostros, se muestran resultados por posición como «Persona 1», «Persona 2», etc., y se calcula una categoría combinada mediante votos ponderados por puntuación.

Esos números de posición no identifican a una persona ni permiten reconocerla en futuras visitas. El resultado del grupo no representa necesariamente a todos y puede diferir de la mayoría numérica. Cada participante debe conocer y aceptar el uso antes de entrar en el encuadre.

Actualmente hay una sola decisión de consentimiento para la visita, no un mecanismo individual de aceptación por participante. La aplicación tampoco verifica que quien activa el modo grupal haya consultado al resto. Esa limitación debe considerarse durante la demostración y antes de utilizarlo con otras personas.

### Datos temporales y almacenamiento disponible

| Dato | Tratamiento observado |
|---|---|
| Cuadro de video | Entrada temporal del detector local; sin ruta de subida o guardado de imágenes en el flujo revisado. |
| Resultado individual | Categoría, confianza y origen en el estado de React. |
| Resultado grupal | Categoría agregada, confianza, conteo y resultados por participante en memoria. |
| Selección manual | Categoría y confianza nula, con origen manual en la interfaz. |
| Intención y consentimiento | Estado de la visita; sin registro persistente en los modelos actuales. |
| Favoritas de la interfaz | Lista en memoria con fecha de incorporación; no llama a la API. |
| Tema claro/oscuro | Preferencia local en `localStorage`, clave `butaca-tema`. |

El consentimiento, el ánimo y las favoritas del frontend se pierden al recargar. Esto no significa que el backend carezca de persistencia. Sus rutas protegidas permiten guardar resultados y consultar datos asociados al usuario:

- El middleware de autenticación crea o actualiza el perfil: identificador de Supabase Auth, correo, nombre y URL de avatar cuando existen en el token.
- `POST /api/moods` guarda categoría, confianza opcionalmente nula, usuario y fecha.
- Las rutas de favoritas permiten guardar, listar y quitar títulos de la cuenta.
- Consultar recomendaciones mediante la API registra los títulos y géneros obtenidos, y puede vincularlos con una entrada de ánimo.
- El tablero consulta esos registros y produce historial y conteos.

La interfaz actual aún no inicia sesión ni llama a estas rutas. Los campos de origen, intención y participantes grupales no forman parte de su contrato de almacenamiento. El backend no recibe imágenes en esas operaciones.

### Servicios y controles

El backend valida tokens de Supabase mediante claves públicas y la audiencia `authenticated`; las rutas filtran datos por el usuario autenticado. Esta implementación debe probarse con sesiones reales y usuarios distintos antes de afirmar aislamiento completo en producción.

Para recomendar, la API envía a TMDB filtros de géneros, idioma, popularidad y cantidad mínima de votos. En la llamada revisada no envía fotografías, identificador de usuario ni la etiqueta de ánimo; esta última se traduce a géneros dentro del servidor. La credencial de TMDB permanece en el backend. No se han comprobado las condiciones operativas de una consulta real ni las políticas propias de los proveedores.

Puedes revocar el permiso de cámara desde la configuración del navegador y utilizar selección manual. Quitar una favorita mediante la API es una operación disponible; no equivale a borrar toda la cuenta o el historial. No hay una ruta de eliminación de cuenta o de historial de ánimo en el código revisado.

## Evidencia, incorporación y pendientes

| Archivo revisado | Evidencia |
|---|---|
| `pantallas/Consentimiento.jsx` y `pantallas/Deteccion.jsx` | Decisión previa a cámara; modo manual sin aceptación; simulación explícita sin cámara. |
| `components/DetectorEmocion.jsx` | Video sin audio, modos individual/grupo, elección manual y detención de pistas. |
| `lib/detector.js` y `lib/grupo.js` | Inferencia local, máximo seis rostros y combinación de resultados. |
| `App.jsx` y `lib/tema.js` | Estado de visita frente a preferencia de tema persistida localmente. |
| `backend/src/middleware/auth.js`, rutas y esquema Prisma | Perfil y registros por usuario; persistencia disponible en la API. |

Rodrigo debe sustituir el texto provisional de consentimiento y revisar los mensajes de detección que aún dicen «solo un instante» o presentan el resultado como una emoción cierta. La vista previa puede permanecer activa mientras la persona decide analizar. La documentación entrega la redacción sin modificar esos componentes.

Antes de conectar datos reales, Guillermo y Rodrigo deben confirmar qué se guardará de resultados individuales o grupales, en qué momento y con qué cuenta. El equipo debe definir responsable y canal de contacto, conservación y procedimiento de consulta o eliminación. No se ha acordado un plazo ni existe un mecanismo general de borrado que pueda prometerse en el aviso.

Julio debe verificar permisos, detención de cámara, tráfico de red y separación entre usuarios sobre el commit de entrega. No se declara un cumplimiento legal específico ni una política de proveedores que no haya sido revisada.
