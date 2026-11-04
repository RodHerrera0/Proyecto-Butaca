# Checklist de aceptación

Issue #40. Corte documental: 2 de noviembre de 2026. Base: `docs/luis` (`f06a7ba`) y referencias indicadas en el README. Esta lista reúne los requisitos conocidos del encargo y del código; **no reemplaza una rúbrica oficial**, que debe confirmar el equipo con el ingeniero.

## Cómo registrar la aceptación

**Completo** significa que el entregable documental o la evidencia está disponible y fue revisado. **Pendiente** indica implementación, integración o acuerdo faltante. **No verificado** indica que falta ejecutar una comprobación. Una casilla marcada no certifica funcionalidades en ramas ajenas ni pruebas que no se hayan ejecutado.

Para aceptar un recorrido funcional, Julio debe registrar commit y rama, fecha, entorno, navegador si aplica, pasos, resultado esperado, resultado obtenido y evidencia sin credenciales ni imágenes personales innecesarias.

## Documentación y coordinación

- [x] **Completo:** README con objetivos, arquitectura, estructura, comandos y límites actuales (#21 y #50).
- [x] **Completo:** tabla con siete expresiones, géneros e IDs separados para películas y series (#9).
- [ ] **Pendiente:** Michael valida la propuesta de géneros antes de usarla como configuración.
- [x] **Completo:** textos de consentimiento compatibles con la estructura revisada y aviso del prototipo (#30).
- [ ] **Pendiente:** Rodrigo incorpora los textos y verifica su correspondencia con la versión integrada.
- [x] **Completo:** inventario de variables, scripts y situación de pruebas (#39).
- [x] **Completo:** guion con intervención de los cinco integrantes y preguntas técnicas (#49).
- [ ] **Pendiente:** confirmar rúbrica, duración de exposición y requisitos académicos adicionales.
- [ ] **Pendiente:** acordar siete expresiones frente a cuatro valores del enum `Mood` antes de persistir datos.

## Funcionalidad

| Requisito y criterio de aceptación | Estado en `docs/luis` | Evidencia o trabajo necesario |
|---|---|---|
| API responde a `/health` con `status: ok` | No verificado en ejecución | Ruta presente en `backend/src/app.js`; falta comprobación HTTP. |
| Frontend inicia y muestra la interfaz prevista | No verificado en ejecución | Solo título en `App.jsx`; instalar y arrancar para comprobar. |
| Sesión válida identifica al usuario; acceso sin token se rechaza | Pendiente | Guille tiene validación JWT y `/api/me` en su referencia; falta integrar, conectar login y probar. |
| Cámara requiere consentimiento y permiso del navegador | Pendiente | Flujo presente en la referencia de Rodrigo, sin integrar aquí. |
| Rechazar cámara permite selección manual sin solicitar video | Pendiente | Implementación revisada en Rodrigo; falta prueba de navegador en versión integrada. |
| Detectar contempla las siete expresiones y permite corregir manualmente | Pendiente | Detector y selector en referencia de Rodrigo; sin prueba real durante esta revisión. |
| Permiso denegado, cámara ausente y ausencia de rostro permiten continuar | Pendiente | Mensajes y manejo en Rodrigo; ejecutar cada condición. |
| Video se detiene al analizar, elegir manualmente o salir | Pendiente | Detención de pistas revisada en Rodrigo; confirmar indicador y pistas en navegador. |
| Recomendaciones reales distinguen películas y series y usan filtros válidos | Pendiente | Catálogo de Rodrigo simulado; falta integración TMDB y validación de Michael. |
| Carga, error y lista vacía tienen respuesta comprensible | Pendiente | Estados simulados en referencia de Rodrigo; falta integración y aceptación. |
| Favoritas e historial persisten y se aíslan por usuario | Pendiente | Favoritas de Rodrigo en memoria; modelos en Guille no prueban flujo persistente. |
| Tablero representa datos reales de historial | Pendiente | Referencia de Rodrigo contiene espacios reservados para gráficas. |
| Interfaz usable en móvil, escritorio y con teclado | No verificado | No se capturaron pantallas ni se ejecutó recorrido de accesibilidad. |

## Privacidad y configuración

- [ ] **No verificado:** inspección de red durante el análisis confirma que no se suben imágenes en el despliegue evaluado. La revisión de código del detector no sustituye esa comprobación.
- [ ] **Pendiente:** confirmar los datos que finalmente se guardarán, conservación, eliminación y canal de contacto antes de publicar el aviso para cuentas reales.
- [ ] **No verificado:** las variables públicas del frontend excluyen credenciales privadas en la compilación final.
- [ ] **No verificado:** la configuración local permite conectar los servicios integrados sin usar una base compartida para pruebas destructivas.

## Calidad y entrega

- [x] **Completo:** ejecución del runner backend registrada: salida 0 con cero casos; no hay aceptación funcional acreditada.
- [ ] **No verificado:** pruebas frontend ejecutadas con dependencias instaladas. El intento actual falló porque no se encontró Vitest.
- [ ] **Pendiente:** incorporar casos backend y frontend de los recorridos acordados en la rama integrada.
- [ ] **No verificado:** lint y compilación frontend completados.
- [ ] **Pendiente:** configurar e implementar E2E con Playwright.
- [ ] **No verificado:** ejecución E2E y recorrido con cámara real en el entorno de presentación.
- [ ] **No verificado:** CI remoto de la entrega aprobado con casos descubiertos y resultados revisados.
- [ ] **No verificado:** protección de ramas y revisión aprobada conforme al acuerdo del equipo.
- [ ] **Pendiente:** actualizar README y aviso tras la integración, y ensayar el guion contra la versión que se presentará.

El alcance de esta entrega es documental. La evidencia de ejecución disponible se conserva en [configuración y pruebas](configuracion-pruebas.md); ninguna funcionalidad pendiente queda aceptada por disponer de un documento que la describa.
