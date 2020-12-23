
export const enum DialectFeatures
{
  WITH                    = (1 << 0),
  WITH_RECURSIVE          = (1 << 1),
  AGGREGATE_OVER          = (1 << 2),
  AGGREGATE_DISTINCT      = (1 << 3),
  AGGREGATE_ORDER         = (1 << 4),
  AGGREGATE_FILTER        = (1 << 5),
  SELECT_DISTINCT_ON      = (1 << 6),
  SELECT_LATERAL_SUBQUERY = (1 << 7),
  ROW_CONSTRUCTOR         = (1 << 8),
  PREDICATE_LIST          = (1 << 9),
  WINDOWS                 = (1 << 10),
  GROUP_BY_SET            = (1 << 11),
  LOCK                    = (1 << 12),
  LOCK_TABLE              = (1 << 13),
  LOCK_ROW                = (1 << 14),
  ORDER_NULLS             = (1 << 15),
  DELETE_USING            = (1 << 16),
  DELETE_RETURNING        = (1 << 17),
  INSERT_PRIORITY         = (1 << 18),
  INSERT_IGNORE_DUPLICATE = (1 << 19),
  INSERT_INTO_MULTIPLE    = (1 << 20),
  INSERT_SET_ON_DUPLICATE = (1 << 21),
  INSERT_RETURNING        = (1 << 22),
  UPDATE_MULTISET         = (1 << 23),
  UPDATE_FROM             = (1 << 24),
  UPDATE_RETURNING        = (1 << 25),
  DEFAULT                 = (1 << 26),
  ARRAYS                  = (1 << 27),
  UNSIGNED                = (1 << 28),
  NAMED_PARAMETERS        = (1 << 29),

  ALL                     = -1,
}

export const DialectFeaturesDescription = 
[
  '',
  'WITH clause (common table expression)',
  'WITH RECURSIVE clause (common table expression)',
  'Aggregate OVER clause',
  'Aggregate DISTINCT clause',
  'Aggregate ORDER BY clause',
  'Aggregate FILTER clause',
  'SELECT DISTINCT ON clause',
  'LATERIAL subquery',
  'ROW constructor',
  'ANY/ALL predicate',
  'Window Functions',
  'Group By GROUPING SET/ROLLUP/CUBE',
  'SELECT LOCK',
  'SELECT LOCK specific table',
  'SELECT row level LOCK',
  'Order NULLS FIRST/LAST',
  'DELETE USING clause',
  'DELETE RETURNING clause',
  'INSERT priority',
  'INSERT ignore duplicate',
  'INSERT into multiple',
  'INSERT on duplicate key set clause',
  'INSERT RETURNING clause',
  'UPDATE multi-set',
  'UPDATE FROM clause',
  'UPDATE RETURNING',
  'DEFAULT expression',
  'ARRAY data types',
  'UNSIGNED numeric types'
];