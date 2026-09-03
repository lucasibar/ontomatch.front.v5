# Resultado del diagnóstico de base recibido

Se analizó el JSON entregado por el usuario. No se hizo ninguna conexión a PostgreSQL ni se ejecutaron cambios. Los resultados corresponden a esa base, pendiente de confirmar si es la utilizada por el despliegue actual.

## Hallazgo prioritario: permisos de las tablas de aplicación

Las once tablas de aplicación en `public` tienen RLS desactivada y privilegios amplios para `anon` y `authenticated`, incluyendo lectura, inserción, actualización y eliminación. Esto incluye `users`, `messages`, `profiles` y `profile_photos`. No aparecen políticas ni triggers en las tablas consultadas.

La estructura y los roles corresponden a un entorno Supabase. Si la Data API está habilitada y expone `public`, y el rol dispone del acceso al esquema, estos permisos permiten acceder por una vía que no pasa por los controles de NestJS. La ausencia de RLS no implica que una solicitud tenga que pasar por el backend propio. La exposición HTTP efectiva todavía no se comprobó.

Fuente: [controles de acceso de Supabase](https://supabase.com/docs/guides/api/securing-your-api).

Falta revisar en el panel si Data API está habilitada y qué esquemas expone. No se necesita una API key ni la contraseña de la base. Si solo NestJS debe acceder, la solución debe cerrar el acceso directo innecesario conservando los permisos del rol utilizado por el backend. No aplicar políticas basadas en `auth.uid()` sin tener en cuenta que esta aplicación usa autenticación propia y `public.users`.

El `rol_editor: postgres` indica con qué rol se ejecutó el diagnóstico; no demuestra que el backend utilice ese mismo rol.

## Confirmaciones favorables

- PostgreSQL 17.6, PostGIS 3.3.7 y columnas `geography(Point,4326)`.
- Índices GiST válidos y listos en `profiles.geom` y `locations.geom`.
- Índices de mensajes por `(conversation_id, created_at)` y `(conversation_id, read_at)`. No hace falta crearlos nuevamente para empezar a paginar.
- Unicidad de swipe por par de usuarios, match por par y tipo de soporte, conversación por match y posición de foto por usuario. Las garantías de concurrencia del servicio siguen requiriendo revisión.
- Los enums de género e intención coinciden con los valores usados por el código actual. Las migraciones antiguas siguen sin reproducir fielmente esta base.

## Correcciones y vacíos confirmados

- **Se descarta el conflicto hipotético del reordenamiento con un CHECK de 1 a 6**: ese CHECK no existe en esta base. Sigue existiendo el problema independiente de agregar una foto con `cantidad + 1` después de dejar huecos al borrar.
- Tampoco aparecen CHECKs que garanticen rangos de edad/distancia y `age_min <= age_max` en `preferences`.
- `messages.conversation_id` admite NULL: la FK comprueba conversaciones existentes cuando el valor está presente, pero no obliga a que cada mensaje tenga conversación.
- `coaching_school` y coordenadas admiten NULL. No hay un trigger en las tablas consultadas que garantice la integridad del onboarding. Por lo tanto, no apareció una protección de base que compense la aceptación de `isOnboarded` desde el cliente.
- No aparece restricción única por `(reporter_id, reported_id)` en reportes, aunque el código intenta impedir duplicados por consulta previa. Hay riesgo de carrera.
- Hay mezcla de `timestamp without time zone` para creación y `timestamptz` para otros eventos. UTC en la sesión no elimina por sí solo los riesgos de interpretación entre entornos.
- No aparecen funciones propias en `public`. Las funciones listadas pertenecen a esquemas de infraestructura de Supabase; no se deben tratar como lógica de negocio de OntoMatch.

## Volumen: no confundir estadísticas con conteos

Las estadísticas muestran aproximadamente un usuario, un perfil, una preferencia y tres fotos, con cero filas estimadas en ubicaciones, mensajes y otras tablas. No se ejecutó `COUNT(*)`; estas estimaciones pueden estar desactualizadas. No prueban que falten localidades ni que esta sea una base de pruebas. Conviene confirmar que se consultó el proyecto correcto antes de pedir más consultas de integridad o rendimiento.

## Dos datos puntuales para continuar

1. ¿Esta base es la que utiliza la aplicación publicada o es una base de pruebas?
2. Una captura de la configuración de Data API que muestre habilitación y esquemas expuestos, sin claves ni credenciales.

Después de confirmar esos datos se puede preparar el SQL específico que corresponda. No se ejecutará desde el agente: se entregará al usuario para su ejecución manual.
