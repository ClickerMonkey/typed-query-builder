# @typed-query-builder
## Walk-through

Welcome to the walk-through! The goal of this document is to explain how the query builder works and provide examples for all available functionality.

1. [Intro](#intro)
2. [Pros](#pros)
3. [Cons](#cons)
4. [Terms](#terms)
5. [Sources](#sources)
6. [Select](#select)
7. [Insert](#insert)
8. [Update](#update)
9. [Delete](#delete)


## Intro

At it's core TQB allows you to build an abstract syntax tree (AST). Each node in the AST is referred to as an Expr (short for expression). 
This AST can represent a SELECT, DELETE, UPDATE, or INSERT. Examples of Exprs: And, Or, Constant, Math Operation, Comparison, Aggregation, Cast.

A built AST can be transformed with the following transformers:

- @typed-query-builder/run: Run expressions against a local JSON database.
- @typed-query-builder/mssql: Run expressions against a SQL Server connection.
- @typed-query-builder/pgsql: Run expressions against a Postgres connection.
- @typed-query-builder/sql: The base SQL generator.
- @typed-query-builder/sql-mssql: Generates SQL Server query strings.
- @typed-query-builder/sql-pgsql: Generates Postgres query strings.

## Pros

- If you are familiar with SQL there is very little learning to do.
- Type safe building & output types.
- Common interface allows supporting multiple databases and non-native functionality.
- Customizable (custom functions, expressions, operations, data types).
- Reduces repetition of complex expressions.

## Cons

- TypeScript has limitations and sometimes you need to use // @ts-ignore
- The builder syntax doesn't follow SQL syntax order.
- When trying to build queries generically (for an unknown table) there will be type issues and casting as any may be necessary.
- When trying to build queries dynamically (joining and selecting based on conditions) it can be a challenge, luckily `maybe` can be used.

## Terms

- `source`: Something that can supply rows. A table, a subquery, a common table expression, a constant array of rows, or a insert/update/delete that returns values from affected rows.
- `exprs`: A factory of expressions like field, param, cases, func, cast, not, exists, and, or, between, aggregate, op, is, in, etc.
- `fns`: A factory of functions that can be called with constants or expressions.
- `selects`: A collection of named expressions that have been selected to be returned.
- `provider`: A function which provides `( source, exprs, fns, selects )` and expects a returned value of a specific type.

## Sources

### Table

There are two ways to define a table source. A table source is also a named source - meaning it can be directly used in from/joins. Other sources need to have `source.as('sourceName')` in order to become a named source. You can also do this with tables to add an alias.

#### Method 1
```ts
import { table } from '@typed-query-builder/builder';

const Task = table({
  name: 'task',
  // optional, defaults to name above
  table: 'tasks',
  // optional, defaults to first field defined below
  primary: ['id'], 
  fields: {
    id: 'INT',
    name: ['VARCHAR', 64],
    done: 'BOOLEAN',
    doneAt: ['NULL', 'TIMESTAMP'],
    parentId: ['NULL', 'INT'],
  },
  // optional, each field above is expected to be the column name
  //    this allows columns to be aliased so if you want to use human friendly fields 
  //    or allow column name changes without having to refactor the code.
  fieldColumn: {
    doneAt: 'done_at',
    parentId: 'parent_id',
  },
});

// Task type = { id: number, name: string, done: boolean, doneAt?: Date, parentId?: number }
```

This method is good for also documenting the column types. This method at the moment does cause TypeScript to choke for medium to large size tables.

#### Method 2
```ts
import { tableFromType } from '@typed-query-builder/builder';

interface Task {
  id: number;
  name: string;
  done: boolean;
  doneAt?: Date;
  parentId?: number;
}

const TaskTable = tableFromType<Task>()({
  name: 'task',
  // optional, defaults to name above
  table: 'tasks',
  // optional, defaults to first field defined below
  primary: ['id'], 
  // this is an array of the fields on the type which map to a column
  fields: ['id', 'name', 'done', 'doneAt', 'parentId'],
  // optional, each field above is expected to be the column name
  //    this allows columns to be aliased so if you want to use human friendly fields 
  //    or allow column name changes without having to refactor the code.
  fieldColumn: {
    doneAt: 'done_at',
    parentId: 'parent_id',
  },
});
```

This method is good for tables of any size. The drawback is that the database types are not clearly stated.

### Values

A values source accepts an array of records with the array of fields to take from those records. The order of the fields matter.

```ts
import { values } from '@typed-query-builder/builder';

const DefinedTypes = values([
  { id: 1, name: 'Boolean', code: 'b' },
  { id: 2, name: 'Number',  code: 'n' },
  { id: 3, name: 'String',  code: 's' },
], [
  'id', 'name', 'code'
]);
```

### Subquery

See [Select](#select)

### Common Table Expression

See [With](#with)

### Returning

See [Insert Returning](#insert-returning)
See [Update Returning](#update-returning)
See [Delete Returning](#delete-returning)

## Select

Using a `SELECT` statement is how you query values from zero or more sources. There are three different functions you can use to start a select statement: `withs`, `query`, & `from`.

The order of functions for building a query matter.

- `sources`: Defining sources needs to be done before you try to select values from them.
- `windows`: Defining named windows needs to be done before you reference them in the selects.
- `selects`: Define the expressions which defines the return values, referencing sources and windows.
- `...`: Now distinct, where, grouping, ordering, and paging can be defined and reference selects previously defined.

The functions available on a select expression:
- `extend()`: Copy query
- `with(source, recursive?)`: Add a CTE.
- `from(source)`: Add a source to select from.
- `join(type, source, on)`: Join with a source.
- `joinInner(source, on)`: Perform an inner join.
- `joinLeft(source, on)`: Perform a left outer join.
- `joinRight(source, on)`: Perform a right outer join.
- `joinFull(source, on)`: Perform a full outer join.
- `window(name, getWindow)`: Define a window.
- `clearWindows()`: Clear all windows.
- `select('*')`: Select all columns from all sources.
- `select(provider)`: Select an array of named expressions.
- `select(...selects)`: Select an argument list of named expressions.
- `clearSelect()`: Clear all selects.
- `distinct()`: Select only distinct records.
- `distonctOn(exprs)`: Select records that are distinct based on the given expressions.
- `where(provider)`: Add a where condition.
- `clearWhere()`: Clear all where conditions.
- `groupBy(selectNames)`: Group by the given selects.
- `groupBySet(selectNames)`: Group by the given grouping set.
- `groupByRollup(selectNames)`: Group by the given rollup grouping.
- `groupByCube(selectNames)`: Group by the given cube grouping.
- `group(type, selectNames)`: Group by specific type.
- `clearGroup()`: Clear all groupings.
- `having(condition)`: Specify the having condition for grouping.
- `orderBy(expr, order?, nullsLast?)`: Add an order by clause.
- `clearOrderBy()`: Clear all ordering.
- `limit(count?)`: Clear or set the limit of records to return.
- `offset(offset?)`: Clear or set the offset of records to return.
- `lock(strength, sources, rowLock?)`: Adds a lock on the given sources.
- `using(getResult)`: Passes the query to getResult and returns the result of the function.
- `maybe(condition, getQuery)`: Optionally add sources, selects, conditions, etc to the query if the given condition is true.
- `aggregate(name, functionArguments, distinct?, filter?, orderBy?)`: Returns an expression that returns a single value that is the result of the given aggregate.
- `count(distinct?, value?)`: Returns an expression that counts the records in the query.
- `countIf(selectNameOrCondition)`: Returns an expression that counts the records in the query that pass the given condition.
- `sum(selectNameOrExpr)`: Returns an expression that calculates the sum of the values from the records in the query.
- `avg(selectNameOrExpr)`: Returns an expression that calculates the average of the values from the records in the query.
- `min(selectNameOrExpr)`: Returns an expression that calculates the minimum of the values from the records in the query.
- `max(selectNameOrExpr)`: Returns an expression that calculates the maximum of the values from the records in the query.
- `first()`: Returns an expression that returns the first result in the query.
- `exists()`: Returns an expression which returns 1 of results exist in the query, otherwise null.
- `list(selectOrExpr)`: Returns an expression which returns an array of values from the results in the query.
- `value(selectOrExpr, defaultValue?)`: Returns an expression which returns a single value from the first result in the query.
- `generic()`: Converts the query into something that can be used in a `UNION`, `INTERSECT`, or `EXCEPT`.
