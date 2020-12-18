# @typed-query-builder

The most advanced TypeScript query builder available! It can generate SQL, be translated to and from JSON, or **run the query on local data**.

[Examples](#examples)

### Features
- [Type safe](#type-safe)
- [Looks like SQL](#looks-like-sql)
- [Common SQL Features](#sql-features)
- [Singular Interface](#singular-interface)
- [Customizable](#customizable)
- [Powerful](#powerful)
- [Runtime Implementation](#runtime-implementation)
- [`SELECT`](#select)
- [`INSERT`](#insert)
- [`UPDATE`](#update)
- [`DELETE`](#delete)

[FAQ](#faq)

## Type safe
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

All sources have defined fields and types. As you join, select, and return fields the expressions and return type transforms to match the expressions. Type safety is good at warning when you're building an invalid query, informing what operations you can perform, and produces exactly the expected output for any highly dynamic built query.

## Looks like SQL
Queries built should read like SQL. **Too often** do ORMs or query builders venture too far from SQL to the point where it's not clear what the output is going to look like or if it will work as you intended, and it ends up being too restrictive and you may end up reverting to using query strings. Not with `typed-query-builder`! (hopefully!)

[Examples](#examples)

## SQL Features
- All common math operations & conditions.
- All common functions.
- Aggregate functions, including filter and order logic.
- `with` expressions.
- `recursive` with expressions.
- `window` expressions.
- `union`, `intersect`, and `except`.
- `grouping` & `having`.
- `ordering`.
- Using the results of a select/insert/update/delete as a source to select/join/insert against.

## Singular Interface
Even if the underlying database doesn't support particular functionality, it will appear to and the builder will substitue an equivalent expression when possible. Using a singular interface for communicating with the database also allows built queries to be used on any number of supported databases.

## Customizable
Comes with common functions, operations, expressions, and data types. Its trivial to add your own and maintain type safety. 

### Custom Function Example
```ts
interface UserFunctions {
  random(min: number, max: number, whole?: boolean): number;
}
// the expression used in a query
func<'random', UserFunctions>(0, from(Table).count(), true);
```

### Custom Expression Example
```ts
import { ExprScalar, ExprKind } from '@typed-query-builder/builder';
import { DialectPgsql } from '@typed-query-builder/pgsql';

class MyExpr extends ExprScalar<number> {
  public getKind() { return ExprKind.USER_DEFINED };
  public constructor(
    public min: Expr<number>, 
    public max: Expr<number>,
    public whole: boolean
  ) {}
}
DialectPgsql.expr(MyExpr, (expr, transform) => {
  const min = transform(expr.min);
  const max = transform(expr.max);
  const rnd = `random() * (${max} - ${min}) + ${min}`;
  return expr.whole ? `floor(${rnd} + 1)` : rnd;
});
// the expression used in a query
new MyExpr(min, max, whole);
```

## Powerful
Traditionally writing SQL can often be cumbersome. You may find yourself having to reuse the same expression over and over. For example, if you are selecting the distance between two locations - you may see it in the select, in a where condition, and in the order by. With `typed-query-builder` you can reuse previously defined expressions for ease of reading:

```ts
from(Persons)
  .select(({ person }, exprs, { distance }) => [
    person.id,
    person.name,
    distance(person.location, {x: 0, y: 0}).as('meters'),
  ])
  .where((sources, exprs, fns, { meters }) => [
    meters.lt(1000)
  ])
  .orderBy('meters')
; // returns { id, name, meters }[]
```

## Runtime Implementation
`@typed-query-builder/run` is an implementation that allows you to perform any query on local data. A database implementation in TypeScript! This sort of functionality could be useful for any number of crazy scenarios. Imagine you have an application that you want to work offline. You can define all your business logic using query builders. A client and server could share the same logic however the client executes it on local data while sending the request off to the server to also process which runs the same logic against a real database. The client could verify the output from the server when it finally is able to communicate with it. If it doesn't match, and the client is carefully made, the local changes can be rolled back. If your application needs to work offline and you want to prevent concurrent modification of resources this may not work for you, but it is still possible to support advanced offline capabilities using this method.

### `SELECT`
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

- `WITH` given a source or recursive expression.
- `FROM` given any number of sources.
- `JOIN` given any number of sources.
- `SELECT` any number of expressions.
- `WHERE` any number of conditions.
- `GROUP BY` any number of expressions.
- `HAVING` met some group condition.
- `ORDER BY` any number of expressions, direction, nulls first or last?
- `LIMIT` to a certain number of results.
- `OFFSET` by a certain number of results.
- `LOCK` certain objects depending our goal.
- `UNION` or `INTERSECT` or `EXCEPT` another source.

You can resolve a `SELECT` down to a list of objects or tuples, a first row, a singular value, an array of values, or a boolean on whether it returns results or not.

### `INSERT`
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

- `WITH` given a source or recursive expression.
- `INTO` a table.
- `VALUES` any number of sources.
- `RETURNING` any number of expressions (by default, the number of affected rows).

### `UPDATE`
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

- `WITH` given a source or recursive expression.
- `UPDATE` a table.
- `SET` any number of table fields to expressions.
- `SET` a tuple of table fields to a select which returns a matching singular tuple.
- `FROM` additional sources.
- `WHERE` any number of conditions.
- `RETURNING` any number of expressions (by default, the number of affected rows)

### `DELETE`
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

- `WITH` given a source or recursive expression.
- `FROM` a table.
- `USING` additional sources.
- `WHERE` any number of conditions.
- `RETURNING` any number of expressions (by default, the number of affected rows)


### Examples

```ts
import { query, from, insert, update, remove, table } from '@typed-query-builder/builder';

// First we define our tables
const Task = table({
  name: 'task',
  table: 'v_table', // optionally the real table name
  fields: { // these inform what the TS types will be
    id: 'INT',
    name: ['VARCHAR', 64],
    done: 'BOOLEAN',
    doneAt: 'TIMESTAMP',
    parentId?: 'INT', // nullable
  },
  fieldColumns: {
    doneAt: 'finished_at', // optionally the real column name
  },
});

// SELECT * FROM task
from(Task).select('*');

// SELECT COUNT(*) FROM task;
from(Task).count();

// SELECT id, name FROM task WHERE done = true
from(Task).select(Task.only('id', 'name')).where(Task.fields.done);
from(Task)
  .select(({ task }) => [ 
    task.id, 
    task.name 
  ])
  .where(({ task }) => [
    task.done
  ])
;

// SELECT COUNT(*) FROM task WHERE done = true
Task.fields.done.count();

// SELECT MIN(doneAt) WHERE parentId = 34
Task.fields.doneAt.min().where(Task.fields.parentId.eq(34));

// SELECT name WHERE done = true
Task.fields.name.list(Task.fields.done); // string[]

// SELECT task.id, task.name, task.parentId, parent.name AS parentName FROM task LEFT JOIN task AS parent ON parent.id = task.parentId
from(Task)
  .joinLeft(Task.as('parent'), 
    ({ task, parent }) => task.parentId.eq(parent.id)
  )
  .select(({ task, parent }) => [
    task.id,
    task.name,
    task.parentId,
    parent.name.as('parentName'),
  ])
;

// SELECT all children of a given task, recursively - keeping track of their depth
query().with(
   // initial
  () => 
    from(Task)
      .select(({ task }, { constant }) => [
        constant(0).as('depth'),
        task.id,
        task.name,
        task.parentId
      ])
      .where(({ task }, { param }) => [
        task.id.eq(param('taskId')) // named parameter
      ])
      .as('task_tree'),
  // recursive (fetch children for each previous run)
  ({ task_tree }) =>
    from(Task)
      .select(({ task }) => [
        task_tree.depth.add(1),
        task.id,
        task.name,
        task.parentId
      ])
      .where(({ task }) => [
        task.parentId.eq(task_tree.id)
      ])
  )
  .from('source_tree')
  .select('*')
; // given { taskId } get { depth, id, name, parentId }[]

// SELECT 10 most recent tasks finished in the past 10 days
from(Task)
  .select('*')
  .where(({ task }, exprs, { currentDate, dateAddDays }) => [
    task.doneAt.isNotNull(),
    task.doneAt.between( dateAddDays(currentDate(), -10), currentDate() )
  ])
  .orderBy(({ task }) => task.doneAt, 'DESC')
  .limit(10)
;

// INSERT INTO task VALUES (id, name, done, doneAt, parentId) VALUES (DEFAULT, '...', DEFAULT, DEFAULT, DEFAULT)
insert(Task).values({ name: 'Complete Documentation' });

// INSERT INTO task (name) VALUES ('Task #1'), ('Task #2')
insert(Task, ['name']).values([['Task #1'], ['Task #2']]);

// UPDATE task SET name = 'New Name' WHERE id = 10
update(Task).set('name', 'New Name').where(Task.fields.id.eq(10));
update(Task).set(Task.fields.name, 'New Name').where(Task.fields.id.eq(10));
update(Task).set({ name: 'New Name' }).where(Task.fields.id.eq(10));

// DELETE FROM task WHERE id = 10 RETURNING name
remove(Task).where(Task.fields.id.eq(10)).returning('name');

// TODO examples:
// - insert/update/delete example with extensive WITH & RETURNING expressions
// - update with multi-set with subquery
// - update with from
// - select with subquery, values, insert/update/delete returning sources
// - delete with using
// - insert with values from any source
```

## FAQ

#### 1). When do you use `Task.fields.name` vs `({ task }) => task.name`

You can pass expressions directly to many functions, but you can also use a "provider". A provider is a function which has the following parameters:
- `sources`: The object containing all sources specified before this provider in froms, joins, withs, etc.
- `exps`: An object containing all the expressions available
- `fns`: An object containing all the common functions available
- `selects`: An object containing all the previously defined selections.









### SQL Features TODO
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
- stored procedures support?

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
