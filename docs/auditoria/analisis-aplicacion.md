# OntoMatch: revisión técnica y de experiencia de uso

Fecha: 2 de septiembre de 2026 (Argentina).

Actualización tras recibir el SQL: ver [resultado-base.md](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/docs/auditoria/resultado-base.md). Confirma índices y permisos, y descarta para esta base el conflicto hipotético entre posiciones negativas y el CHECK de fotos de las migraciones antiguas.

La aplicación tiene una base aprovechable. Mantendría React, Material UI, NestJS, PostgreSQL/PostGIS, Socket.IO y Cloudinary. La prioridad es corregir las garantías de privacidad, onboarding y chat, y después simplificar la experiencia conservando lo que ya funciona.

Interpreto el producto como una aplicación de citas entre coaches, con escuela y declaración personal como elementos distintivos. El aspecto visual puede ser sobrio sin cambiar esa finalidad.

## Alcance y evidencia

- Revisión estática del front y del back: rutas, autenticación, perfiles, preferencias, descubrimiento, swipes, matches, conversaciones, mensajes, medios, ubicaciones, bloqueos, reportes, administración y configuración.
- Compilación del front ejecutada correctamente: `tsc -b && vite build`.
- JavaScript principal: **1.293,76 kB minificado / 385,20 kB gzip**. Es tamaño de build; no representa el tiempo de carga ni incluye las fotos descargadas después.
- `npm run lint`: **122 errores y 5 advertencias**, incluyendo ruido de archivos generados en `dev-dist`. Hay errores funcionales además de problemas de estilo y tipado.
- Inspección visual local del login en escritorio y del registro a 390 × 844. No se crearon cuentas ni se enviaron formularios.
- Las pantallas privadas se evaluaron desde su código. Falta comprobarlas visualmente con una cuenta de prueba, incluyendo teclado móvil y conexión inestable.
- No se inició el back, no se ejecutaron consultas a la base, migraciones ni seeds. El back no tiene dependencias instaladas en este checkout; no se verificó su compilación ni sus pruebas.
- No se midieron tiempos reales de API, carga concurrente, planes SQL ni configuración desplegada. Las observaciones sobre producción requieren confirmar qué revisión está publicada.
- Solo se agregaron documentos de auditoría. No se implementaron cambios de funcionamiento.

## Qué conservaría

| Pieza | Evaluación |
| --- | --- |
| Front organizado por funcionalidades | `features/auth`, `onboarding`, `swiping`, `chat`, más `shared` y `pages`, es una estructura adecuada. |
| Back modular | La separación de controladores, servicios y entidades es útil. Falta centralizar reglas compartidas de acceso. |
| RTK Query | Ya resuelve consultas, caché y estados de carga. Conviene ajustar sus invalidaciones y contratos antes de cambiar de biblioteca. |
| PostgreSQL + PostGIS | Es una buena base para buscar por radio. `ST_DWithin` puede usar un índice espacial; hay que verificar el índice real. [PostGIS](https://postgis.net/documentation/tips/st-dwithin/). |
| Subida directa a Cloudinary | Evita pasar las fotos por NestJS. Es un flujo soportado por el proveedor; necesita reforzar la vinculación entre archivo y usuario. [Cloudinary](https://cloudinary.com/documentation/client_side_uploading). |
| Navegación principal | Tres destinos —Descubrir, Chats y Perfil— encajan con el objetivo de pocos pasos. |
| Experiencia de swipe | Ya muestra dos tarjetas, anticipa otra tanda y utiliza actualizaciones optimistas. La intención es buena; falta resolver errores y consistencia. |
| Apariencia base | Fondo cálido, tarjetas blancas y carbón son una buena dirección para una interfaz limpia. |

No veo motivos para migrar a otro framework, otro ORM, un servicio de chat externo o una base distinta como primer paso.

## Prioridad 0: privacidad y acceso

### 1. Las respuestas de perfiles incluyen datos privados de la entidad User

`ProfilesService.getById()` carga `user` y devuelve el perfil extendido conservando esa relación. El feed hace lo mismo. `User` contiene `email`, `passwordHash`, `resetCode` y `resetCodeExpiry`, sin exclusión de selección/serialización. No encontré un interceptor global que quite esos campos.

Consecuencia según el código actual: una cuenta autenticada puede recibir datos de autenticación de otros usuarios al consultar perfiles; además, la consulta individual no exige que el perfil esté completo o que no exista un bloqueo. No es una contraseña en texto plano, pero exponer su hash y los códigos de recuperación es grave.

Corregir con respuestas públicas explícitas: identificador, nombre, edad, escuela, declaración, intención, localidad aproximada y fotos autorizadas. Separar perfil propio de perfil público. No devolver fecha de nacimiento completa, coordenadas, datos de recuperación ni la relación `user` entera a otros usuarios.

Evidencia: [profiles.service.ts:50](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/profiles/profiles.service.ts:50), [discovery.service.ts:221](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/discovery/discovery.service.ts:221), [user.entity.ts:12](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/users/entities/user.entity.ts:12).

### 2. El onboarding obligatorio se puede evitar desde la API

El navegador impone pasos, pero `UpdateProfileDto` acepta `isOnboarded` y el servicio lo copia sin comprobar la integridad del perfil. Los endpoints de descubrimiento y swipes requieren JWT, sin una regla central de perfil completo. La edad mínima, escuela, declaración, preferencias y ubicación no se validan juntas en el servidor.

Además, registrar una cuenta solo crea `users`; un GET a `/profiles/me` crea después un perfil con `New User`, fecha 2000-01-01, género `other` y ubicación `Unknown`. Eso introduce datos ficticios y una escritura inesperada al leer.

Propuesta: crear cuenta y borrador de perfil en una transacción; guardar avances asociados al usuario; permitir al borrador únicamente las operaciones de completar perfil y gestionar su cuenta. Una operación final valida todos los requisitos y activa el perfil. El cliente no decide el estado final. Si la cuenta se puede crear antes de terminar, queda pendiente y fuera del descubrimiento y del chat social.

Actualmente el front guarda perfil completo y luego preferencias en dos peticiones: si falla la segunda, el perfil ya puede quedar activo. La finalización debe ser consistente y repetible sin efectos duplicados.

Evidencia: [update-profile.dto.ts](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/profiles/dto/update-profile.dto.ts), [profiles.service.ts:80](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/profiles/profiles.service.ts:80), [OnboardingStepper.tsx](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/features/onboarding/ui/OnboardingStepper.tsx), [RequireOnboarding.tsx](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/shared/ui/RequireOnboarding.tsx).

### 3. Bloquear a alguien no le impide seguir escribiendo

El feed excluye bloqueos en ambas direcciones, lo cual está bien. Pero `canAccess()` solo comprueba que la persona pertenezca al match. No comprueba bloqueos ni suspensión. La lista de conversaciones tampoco filtra bloqueos.

El socket verifica la firma del token al conectarse, sin consultar el estado actual del usuario. La suspensión que sí se comprueba en HTTP no tiene una protección equivalente en WebSocket. El evento `typing` ni siquiera verifica pertenencia a la conversación.

Propuesta: una regla compartida para leer, entrar, escribir y emitir estados; comprobar participantes, bloqueo, cuenta activa y perfil habilitado. Al bloquear o suspender, retirar accesos activos y actualizar las pantallas. No alcanza con esconder una conversación en el front.

Evidencia: [conversations.service.ts:234](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/conversations/conversations.service.ts:234), [chat.gateway.ts:40](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/messages/chat.gateway.ts:40), [chat.gateway.ts:114](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/messages/chat.gateway.ts:114).

### 4. Cierre de sesión incompleto

`logout` limpia credenciales, pero no la caché de RTK Query ni el socket. `getMe(undefined)` y otras consultas no distinguen usuarios en la clave. Al entrar con otra cuenta en el mismo navegador puede reutilizarse información anterior. `SocketService.connect()` reutiliza una conexión activa sin comprobar que corresponda al token nuevo.

El borrador de onboarding también usa una clave global de localStorage, sin identificador de usuario. Hay que limpiar cachés y conexiones al salir/cambiar de cuenta y separar borradores por usuario. Existe manejo de HTTP 401 en el store; debe integrarse con esa limpieza completa.

Evidencia: [authSlice.ts](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/features/auth/model/authSlice.ts), [socket.ts](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/shared/api/socket.ts), [store.ts](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/app/store.ts).

### 5. Recuperación de contraseña y administración

El código de recuperación expira a los 15 minutos y se genera con aleatoriedad criptográfica: ambas decisiones son buenas. Sin embargo, se guarda en claro, no hay límites de intentos visibles en la aplicación y el endpoint de cambio usa `any`, sin validar una contraseña nueva como en registro. Los JWT duran siete días y no hay revocación implementada al cambiar la contraseña.

Agregar límites por cuenta/IP, consumo atómico del código, almacenamiento protegido, validación y revocación de sesiones. Confirmar si existe limitación adicional en el proveedor antes de evaluar la exposición desplegada. [Guía de recuperación de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

El administrador se reconoce por coincidencia de email; no hay un flujo efectivo de verificación de email en este código. Conviene asignar un rol explícito a una cuenta controlada. La explotación del alta con el email del administrador depende de que esa cuenta todavía no exista; no afirmo que ocurra en el despliegue actual.

`GET /locations/seed` está disponible a cualquier usuario con JWT y escribe miles de ubicaciones. Debe salir del acceso ordinario y ser una operación administrativa deliberada.

## Prioridad 1: chat confiable y liviano

### Historial y peticiones

El endpoint real `/conversations/:id/messages` usa `findMessages()`: carga todos los mensajes y los ordena en memoria. Existe otro método con `limit=50`, pero ese endpoint no lo usa. Las listas de conversaciones y matches tampoco están paginadas.

Propuesta inicial: últimos 30–50 mensajes y cargar anteriores al subir; cursor por fecha + ID para que los empates sean estables. Listas de 20–30 conversaciones con nombre, avatar, último mensaje y no leídos. Los tamaños son puntos de partida, no cifras medidas como óptimas.

La lista hace joins de las fotos de ambos participantes. Con seis fotos cada uno puede producir 36 filas SQL por conversación antes de hidratar entidades. Solo necesita un avatar por interlocutor. Ya agrupa los últimos mensajes y no leídos en consultas conjuntas: conservar esa idea, aplicada a la página visible.

`ChatWindow` marca leído ante cualquier cambio de `messages`; la mutación invalida la etiqueta general `Conversation`, que incluye el historial y las listas. Esto produce recargas innecesarias y puede realimentarse cuando cambia `readAt`. No afirmo un bucle infinito: la caché puede estabilizar referencias. La redundancia del flujo sí está presente.

Propuesta: marcar hasta el último mensaje recibido y visible, sin invalidar el historial completo; actualizar localmente contadores y emitir un evento de lectura. Evitar considerar leído un mensaje por estar en una pestaña oculta.

### Reconexión y envío

`socket.on('reconnect')` está conectado al objeto equivocado para Socket.IO v4. Usar `connect` para volver a entrar a la sala y sincronizar mensajes faltantes, o escuchar reconexión en el Manager. [Documentación de Socket.IO](https://socket.io/docs/v4/client-socket-instance/).

El front añade un mensaje optimista, pero no utiliza confirmación del servidor, timeout ni estado de error. Empareja mensajes temporales por texto/remitente; dos mensajes iguales pueden confundirse. El reemplazo de todo el historial con `initialMessages` también puede retirar temporalmente mensajes pendientes.

Propuesta: `clientMessageId` único, confirmación de persistencia, estados enviando/enviado/error y reintento idempotente. Después de reconectar, recuperar desde el último mensaje confirmado. Socket.IO no sustituye esa garantía de aplicación. [Garantías de entrega](https://socket.io/docs/v4/delivery-guarantees/).

Añadir límites de longitud y frecuencia. La escritura y la actualización de `lastMessageAt` deberían ser consistentes. La autorización se consulta dos veces al enviar; puede simplificarse manteniendo una comprobación efectiva en el servicio.

Evidencia: [ChatWindow.tsx:46](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/features/chat/ui/ChatWindow.tsx:46), [chatApi.ts](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/features/chat/api/chatApi.ts), [conversations.service.ts:221](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/conversations/conversations.service.ts:221).

## Prioridad 1: imágenes

La entrega ya emplea `q_auto`, `f_auto` y tamaños distintos para fotos y avatares. Mantendría Cloudinary.

Problemas concretos:

- El back acepta cualquier `url` y `publicId` y después utiliza ese `publicId` para borrar en Cloudinary. La comprobación de que la fila pertenece al usuario no prueba que el recurso de Cloudinary sea suyo. Esto permite registrar referencias ajenas y solicitar su eliminación. Vincular la subida a un usuario e intención de carga, verificar la respuesta y validar el recurso antes de guardarlo. [Firmas de Cloudinary](https://cloudinary.com/documentation/signatures).
- El límite de 5 MB y el tipo de archivo solo se controlan en el navegador. Faltan restricciones confiables de formatos, tamaño, dimensiones y frecuencia en la subida configurada.
- Si Cloudinary acepta la foto pero falla el guardado en la base, queda un archivo huérfano. Hace falta reconciliación/limpieza y manejo explícito de `res.ok`.
- La posición nueva es `cantidad + 1`. Con posiciones 1, 2, 3, 4, al borrar la 2 queda una foto en posición 4; agregar otra intenta usar nuevamente la 4. Reordenar/asignar posiciones de forma consistente.
- El reordenamiento usa posiciones negativas temporales. La migración tiene `CHECK (position BETWEEN 1 AND 6)`, incompatible con ese algoritmo si sigue aplicado. **Pendiente de SQL real**.
- El front impide borrar cuando hay tres fotos o menos, incluso durante la construcción del perfil. No permite corregir una primera foto equivocada sin subir otras. Separar edición del requisito para publicar.
- `PhotosStep` llama hooks después de un retorno condicional por carga. Eso puede romper React cuando cambia `isLoading`. [Reglas de hooks](https://react.dev/reference/rules/rules-of-hooks).
- `ImageWithFallback` no reinicia el estado de error cuando cambia `src`: una foto fallida puede dejar ocultas las siguientes.

Evidencia: [PhotosStep.tsx:13](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/features/onboarding/ui/PhotosStep.tsx:13), [profiles.service.ts:112](C:/Users/lucas/OneDrive/Desktop/ontomatch.back.v5/src/modules/profiles/profiles.service.ts:112), [ImageWithFallback.tsx](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/src/shared/ui/ImageWithFallback.tsx).

## Ubicación y filtros

### Geografía

Se importan localidades de Georef y se consultan localmente, con espera de 300–500 ms al escribir y máximo diez sugerencias. Eso evita depender de una API externa en cada búsqueda. Georef es una fuente apropiada para normalizar ubicaciones de Argentina. [Servicio oficial](https://www.argentina.gob.ar/georef).

La distancia actual es entre centroides de localidades, no entre domicilios ni GPS. Personas de barrios lejanos dentro de la misma localidad pueden figurar a distancia cero. El texto libre de barrio no modifica las coordenadas. Para una primera versión usaría localidad y «distancia aproximada». Si se necesita precisión por barrio, añadiría después una ubicación aproximada elegida conscientemente, conservando localidad manual como alternativa.

No hace falta incorporar Google Maps para resolver lo básico. Si se amplía fuera de Argentina, habrá que ampliar el catálogo/proveedor.

Correcciones técnicas: quitar el UPDATE global de `geom` de cada GET de feed; calcularlo al guardar/migrar; validar `locationId` y no solo texto; evitar tratar latitud/longitud cero como ausencia; conservar una referencia estable de localidad; verificar cobertura del seed limitado a 5.000 sin paginación.

La búsqueda `ILIKE '%texto%'` puede beneficiarse de trigramas si el volumen/plan lo justifica. No añadir índices a ciegas: comprobar lo existente y el plan primero. [PostgreSQL pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html).

### Feed

- Trae diez perfiles por defecto, pero no implementa el cursor que declara; siempre devuelve `cursor: null`. El front descarta toda la metadata.
- El prefetch se hace antes de guardar el swipe actual, por lo que puede recibir tarjetas ya cargadas. Deduplica, pero desperdicia peticiones y no garantiza una siguiente tanda completa.
- Al acabarse los resultados se borran automáticamente todos los PASS del usuario. Es una escritura en un GET y puede volver a mostrar perfiles descartados sin avisar. Sugeriría una acción explícita «Volver a ver perfiles».
- Un error de red acaba mostrándose como «Estás al día». Distinguir error, filtros sin resultados y fin de lista.
- Si falla un swipe, la tarjeta desaparece igualmente y solo se registra un error de consola. Ofrecer recuperación/reintento.
- Falta un máximo confiable para `limit` y validación cruzada de edades/distancia.
- La intención `looking_for` no se usa para filtrar. Los géneros se filtran solo según quien busca; no se consideran las preferencias de la otra persona.

Propondría lotes pequeños con una estrategia explícita de continuación y exclusión de tarjetas ya entregadas, memoria acotada y respeto por los descartes. Los gustos, edad y distancia no necesitan un algoritmo complejo para empezar.

### Género e intenciones: una propuesta simple

Separar tres preguntas:

| Pregunta | Control propuesto |
| --- | --- |
| ¿Cómo te identificás? | Mujer / Hombre / Persona no binaria / Prefiero describirme. La descripción puede ser opcional. |
| ¿A quién querés conocer? | Selección múltiple de categorías y ununa opción para seleccionar varios géneros, sin mencionar explícitamente «Todos los géneros». |
| ¿Qué estás buscando? | Selección múltiple: Una relación / Conocer a alguien y ver qué pasa / Algo casual. |

Es una propuesta de interfaz, no una lista exhaustiva de identidades. No hace falta preguntar orientación sexual para implementar estos filtros. «Todos los géneros» debe seguir incluyendo nuevas categorías, no ser una lista copiada que envejece.

Hoy ya se pueden seleccionar varios géneros; lo que solo admite una opción es la intención. Para intenciones múltiples usar coincidencia con cualquiera de las seleccionadas. Definir «sin filtro» separadamente de «no completé este dato». Para citas, propondría compatibilidad de interés mutua en género; la reciprocidad de edades/distancia es una decisión de producto que conviene explicitar.

Eliminar el filtro por coincidencia exacta de textos personalizados separados por comas: depende de ortografía y sinónimos. También reemplazar ejemplos actuales como «Gato, Perro» y «Terian», que no ayudan a describir género y pueden resultar despectivos.

Mantener los filtros visibles en edad, distancia, personas que querés conocer e intención. Escuela y declaración pertenecen principalmente al perfil; no agregaría un panel profesional complejo.

## UX/UI: mejorar conservando la dirección

### Navegación y presentación

- Mantener **Descubrir / Chats / Perfil**, con burbuja de conversación para Chats en lugar del corazón.
- Agregar «Filtros» directamente en Descubrir. Abrir un panel compacto con las cuatro preferencias y «Aplicar».
- Mostrar escuela y un extracto de **Mi declaración** desde la primera tarjeta. Hoy la bio aparece recién al pasar a otra foto y el callback `onInfo` está sin implementar: no hay un acceso claro al detalle antes del match.
- Reutilizar la ficha de perfil desde la tarjeta y desde el chat. Perfil → Editar y Perfil → Preferencias deberían estar a un toque del destino principal.
- Mantener el identificador de conversación en la URL. Hoy se consume y borra; recargar pierde la conversación seleccionada y el botón Atrás no representa bien esa navegación.
- En escritorio, acotar la tarjeta para que una foto vertical no ocupe todo el ancho. En móvil, verificar alturas dinámicas y áreas seguras: el deck usa `100vh` además de la navegación y puede dejar controles tapados.
- En onboarding móvil, reemplazar seis etiquetas simultáneas por «Paso 2 de 6» más progreso. Conservar pasos cortos y guardar al avanzar en el servidor.

### Colores y legibilidad

Conservar fondo `#FAF9F7`, blanco y carbón. Reducir degradados fucsia/violeta, brillos, confetti y pulsos permanentes de chat/match. Un acento discreto y coherente es suficiente; no hace falta rehacer la identidad visual.

El texto secundario `#8E8E93` tiene contraste aproximado de **3,26:1 sobre blanco** y **3,10:1 sobre el fondo crema**. Para texto normal el criterio AA requiere 4,5:1. Oscurecer texto secundario y usar peso 400 en textos de lectura. Los cálculos corresponden a esos pares de colores, no a una auditoría completa de accesibilidad. [WCAG contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Agregar nombres accesibles a botones de solo icono, controles de foto operables con teclado, foco visible y respeto por movimiento reducido. Cambiar `lang="en"` a español. El login y registro vistos son claros y no necesitan otra distribución general; su legibilidad y consistencia de textos sí mejoran.

### Textos

| Actual | Propuesta |
| --- | --- |
| Password | Contraseña |
| ¿No tienes cuenta? Regístrate | ¿No tenés cuenta? Creá tu cuenta |
| Preferencias de Discovery | Mis preferencias |
| Matches como título de la lista | Chats |
| ¿Con qué género te distinguís? | ¿Cómo te identificás? |
| Bio / Descripción personal / Sobre mí | Mi declaración, con una ayuda breve que explique qué escribir |
| Se han elegido mutuamente desde el ser | Se gustaron. Ya pueden conversar. |
| Has visto a todos por ahora | No encontramos más perfiles con estos filtros. |

No hay un campo independiente de declaración: actualmente existe `bio`. Si declaración es ese texto personal, se puede reutilizar y nombrar consistentemente. Si querés conservar bio y una declaración distinta, recién entonces tendría sentido un campo nuevo.

### Cambios que dejaría a tu elección

- Mantener tres fotos obligatorias o permitir publicar con una y recomendar tres. Tres aporta información pero aumenta el abandono; no lo cambiaría sin acordarlo.
- Conservar una celebración de match breve o quitarla por completo.
- Conservar altura como dato opcional fuera del paso inicial.
- Mantener el chat de bienvenida o presentarlo como soporte accesible sin contar como match romántico.
- Elegir si las intenciones excluyen perfiles o solo destacan compatibilidad. Recomendaría explicitarlo en Filtros.

## Rendimiento y mantenimiento

La medida del build confirma un único bloque grande: **1,29 MB / 385 KB gzip**. Todas las páginas se importan al inicio; también `emoji-picker-react`. Separar rutas y cargar emojis al abrir el selector reducirá el código inicial. La PWA precachea el bundle completo, lo que puede mejorar visitas siguientes, pero no resuelve el peso del primer acceso.

En orden de impacto probable: paginar mensajes; evitar invalidaciones globales; reducir joins y respuestas; quitar escrituras del feed; dividir el JavaScript; optimizar fotos según tamaño mostrado. La velocidad real debe medirse después con API y datos de prueba. No usar el tiempo de compilación local como medida de rapidez del producto.

Otros puntos:

- `scryptSync` bloquea el hilo de Node mientras verifica/genera contraseñas. Mantener scrypt pero emplear su variante asíncrona y límites de frecuencia.
- `logging: true` en TypeORM puede generar mucho volumen y registrar parámetros sensibles. Configurar por entorno y redactar datos.
- SSL usa `rejectUnauthorized: false`; revisar la configuración de CA requerida por el proveedor, no copiar esa excepción por defecto.
- El Dockerfile usa Node 18; el lockfile de NestJS 11.1.12 declara Node >=20. Unificar un runtime soportado para desarrollo y despliegue. Render usa runtime Node directamente, por lo que el Dockerfile puede no ser la ruta desplegada.
- Hay dos ValidationPipe globales con opciones distintas; simplificar y tipar cuerpos que todavía son interfaces/`any`. Verificar especialmente conversión de booleanos de query.
- Se exige configuración de Google y refresh token, pero no hay un flujo completo implementado de esas funciones. Alinear validación de entorno con funciones usadas; el manifiesto de Render tampoco incluye todas las variables que exige el validador.
- Las migraciones iniciales tienen enums viejos, `orientation` obligatorio y tablas/columnas diferentes de las entidades actuales. No correrlas ni activar `synchronize` contra producción para «arreglar» esa diferencia.
- Los tests existentes son los de ejemplo «Hello World». Falta cobertura de privacidad, onboarding, bloqueo, reconexión y concurrencia.
- Abundan `any` y diferencias snake_case/camelCase. Ya hay fallas concretas: `genderCustom` se lee como `gender_custom` en pantallas y `lastMessage.senderId` se consulta como `senderUserId`. Contratos tipados compartidos/generados ayudarían a detectarlas.
- El frontend versiona `dev-dist` y el lint lo analiza. Excluir artefactos generados de ese control.

## Otros problemas que conviene revisar

| Hallazgo | Impacto y propuesta |
| --- | --- |
| Dos likes simultáneos | La transacción actual no serializa el par. Ambos pueden consultar antes de ver el swipe del otro y no crear match. Resolver por bloqueo/concurrencia y probar el escenario. |
| Suspensión al recibir dos reportes | Dos cuentas pueden suspender a una tercera. Revisar umbral/proceso de moderación. El contador se actualiza sin incremento atómico. |
| Reportar a alguien ya bloqueado | Guarda reporte/contador y después `blockUser` puede lanzar conflicto. Resultado parcial y mensaje de error pese a cambios aplicados. Hacer el bloqueo idempotente dentro del flujo. |
| Administración de conversaciones | `/admin/conversations` devuelve el último mensaje de todas las conversaciones, no solo soporte. Acordar el alcance necesario; no afirmar que toda la UI administrativa lee historiales completos. |
| Métricas | Matches de soporte y bienvenida se mezclan con métricas de citas; `last_login_at` no equivale a actividad diaria. Separar indicadores. |
| Fecha de nacimiento | Se transforma una fecha sin hora en Date UTC y se vuelve a leer localmente. En Argentina puede desplazarse un día; validar/calcular como fecha de calendario. |
| Edición de perfil | Actualizaciones/refetch de perfil y preferencias pueden rehidratar el formulario y pisar cambios sin guardar; también fallan algunos intentos de vaciar campos porque el servicio usa `if(dto.campo)`. |
| Guardado final | Se desactiva el botón por carga del perfil, pero no durante todo el guardado de preferencias. Evitar doble envío y conservar un estado de guardado único. |
| Estados vacíos | Preferencias ausentes pueden dejar el deck esperando indefinidamente. Un error de perfil tampoco debe convertirse automáticamente en «completá el onboarding». |

## Orden de trabajo propuesto

1. Cerrar exposición de datos, permisos de perfil/chat, propiedad de imágenes, sesión y recuperación.
2. Centralizar integridad del onboarding y revisar el esquema real con el SQL adjunto.
3. Corregir chat: historial por partes, confirmación/reintento, reconexión, lectura y bloqueo.
4. Corregir feed/fotos/concurrencia y dividir carga del front.
5. Aplicar mejoras de navegación, filtros, textos y color sobre las pantallas existentes.

Cada etapa debería demostrar un resultado observable: un borrador no puede hacer swipes, una respuesta pública no contiene secretos, una persona bloqueada no escribe, reconectar recupera mensajes una sola vez, cambiar de cuenta no muestra datos anteriores y una conversación larga no se descarga completa.

## Qué necesito de la base y del despliegue

Ejecutá [diagnostico-base.sql](C:/Users/lucas/OneDrive/Desktop/ontomatch.front.v5/docs/auditoria/diagnostico-base.sql) y devolveme las diez filas de resultados. Es una sola consulta de lectura de estructura/estadísticas y no extrae datos de personas.

Con eso se podrá confirmar: esquema y enums actuales; restricciones de fotos y edades; índices espaciales y de mensajes; triggers; RLS/ACL; funciones propias existentes y volúmenes estimados. Una RLS desactivada no prueba por sí sola una falla si solo el backend accede a la base: hay que conocer el rol y la superficie expuesta.

No pido aún cuerpos de funciones ni un EXPLAIN con perfiles reales. Tras ver el esquema, pasaré SQL específico y de lectura para integridad/planes si hace falta. No ejecutaré conexiones a la base por mi cuenta.

Para cerrar lo que no está en el repositorio también falta conocer el proveedor/región de la base, servicio/región/plan del back, si `DB_SYNCHRONIZE` está activo y la configuración de restricciones de subida de Cloudinary. Alcanzan nombres y configuración no secreta; no hacen falta claves, tokens ni el archivo `.env`.
