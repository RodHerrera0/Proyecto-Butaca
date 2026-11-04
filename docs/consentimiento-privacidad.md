# Consentimiento y privacidad

Issue #30. Textos preparados por Luis para incorporar en la interfaz de Rodrigo. Revisión del 2 de noviembre de 2026 sobre `origin/feature/frontend-rodrigo` (`b2a4778`). No se modificaron componentes. En `docs/luis` todavía no existe la pantalla de cámara.

## Texto para la pantalla de consentimiento

La pantalla `Consentimiento.jsx` admite un título, una introducción, cuatro puntos y dos botones. Los siguientes bloques respetan esa estructura y describen el prototipo revisado.

**Título:** Uso de la cámara

**Introducción:** Puedes usar la cámara para obtener una estimación de tu expresión facial y orientar las recomendaciones. Antes de decidir, conoce cómo funciona:

| Punto | Título | Texto para incorporar |
|---|---|---|
| 1 | Para qué | Al presionar «Analizar», el detector estima tu expresión facial. El resultado puede equivocarse y no determina cómo te sientes. Puedes elegir tu ánimo a mano. |
| 2 | Cuándo se usa | Si aceptas y el navegador permite el acceso, se activa una vista previa sin audio. El análisis comienza al presionar «Analizar». La cámara se apaga al terminar el intento de análisis, al elegir un ánimo manualmente o al salir de esta pantalla. |
| 3 | Qué ocurre con los datos | En este prototipo, el análisis se realiza en tu navegador. El código revisado no guarda ni envía fotografías o video. El resultado queda temporalmente en la aplicación; no se ha conectado su almacenamiento en una cuenta. |
| 4 | Tú decides | Usar la cámara es opcional. Si no aceptas o el navegador deniega el permiso, puedes continuar eligiendo tu ánimo a mano. Puedes cambiar el permiso de cámara desde la configuración del navegador. |

**Botón de aceptación:** Acepto

**Botón alternativo:** No acepto

Interpretación de las acciones: «Acepto» habilita el recorrido de cámara dentro de Butaca y conduce a `/detectar`; el permiso del navegador es una autorización adicional. «No acepto» lleva a la misma ruta con selección manual y sin activar la cámara. El consentimiento actual vive en memoria; no hay un registro persistente de aceptación.

## Aviso de privacidad para el prototipo revisado

Butaca es un proyecto académico del curso de Programación Web de la Universidad Rafael Landívar. Utiliza un ánimo elegido manualmente o una expresión facial estimada para orientar la exploración de películas y series.

Si eliges usar la cámara, el navegador solicita acceso al video, sin audio. La vista previa se activa al entrar en la pantalla de detección después de aceptar; el análisis se ejecuta cuando presionas «Analizar». Los modelos se cargan desde los archivos de la propia aplicación y procesan el cuadro de video en el navegador. El flujo revisado no incluye guardar fotografías, grabar video ni enviar esas imágenes a un servidor.

El resultado de cámara contiene una categoría, una puntuación del modelo y el origen «cámara». Una selección manual contiene la categoría, el origen «manual» y ninguna puntuación. Esa puntuación no representa una certeza sobre tus emociones. Puedes sustituir el resultado mediante el selector manual.

En el prototipo revisado, el consentimiento, el resultado y las favoritas permanecen en el estado de React. Las favoritas incluyen la fecha en que se agregaron. Estos datos no se vinculan a una cuenta ni se conservan al recargar la aplicación. La pantalla de inicio de sesión todavía no autentica usuarios y las recomendaciones utilizan datos simulados.

La aplicación necesita descargar sus archivos y modelos para funcionar. Procesar las imágenes localmente no significa que toda la navegación carezca de conexiones de red. No se verificaron registros del alojamiento ni la operación de servicios en un despliegue.

Puedes continuar sin cámara, elegir tu ánimo a mano y revocar el permiso desde el navegador. Al terminar el análisis, elegir manualmente o abandonar la pantalla, el componente revisado detiene las pistas de video. Este comportamiento fue revisado en código y debe comprobarse también en los navegadores de la demostración.

## Evidencia y condiciones para la integración

| Evidencia revisada | Lo que permite afirmar |
|---|---|
| `pantallas/Consentimiento.jsx` y `pantallas/Deteccion.jsx` | Aceptación y rechazo separados; la cámara exige `consentimiento === 'aceptado'`. |
| `components/DetectorEmocion.jsx` | Solicitud `getUserMedia` con `audio: false`; vista previa antes de analizar; detención de pistas en los caminos descritos; selector manual disponible. |
| `lib/detector.js` | Modelos en `/models`; análisis sobre el elemento de video; no contiene llamadas para subir imágenes. |
| `App.jsx` | Consentimiento, ánimo y favoritas en memoria; no almacenamiento persistente de estos estados. |
| `pantallas/Login.jsx` y `pantallas/Recomendaciones.jsx` | Acceso real pendiente y recomendaciones simuladas. |

La afirmación del texto provisional «solo un instante» necesita sustituirse: la vista previa puede permanecer activa mientras la persona decide cuándo analizar. Tampoco corresponde decir «solo nos quedamos con el resultado» como si ya existiera almacenamiento en una cuenta.

Antes de publicar una versión integrada, Rodrigo debe revisar también los mensajes de `Deteccion.jsx` y `DetectorEmocion.jsx` para mantener el mismo alcance, incluida la diferencia entre expresión estimada y emoción cierta. Esta entrega proporciona la redacción; su incorporación y prueba siguen pendientes.

El esquema de Guille (`0767817`) prevé usuario con identificador de autenticación y correo, entradas de ánimo con confianza y fecha, favoritas e historial de recomendaciones. Su existencia no demuestra que esos datos ya se guarden desde la interfaz. Cuando se conecten esos flujos, Guille debe confirmar los campos efectivamente persistidos y el equipo debe actualizar este aviso antes de usarlo con cuentas reales.

Quedan por definir con el equipo el responsable y canal de contacto, el plazo de conservación y el procedimiento de consulta o eliminación de datos para esa versión. Michael debe confirmar qué datos se enviarán a TMDB; no se presupone que el servicio reciba imágenes o el ánimo. No se promete un plazo de eliminación ni un mecanismo todavía inexistente.
