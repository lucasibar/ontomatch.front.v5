# Cambios implementados — 3 de septiembre de 2026

Esta entrega aplica la primera tanda de correcciones del análisis. Los cambios están en los dos repositorios locales. No se ejecutó SQL, no se abrió una conexión a Supabase, no se arrancó el backend real y no se desplegó nada.

## Qué cambia

### Registro, perfil y privacidad
- El registro crea usuario, borrador de perfil y preferencias en una transacción. La fecha de nacimiento y el género quedan pendientes, sin valores inventados.
- Guardar un paso del onboarding guarda un borrador; no publica el perfil.
- La finalización usa POST /profiles/complete: perfil y preferencias se guardan juntos, y el servidor comprueba edad de 18 a 100 años, identidad, escuela, declaración de al menos 20 caracteres, intención, localidad seleccionada, preferencias y al menos 3 fotos.
- El cliente no puede enviar isOnboarded ni coordenadas para saltar la validación.
- Descubrir, matches y conversaciones exigen un perfil completo también en el backend.
- Los perfiles públicos tienen una proyección explícita: edad, nombre, identidad, declaración, escuela, intención, localidad y fotos activas. No incluyen correo, credenciales, fecha de nacimiento, coordenadas ni identificadores internos de Cloudinary.
- Cambiar de cuenta o cerrar sesión limpia las cachés de consultas y desconecta el socket. Los borradores locales se separan por usuario.
- La recuperación de contraseña almacena un hash del código; lo consume de forma atómica y aumenta la versión de sesión. Los tokens anteriores dejan de servir. Las nuevas contraseñas requieren entre 8 y 128 caracteres.
- El cálculo de contraseñas pasa de scrypt síncrono a asíncrono. Se conserva el formato de los hashes existentes.
- Hay límites de intentos en autenticación, autorizaciones de fotos y eventos del chat. Son locales a una instancia; no sustituyen un limitador compartido al escalar.

### Fotos
- Cada autorización de subida tiene un identificador nuevo dentro de la carpeta del propietario y prohíbe sobrescribir.
- La prueba de propiedad usa HMAC con un formato propio, separado de la firma de subida de Cloudinary.
- El backend verifica propietario, vigencia, formato, dimensiones, peso y URL mediante metadata del proveedor antes de registrar la foto.
- Se mantienen máximo 6 fotos y mínimo 3 para publicar. Agregar usa una posición libre; ordenar valida que la lista sea completa y lo hace dentro de una transacción.
- La eliminación remota solo se hace para fotos con el nuevo prefijo que permite comprobar el propietario. Las imágenes antiguas fuera de ese prefijo no se eliminan de Cloudinary automáticamente: requieren una revisión manual de archivos huérfanos.
- Las imágenes se transforman a tamaños adecuados, con formato/calidad automáticos; el estado de error se reinicia al cambiar la imagen.

### Chat
- Historial de 40 mensajes por solicitud, con cursor basado en fecha e ID y conservación de la precisión de PostgreSQL. Los anteriores se cargan con un botón.
- Listas de chats de 30 por página. Los contadores se consultan por separado, sin depender de la primera página.
- Envíos con confirmación, identificador del cliente y reintento con el mismo identificador. El servidor evita duplicados de ese reintento.
- Diferencia visible entre enviando, enviado y envío sin confirmar. No se promete un estado de lectura en tiempo real que el servidor todavía no emite.
- Revalidación de sesión y acceso; comprobación de bloqueos en ambas direcciones para mensajes y avisos de escritura.
- Los eventos esperan a que termine la autenticación del socket. La sesión tiene vencimiento y los canales de recepción incluyen su versión.
- Al reconectar se recupera la página reciente y su cursor. La escritura de otra conversación no aparece en el chat abierto.
- Marcar leído afecta solo hasta el mensaje mostrado; no invalida todo el historial ni provoca el antiguo bucle de consultas.
- El selector de emojis se descarga cuando se abre.

### Descubrir, ubicación e interfaz
- Se conserva Supabase/PostgreSQL/PostGIS y la búsqueda de localidades existente. La ubicación pública sigue siendo una localidad; no se publica una ubicación GPS precisa.
- Elegir localidad guarda coordenadas y geometría en la misma operación del perfil. Se eliminó la actualización masiva de geometrías en cada consulta del feed.
- La búsqueda de localidades devuelve solo ID, localidad y provincia, hasta 10 resultados; tiene límite de longitud y debounce en la interfaz.
- La nueva tanda del feed se solicita en segundo plano después de confirmar el swipe, cuando quedan 3 perfiles. La precarga no bloquea el siguiente swipe. Un error de guardado conserva el perfil visible y permite reintentar.
- Los pases no se borran automáticamente al agotar perfiles.
- Los likes mutuos se serializan por pareja para evitar crear matches duplicados.
- Filtros accesibles desde Descubrir: edad, distancia y selección múltiple de géneros, incluida la opción de cualquier género.
- Identidad personalizada opcional y textos respetuosos; desaparece la búsqueda por coincidencia exacta de identidades escritas a mano.
- Escuela y declaración visibles desde la primera foto; el botón Ver perfil abre el detalle.
- Paleta clara y gris, mayor contraste del texto secundario, chat sin gradientes fucsias, tarjeta acotada en escritorio, botones con texto y etiquetas de accesibilidad.
- El formulario de perfil ya no sobrescribe cambios sin guardar cuando se refrescan las fotos. Guarda perfil y preferencias con el cierre transaccional.
- Rutas separadas en archivos de JavaScript descargables a demanda. El service worker ya no precarga todo el JavaScript de la aplicación ni cachea respuestas de la API.
- Docker usa Node 22 y npm ci; synchronize queda desactivado para evitar cambios automáticos del esquema.

## Verificación realizada

- Backend: npm run build correcto.
- Backend: 6 suites, 17 pruebas correctas. Cubren publicación, edad, proyección pública, validación de DTO, acceso a conversaciones, autorización de fotos y reintentos de mensajes.
- Frontend: TypeScript y compilación de producción correctos.
- JavaScript principal: antes 1.293,76 KB (385,20 KB gzip); ahora 561,53 KB (182,75 KB gzip). Es una reducción del archivo principal, no una medición del tiempo real de carga ni del total de todos los módulos.
- Precarga del service worker: 4 entradas, 3,26 KiB. Los módulos se cachean al utilizarlos.
- Revisión en navegador con una API local de datos ficticios: ingreso, tarjeta, selección múltiple de filtros, edición/guardado de perfil y lista de conversaciones.
- El auxiliar docs/auditoria/preview-api.cjs no tiene conexiones a base de datos. Sirve solo para revisar la presentación; no prueba autenticación, sockets ni Cloudinary reales.
- No se ejecutaron pruebas end-to-end que requieran la base de datos. La prueba de dos cuentas, la subida real de fotos, el correo de recuperación y el comportamiento en Render siguen pendientes.
- La compilación conserva un aviso por el tamaño del módulo principal y otro por la antigüedad de la lista de navegadores. El lint general ya tenía errores previos; no se considera un control aprobado por esta entrega.

## Estado de Supabase

Aplicado manualmente por el propietario y verificado el 3 de septiembre de 2026:
- users.session_version: integer, NOT NULL, default 0.
- messages.client_message_id: uuid, nullable para compatibilidad con mensajes anteriores.
- profiles.birthdate y profiles.gender: nullable para permitir borradores reales durante el onboarding.
- Índices presentes: idx_messages_history_page, uq_messages_client_retry y uq_users_email_normalized.
## Qué ejecutar en Supabase

Archivo del repositorio de backend:

docs/cambios/01-esquema-requerido.sql

Ejecutarlo completo en SQL Editor antes de desplegar el backend nuevo. El bloque es transaccional; no borra usuarios, perfiles, mensajes ni fotos. Incorpora las columnas de sesiones/reintentos, permite borradores sin fecha/género y agrega índices. También completa geometrías solo a partir de coordenadas ya guardadas.

Si aparece un error, enviar el texto y detenerse; no ejecutar las migraciones históricas como alternativa. Si funciona, enviar las dos tablas de resultados al final del script.

Mantener Data API desactivada, según el cambio informado durante la conversación. Eso no fue verificado remotamente por esta entrega.

## Orden para la prueba real

1. Ejecutar el SQL y revisar el resultado.
2. Desplegar esta versión del backend y del frontend de forma coordinada. La versión anterior del frontend no es compatible con los nuevos contratos de finalización, fotos y mensajes.
3. Volver a iniciar sesión: los JWT viejos no incluyen la versión de sesión.
4. Con una cuenta nueva, interrumpir y retomar el onboarding; verificar que no pueda entrar a Descubrir antes de terminar y que no pueda finalizar con menos de 3 fotos.
5. Con dos cuentas completas, probar filtros, likes simultáneos, match, chat, historial de más de 40 mensajes, reconexión y reintento sin duplicados.
6. Bloquear desde una cuenta y verificar que la otra no pueda abrir el perfil, enviar mensajes ni mostrar escritura.
7. Probar subir, reordenar y eliminar fotos, y recuperar contraseña comprobando que la sesión anterior deje de funcionar.

## Temas que requieren otra decisión o configuración

Esta tanda no cierra todos los hallazgos del análisis original:

- Administración: el rol sigue dependiendo de ADMIN_EMAIL, sin verificación obligatoria de correo. Antes del lanzamiento conviene pasar a un ID o rol administrativo provisionado explícitamente.
- Reportes: sigue la política original de suspensión automática con dos reportes. Falta decidir revisión humana, apelación y protección frente a abuso; también queda pendiente hacer atómica esa operación completa.
- Tipo de vínculo: se mantiene una intención en el perfil. Permitir varias intenciones simultáneas requiere acordar las categorías y su compatibilidad; no se inventaron nuevas categorías.
- Los filtros no se hacen recíprocos automáticamente: respetan la búsqueda del usuario que consulta. La reciprocidad de edad, distancia e intención es una decisión pendiente.
- El acceso administrativo, la lista histórica alternativa GET /matches y las métricas todavía necesitan la siguiente revisión de paginación y permisos.
- Correo verificado, rotación de secretos que pudieran haber estado expuestos, certificado TLS de la conexión a Supabase y configuración de proxy de Render requieren comprobar la configuración real.
- Los límites de intentos están en memoria. Antes de usar varias instancias hacen falta límites compartidos y distribución de eventos entre sockets de distintas instancias.
- Queda medir consultas con EXPLAIN en Supabase y latencia en Render; esta entrega no puede afirmar tiempos de respuesta reales.

## Ajuste posterior: aplicación vacía y vueltas de Descubrir

Solicitado el 3 de septiembre de 2026:

- El género es obligatorio para completar y publicar un perfil. La columna admite NULL solo durante el borrador del onboarding; Descubrir exige gender no nulo.
- Los únicos filtros elegibles son edad, distancia y uno o varios géneros. La opción "Personas de cualquier género" muestra todas las categorías.
- Se eliminó la exclusión por último inicio de sesión. Siguen fuera los perfiles incompletos, suspendidos, bloqueados, el propio usuario y el perfil administrativo.
- El feed entrega 10 perfiles por solicitud, con máximo técnico de 30.
- Un LIKE o PASS excluye el perfil durante la vuelta actual.
- Cuando no quedan perfiles elegibles sin decisión, la interfaz ofrece dos opciones. "Esperar perfiles nuevos" conserva todos los PASS. "Revisar perfiles que pasé" vuelve a comprobar dentro de una transacción y, sólo por esa acción explícita, elimina todos los PASS aplicables a los filtros actuales para comenzar el recorrido completo desde el principio.
- Si aparece un perfil nuevo entre la pantalla vacía y la acción de reinicio, se muestra ese perfil y se conservan los PASS anteriores.
- Los LIKE, matches y bloqueos no se reciclan.
- El SQL manual para vaciar los datos es el archivo del backend docs/cambios/02-vaciar-datos.sql. Conserva locations y migrations.
- El SQL no elimina los archivos físicos de Cloudinary. La carpeta ontomatch/profiles debe limpiarse allí por separado.
