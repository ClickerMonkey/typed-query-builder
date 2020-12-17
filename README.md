# typed-query-builder

The most advanced TypeScript query builder available! It can generate SQL, be translated to and from JSON, or **run the query on local data**.

- Complete type checking for select, insert, update, and delete.
- Looks similar to SQL, so learning and reading is simplified.
- Types expose all common features in the most common databases, it will help you better understand SQL.
- Each implementation can tell you if a given query is supported.
- Ships with a *runtime implementation*, given `{ [tables: string]: object[] }` it can run queries on local data.
- Provides a common interface for operations and functions.

### Example

```typescript
// This translates data types to TypeScript types
const Task = define({
  name: 'task',
  fields: {
    id: 'INT',
    name: ['VARCHAR', 64],
    done: 'BOOLEAN',
    doneAt: 'TIMESTAMP',
    parentId: 'INT',
  },
});

// SELECT
// Query keeps track of from/joins and the types
// As you select more the return type is built
const q = query()
  .from(Task)
  // Any source (type, subquery, constants) can be aliased and referenced down below
  .from(Task.as('parentTask'))
  // Join any source
  .joinInner(
     query()
      .from(TaskList.as('list'))
      .select(({ list }, { count }) => [
          count().as('taskCount'),
          list.id 
      ])
      .groupBy('id')
      .as('listAndCount'),
     // ON
     ({ task, listAndCount }) => task.listId.eq( listAndCount.id )
  )
  // Can be Task.all(), Task.except(...), Task.only(...), [ Task.select."field", ... ]
  .select(Task.all())
  // Dynamic select values
  .select(({ task }, exprs, { lower }) => [
    // You can use expressions and functions to select dynamic values
    lower(task.name).as('lowerName'),
    // Subquery that returns single value
    query().from(Task).count().as('taskCount'),
  ])
  // Everything after from & select has access to from/joined fields
  // even if they are subqueries. Exprs contains all expressions you
  // can use. The following is an object containing all the functions.
  // All type safe!
  .where(({ task }, exprs, { currentTime, dateAddDays }, { taskCount }) => [
    task.doneAt.isNotNull(),
    task.doneAt.between( currentTime(), dateAddDays( currentTime(), 10 ) ),
    // We can access select expressions here!
    taskCount.gt(10)
  ])
  // You can't normally order by a computed value defined in the 
  // select value, but we can!
  .orderBy('lowerName', 'DESC') 
;

/**
 * q = Array<{
 *  id: number,
 *  name: string,
 *  done: boolean,
 *  doneAt: Date,
 *  parentId: number,
 *  lowerName: string,
 *  taskCount: number,
 * }>
 * 
 * q.first() = result
 * q.max('lowerName') = string
 * q.list('name') = string[]
 * q.value('doneAt') = Date
 * q.exists() = 1 | null
 */

// INSERT
const q = insert()
  // WITH syntax
  .with(
    query()
      .from(People)
      .select(People.all())
      .as('people')
  )
  // Specify all fields
  .into(Task)
  // Or specific fields
  .into(Task, ['name', 'parentId'])
  // Can pass SELECT, single tuple/object, or list of tuple/objects.
  // This types here are based on the with/into above.
  .values(({ people }, { defaults }) => [
    defaults(),
    'Task #1',
    false,
    null,
    null,
    people.id
  ])
  // Can specify to return all, certain fields, or expressions
  .returning('*')
  .returning(['id', 'name'])
  .returning(({ task }, exprs, { lower }) => [
    lower(task.name).as('lower'),
    ...task.all()
  ])
;

```

## Syntax

### Basics
- `expression`: anything that returns a value (ie table field, function, constant)
- `scalar`: an expression with simple value result (string, number, etc)
- `scalar[]`: an expression with a list of scalar results
- `condition`: an expression with a boolean result
- `row`: an expression with a tuple result (ie `[string, number, string]`)
- `with`: a SELECT or INSERT, UPDATE, DELETE with returning that returns rows.
- `source`: an expression which returns a list of rows/objects
  - `table`: a table name, or a table with an alias (ie `persons` or `persons as "alias"`)
  - `query`: a subquery with an alias (ie `QUERY as "alias"`)
  - `constant`: a constant set of rows (ie `[[1, true], [2, false]] as "alias"`)
  - `with`: the name of the with
- `x, ...`: There could be a comma separated list of "x"
- `[x]`: x is optional
- `{x | y}`: either x or y can be used

<details>
<summary>SELECT syntax</summary>
<p>

```
WITH [RECURSIVE] "with_alias" as with, ...
DISTINCT [ON (scalar, ...)]
FROM source, ...
JOIN source ON condition, ...
SELECT scalar AS "select_alias", ...
WHERE condition[]
GROUP BY {scalar | "select_alias"}, ...
HAVING condition
ORDER BY {scalar | "select_alias"} [DESC | ASC] [NULLS {FIRST | LAST}], ...
OFFSET offset
LIMIT limit
LOCK lock_type

...

QUERY -- order by below uses select names from first query
{UNION | INTERSECT | EXCEPT} [ALL] QUERY, ...
ORDER BY "select_alias" [DESC | ASC] [NULLS (FIRST | LAST)], ...
LIMIT limit
OFFSET offset
```

</p>
</details>


<details>
<summary>INSERT syntax</summary>
<p>

```
WITH query as "alias", ...
INSERT INTO table [column, ...]
[VALUES] source
RETURNING (* | scalar, ...)
```

</p>
</details>

### SQL Features TODO
- recursive with  (pgsql, mysql)
- priority to sources for evaluation (withs, froms, joins)
- partitions? (pgsql, mysql)
- windows? (pgsql, mysql)
  1. specify window (name, [partition by, ...], [order by, ...])
    - frame: {RANGE|ROWS|GROUPS} [BETWEEN rel AND ] {UNBOUNDED PRECEDING|offset PRECEDINGI|CURRENT ROW|offset FOLLOWING|UNBOUNDED FOLLOWING} [EXCLUDE {CURRENT ROW|GROUP|TIES|NO OTHERS}]
  2. in select, window is available in ExprAggregate to call .over(windowName)
- rollup?
- lock rules per table?
- grouping sets?
- FROM [ONLY] syntax, for pgsql's table inheritance
- allow user to define their own functions which returns a ExprUserFunction defineFunction(name, args): (...Expr[]) => Expr
- add filter to aggregate expr
- add orderby to aggregate expr when type is array_agg or string_agg
- [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
- row constructor (ie tuple) takes comma delimited list of values, or source.* (use JoinTuples)
- row comparisons (row op row, row IS [NOT] NULL)
   - op: =, !=, <>, <, <=, >, >=, IS DISTINCT FROM, IS NOT DISTINCT FROM
- select `DISTINCT` and `DISTINCT ON (value, ...) alias` 
- UPDATE source, ... SET 
     field = value, ... 
     (field, ...) = ROW(value, ...)
     (field, ...) = Query<value, ...>
   WHERE condition 
   RETURNING [* | value, ...]
- DELETE FROM source WHERE condition

### Refined TODO
- for SQL transformers...
  - which char wraps aliases + policy (always, reserved)
  - which char wraps table/columns + policy
- join type comes down to A, AB, and B (what the results should be).
 - if join type does not include A, then iterate on B first
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
- when using if to join and search, outside the if maybe have those joins/froms partialed?
- add optional default to QuerySelect.value()
