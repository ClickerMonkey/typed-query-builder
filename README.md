# @typed-query-builder

The most advanced TypeScript query builder available! It can generate SQL, be translated to and from JSON, or **run the query on local data**.

But why? Do we need more? **I think so**. If you find yourself struggling to use an ORM or have problems using typical SQL features in a query builder this is the query builder for you. Nothing is more irritating than having to resort to SQL strings because what you're using doesn't support something simple. This library aims at providing a query building experience that feels like SQL, but with type safety and auto-completion. Not only that, but your queries can be ran against any supported database. This library also has a *runtime* implementation which is a local implementation of a database. This makes testing your business logic _without connecting to a real database_ as easy as can be. Each database implementation has common SQL features but also features specific to that database if you really need to utilize uncommon functionality. If you also have custom expressions, functions, data types, etc you can easily merge your types and utilize them. **With all of this power, this makes developing, refactoring, and testing easy.**

[Examples](#examples) | [FAQ](#faq)

### Features
- [Type safe](#type-safe)
- [Looks like SQL](#looks-like-sql)
- [Common SQL Features](#sql-features)
- [Singular Interface](#singular-interface)
- [Customizable](#customizable)
- [Powerful](#powerful)
- [SQL Implementations](#sql-implementations)
- [Runtime Implementation](#runtime-implementation)
- [`SELECT`](#select)
- [`INSERT`](#insert)
- [`UPDATE`](#update)
- [`DELETE`](#delete)

## Type safe
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

All sources have defined fields and types. As you join, select, and return fields the expressions and return type transforms to match the expressions. Type safety is good at warning when you're building an invalid query, informing what operations you can perform, and produces exactly the expected output for any highly dynamic built query.

## Looks like SQL
Queries built should read like SQL. **Too often** do ORMs or query builders venture too far from SQL to the point where it's not clear what the output is going to look like or if it will work as you intended, and it ends up being too restrictive and you may end up reverting to using query strings. Not with `typed-query-builder`! (hopefully!)

[Examples](#examples)

## SQL Features
- All common math operations & conditions. [v](#common-math-operations)
- All common functions. [v](#common-functions)
- Aggregate functions, including filter and order logic. [v](#aggregate-functions)
- Window functions, including filter and order logic. [v](#window-aggregate-functions)
- `with` expressions.
- `recursive` with expressions.
- `window` expressions.
- `union`, `intersect`, and `except`.
- `grouping` & `having`.
- `ordering`.
- Using the results of a select/insert/update/delete as a source to select/join/insert against.

### Common Math Operations
- **Operations Binary**: '%' | '*' | '+' | '/' | '-' | '^' | 'BITAND' | 'BITXOR' | 'BITOR' | 'BITLEFT' | 'BITRIGHT'
- **Operations Unary**: '-' | 'BITNOT'
- **Predicates Binary**: '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>' | 'DISTINCT' | 'NOT DISTINCT' | 'LIKE' | 'NOT LIKE'
- **Predicates Unary**: 'IS NULL' | 'IS NOT NULL' | 'IS TRUE' | 'IS FALSE';
- **Predicates List**: '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>' ... 'ANY' | 'ALL'
- **Predicates Row**: '=' | '!=' | '<>' | '<' | '<=' | '>' | '>=' | 'DISTINCT' | 'NOT DISTINCT'

### Common Functions
- **Math**: abs, ceil, floor, exp, ln, mod, power, sqrt, cbrt, degrees, radians, div, factorial, gcd, lcm, log10, log, pi, round, sign, truncate
- **Random**: random
- **Trigonometric**: aos, acosd, asin, asind, atan, atand, atan2, atan2d, cos, cosd, cot, cotd, sin, sind, tan, tand, sinh, cosh, tanh, asinh, acosh, atanh
- **Operations**: coalesce, iif, greatest, least
- **String**: lower, upper, trim, trimLeft, trimRight, concat, length, indexOf, substring, regexGet, regexReplace, char, join, format, left, right, padLeft, padRight, md5, repeat, replace, reverse, startsWith
- **Date**: dateFormat, dateParse, timestampParse, dateAddDays, dateWithTime, daysBetween, dateSubDays, currentTime, currentTimestamp, currentDate, dateGet, dateTruncate, dateAdd, dateDiff, createDate, createTime, createTimestamp, timestampToSeconds, timestampFromSeconds, datesOverlap, timestampsOverlap
- **Geometry**: geomCenter, geomContains, geomDistance, geomWithinDistance, geomIntersection, geomIntersects, geomTouches, geomLength, geomPoints, geomPoint, geomPointX, geomPointY

### Aggregate Functions
- count, countIf, sum, avg, min, max, deviation, variance, array, string, bitAnd, bitOr, boolAnd, boolOr

### Window Aggregate Functions
- rowNumber, rank, denseRank, percentRank, culmulativeDistribution, ntile, lag, lead, firstValue, lastValue, nthValue

## Singular Interface
Even if the underlying database doesn't support particular functionality, it will appear to and the builder will substitue an equivalent expression when possible. Using a singular interface for communicating with the database also allows built queries to be used on any number of supported databases. This also makes it simple to support complex data types like geometry/geography.

For example, **SQL Server** doesn't have the following operations or functions, but they are supported seamlessly:
- `<<`, `>>`, `least`, `greatest`, `factorial`, `truncate`, `startsWith`, `dateWithTime`, `timestampToSeconds`, `timestampFromSeconds`, `datesOverlap`, `timestampsOverlap`, `boolAnd`, `boolOr`, `countIf`, `padLeft`, `padRight`, `Circle` & `Box` data types to mention a few;

## Customizable
Comes with common functions, operations, expressions, and data types. Its trivial to add your own and maintain type safety. 

### Custom Function Example
```ts
import { DialectPgsql } from '@typed-query-builder/pgsql';

interface UserFunctions {
  random(min: number, max: number): number;
}
// Adding to dialect
DialectPgsql.functions.setFormat('random', '(random() * ({1} - {0}) + {0})');
// the expression used in a query
func<'random', UserFunctions>(0, from(Table).count());
```

### Custom Expression Example
```ts
import { ExprScalar, ExprKind } from '@typed-query-builder/builder';
import { DialectPgsql } from '@typed-query-builder/pgsql';

class MyExpr extends ExprScalar<number> {
  public static readonly id = ExprKind.USER_DEFINED_0;
  public getKind() { return ExprKind.USER_DEFINED_0 };
  public constructor(
    public min: Expr<number>, 
    public max: Expr<number>,
    public whole: boolean
  ) {}
}

DialectPgsql.transformer.setTransformer<MyExpr>(
  MyExpr,
  (expr, transform, out) => {
    const min = out.wrap(expr.min);
    const max = out.wrap(expr.max);
    const rnd = `random() * (${max} - ${min}) + ${min}`;

    return expr.whole ? `floor(${rnd} + 1)` : rnd;
  },
);

// the expression used in a query
new MyExpr(min, max, whole);
```

## Powerful
Traditionally writing SQL can often be cumbersome. You may find yourself having to reuse the same expression over and over. For example, if you are selecting the distance between two locations - you may see it in the select, in a where condition, and in the order by. With `typed-query-builder` you can reuse previously defined expressions for ease of reading:

```ts
from(Persons)
  .select(({ person }, exprs, { geomDistance }) => [
    person.id,
    person.name,
    geomDistance(person.location, {x: 0, y: 0}).as('meters'),
  ])
  .where((sources, exprs, fns, { meters }) => [
    meters.lt(1000)
  ])
  .orderBy('meters')
; // returns { id, name, meters }[]
```

## Runtime Implementation
`@typed-query-builder/run` is an implementation that allows you to perform any query on local data. A database implementation in TypeScript! This sort of functionality could be useful for any number of crazy scenarios. Imagine you have an application that you want to work offline. You can define all your business logic using query builders. A client and server could share the same logic however the client executes it on local data while sending the request off to the server to also process which runs the same logic against a real database. The client could verify the output from the server when it finally is able to communicate with it. If it doesn't match, and the client is carefully made, the local changes can be rolled back. If your application needs to work offline and you want to prevent concurrent modification of resources this may not work for you, but it is still possible to support advanced offline capabilities using this method.

```ts
import { runOn } from '@typed-query-builder/run';

const DB = {
  task: [
    { id: 1, name: 'Task 1', done: true },
    { id: 2, name: 'Task 2', done: false },
  ]
};

const results = from(Task)
  .select('*')
  .where(Task.fields.done)
  .run( runOn(DB) )
; // [{ id: 1, name: 'Task 1', done: true }]
```

## SQL Implementations

- `@typed-query-builder/sql-mssql` [README](packages/sql-mssql/README.md) contains the dialect for converting expressions into SQL Server query strings.
- `@typed-query-builder/mssql` given an mssql connection, process an expression and return a result.


### `SELECT`
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

- `WITH` given a source or recursive expression.
- `FROM` given any number of sources.
- `JOIN` given any number of sources.
- `WINDOW` define any number of windows.
- `SELECT` any number of expressions.
- `DISTINCT` on all values or specific expressions.
- `WHERE` any number of conditions.
- `GROUP BY` any number of expressions or grouping sets (include rollup & cube).
- `HAVING` met some group condition.
- `ORDER BY` any number of expressions, direction, nulls first or last?
- `LIMIT` to a certain number of results.
- `OFFSET` by a certain number of results.
- `LOCK` certain objects depending our goal.
- `UNION` or `INTERSECT` or `EXCEPT` another source.

*(the order above is the recommended order, since sources need to be established before selects are defined, and the following functions after that can reference the sources and the defined selects.)*

You can resolve a `SELECT` down to a list of objects or tuples, a first row, a singular value, an array of values, or a boolean on whether it returns results or not.

### `INSERT`
> A source is a table, a subquery, values (list of objects/tuples), or insert/update/delete expressions with a returning clause.

- `WITH` given a source or recursive expression.
- `INTO` a table.
- `VALUES` any number of sources.
- `RETURNING` any number of expressions (by default, the number of affected rows).
- `ON DUPLICATE KEY SET` any number of fields when the record exists.

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

#### Define Tables
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
    parentId: ['NULL', 'INT'], // nullable
  },
  fieldColumns: {
    doneAt: 'finished_at', // optionally the real column name
  },
});
```

#### Select
```ts
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
  .orderBy('doneAt', 'DESC')
  .limit(10)
;
```

#### Insert
```ts
// INSERT INTO task VALUES (id, name, done, doneAt, parentId) VALUES (DEFAULT, '...', DEFAULT, DEFAULT, DEFAULT)
insert(Task).values({ name: 'Complete Documentation' });

// INSERT INTO task (name) VALUES ('Task #1'), ('Task #2')
insert(Task, ['name']).values([['Task #1'], ['Task #2']]);

// TODO
// - insert example with extensive WITH & RETURNING expressions
// - insert with values from any source
// - insert with on duplicate key set
```

#### Update
```ts
// UPDATE task SET name = 'New Name' WHERE id = 10
update(Task).set('name', 'New Name').where(Task.fields.id.eq(10));
update(Task).set({ name: 'New Name' }).where(Task.fields.id.eq(10));

update(Task).set(
  ['name', 'done'], 
  ['New Name', true] // could be subquery which returns one [string, boolean]
).where(Task.fields.id.eq(10));

// TODO
// - update with multi-set with subquery
// - update with from
// - update example with extensive WITH & RETURNING expressions
```

#### Delete
```ts
// DELETE FROM task WHERE id = 10 RETURNING name
deletes(Task).where(Task.fields.id.eq(10)).returning('name');

// TODO examples:
// - delete example with extensive WITH & RETURNING expressions
// - delete with using
```

## FAQ

#### 1). When do you use `Task.fields.name` vs `({ task }) => task.name`

You can pass expressions directly to many functions, but you can also use a "provider". A provider is a function which has the following parameters:
- `sources`: The object containing all sources specified before this provider in froms, joins, withs, etc.
- `exps`: An object containing all the expressions available
- `fns`: An object containing all the common functions available
- `selects`: An object containing all the previously defined selections.

When you use table aliasing, you need to use the provider function.

#### 2). I am getting a "Type instantiation is excessively deep and possibly infinite." error.

At the moment, occasionally TypeScript chokes on some of the types defined in this library. The workaround for the moment is
to add `// @ts-ignore` before the problematic line to ignore the error. If you notice the error consistently occurs on a specific
thing please file a bug report. A temporary work-around is to pull that functionality out into its own function so you only have
to ignore it in one place.


### TODO
- simplified joins `USING (field, ...)` where field is on both
