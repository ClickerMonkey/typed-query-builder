# typed-query-builder

The most advanced TypeScript query builder available! It can generate SQL, be translated to and from JSON, or **run the query on local data**.

- Complete type checking for select, insert, update, and delete.
- Looks similar to SQL, so learning and reading is simplified.
- Types expose all common features in the most common databases, it will help you better understand SQL.
- Each implementation can tell you if a given query is supported.
- Ships with a *runtime implementation*, given `{ [tables: string]: object[] }` it can run queries on local data.
- Provides a common interface for operations and functions.

### TODO
- for SQL transformers...
  - which char wraps aliases + policy (always, reserved)
  - which char wraps table/columns + policy
- [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
- row constructor (ie tuple) takes comma delimited list of values, or source.*
- row comparisons (row op row, row IS [NOT] NULL)
   - op: =, !=, <>, <, <=, >, >=, IS DISTINCT FROM, IS NOT DISTINCT FROM
- select `DISTINCT` and `DISTINCT ON (value, ...) alias` 
- join type comes down to A, AB, and B (what the results should be).
 - if join type does not include A, then iterate on B first
- UPDATE source, ... SET 
     field = value, ... 
     (field, ...) = ROW(value, ...)
     (field, ...) = Query<value, ...>
   WHERE condition 
   RETURNING [* | value, ...]
- DELETE FROM source WHERE condition
- Query value iteration
- Add Database which has...
   - run(query): RunResult
   - isSupported(query): boolean
- Add SQLDatabase which has
   - DataType to STRING calc
   - List of unsupported QueryValues
   - List of unsupported Functions
   - Additional validators { start: (QV), end: (QV, internal[])}
- For Postgres, detect when subquery in from references external source, use LATERAL
- simplified joins `USING (field, ...)` where field is on both
-  FOR NO KEY UPDATE, FOR UPDATE, FOR SHARE and FOR KEY SHARE is not valid with GROUP BY
- <=> on unsupported DBMS: 
   - IS NOT DISTINCT FROM
   - CASE WHEN (a = b) or (a IS NULL AND b IS NULL) THEN 1 ELSE 0 END = 1
   - NOT A <=> B = IS DISTINCT FROM
- != is always converted to <>
- add Query.with(query, source, expr, fn)
- certain joins result in types that are partialed
- when using if to join and search, outside the if maybe have those joins/froms partialed?
- add optional default to QuerySelect.value()