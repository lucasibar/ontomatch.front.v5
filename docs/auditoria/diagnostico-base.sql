-- OntoMatch: diagnóstico inicial. Ejecutar manualmente en el editor SQL.
-- Solo SELECT sobre catálogos/estadísticas: no modifica datos ni ejecuta funciones propias.
-- No consulta emails, contraseñas, mensajes, fotos ni ubicaciones de personas.
-- Devolveme las filas (seccion, resultado), exportadas como JSON/CSV si resulta más cómodo.
-- Los permisos corresponden al rol con que ejecutes esto; puede diferir del rol del backend.

WITH tablas AS (
  SELECT c.oid, n.nspname AS esquema, c.relname AS tabla,
         c.relrowsecurity, c.relforcerowsecurity, c.relowner, c.relacl
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p')
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND n.nspname NOT LIKE 'pg_toast%'
    AND c.relname IN (
      'users', 'profiles', 'profile_photos', 'preferences', 'locations',
      'swipes', 'matches', 'conversations', 'messages', 'blocks', 'reports',
      'migrations', 'typeorm_metadata'
    )
), secciones AS (
  SELECT '01_entorno' AS seccion,
    jsonb_build_object(
      'version', current_setting('server_version'),
      'timezone', current_setting('TimeZone'),
      'rol_editor', current_user,
      'search_path', current_setting('search_path')
    ) AS resultado
  UNION ALL
  SELECT '02_extensiones', COALESCE(jsonb_agg(jsonb_build_object(
    'nombre', e.extname, 'version', e.extversion, 'esquema', n.nspname
  ) ORDER BY e.extname), '[]'::jsonb)
  FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
  UNION ALL
  SELECT '03_columnas', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', t.esquema, 'tabla', t.tabla, 'columna', a.attname,
    'tipo', format_type(a.atttypid, a.atttypmod), 'not_null', a.attnotnull,
    'default', pg_get_expr(d.adbin, d.adrelid)
  ) ORDER BY t.esquema, t.tabla, a.attnum), '[]'::jsonb)
  FROM tablas t JOIN pg_attribute a ON a.attrelid = t.oid
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attnum > 0 AND NOT a.attisdropped
  UNION ALL
  SELECT '04_constraints', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', t.esquema, 'tabla', t.tabla, 'nombre', c.conname,
    'tipo', c.contype, 'definicion', pg_get_constraintdef(c.oid),
    'validada', c.convalidated, 'diferible', c.condeferrable
  ) ORDER BY t.esquema, t.tabla, c.conname), '[]'::jsonb)
  FROM tablas t JOIN pg_constraint c ON c.conrelid = t.oid
  UNION ALL
  SELECT '05_indices', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', t.esquema, 'tabla', t.tabla, 'definicion', pg_get_indexdef(i.indexrelid),
    'valido', i.indisvalid, 'listo', i.indisready
  ) ORDER BY t.esquema, t.tabla, i.indexrelid), '[]'::jsonb)
  FROM tablas t JOIN pg_index i ON i.indrelid = t.oid
  UNION ALL
  SELECT '06_enums', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', n.nspname, 'tipo', ty.typname, 'valor', e.enumlabel
  ) ORDER BY n.nspname, ty.typname, e.enumsortorder), '[]'::jsonb)
  FROM pg_type ty JOIN pg_namespace n ON n.oid = ty.typnamespace
  JOIN pg_enum e ON e.enumtypid = ty.oid
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  UNION ALL
  SELECT '07_tablas_permisos_volumen', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', t.esquema, 'tabla', t.tabla,
    'propietario', pg_get_userbyid(t.relowner), 'acl', t.relacl::text,
    'rls', t.relrowsecurity, 'rls_forzada', t.relforcerowsecurity,
    'filas_estimadas', s.n_live_tup, 'filas_muertas_estimadas', s.n_dead_tup,
    'lecturas_secuenciales', s.seq_scan, 'lecturas_indice', s.idx_scan,
    'ultimo_autoanalyze', s.last_autoanalyze,
    'editor_select', has_table_privilege(t.oid, 'SELECT'),
    'editor_insert', has_table_privilege(t.oid, 'INSERT'),
    'editor_update', has_table_privilege(t.oid, 'UPDATE'),
    'editor_delete', has_table_privilege(t.oid, 'DELETE')
  ) ORDER BY t.esquema, t.tabla), '[]'::jsonb)
  FROM tablas t LEFT JOIN pg_stat_user_tables s ON s.relid = t.oid
  UNION ALL
  SELECT '08_politicas', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', p.schemaname, 'tabla', p.tablename, 'nombre', p.policyname,
    'roles', p.roles, 'comando', p.cmd, 'using', p.qual, 'with_check', p.with_check
  ) ORDER BY p.schemaname, p.tablename, p.policyname), '[]'::jsonb)
  FROM pg_policies p JOIN tablas t ON t.esquema = p.schemaname AND t.tabla = p.tablename
  UNION ALL
  SELECT '09_triggers', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', t.esquema, 'tabla', t.tabla, 'nombre', g.tgname,
    'habilitado', g.tgenabled, 'definicion', pg_get_triggerdef(g.oid)
  ) ORDER BY t.esquema, t.tabla, g.tgname), '[]'::jsonb)
  FROM tablas t JOIN pg_trigger g ON g.tgrelid = t.oid WHERE NOT g.tgisinternal
  UNION ALL
  SELECT '10_funciones_propias_metadatos', COALESCE(jsonb_agg(jsonb_build_object(
    'esquema', n.nspname, 'nombre', p.proname,
    'argumentos', pg_get_function_identity_arguments(p.oid),
    'security_definer', p.prosecdef, 'propietario', pg_get_userbyid(p.proowner),
    'acl', p.proacl::text
  ) ORDER BY n.nspname, p.proname), '[]'::jsonb)
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND n.nspname NOT LIKE 'pg_toast%'
    AND p.prokind IN ('f', 'p')
    AND NOT EXISTS (
      SELECT 1 FROM pg_depend d
      WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid AND d.deptype = 'e'
    )
)
SELECT seccion, resultado FROM secciones ORDER BY seccion;
