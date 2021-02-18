# @typed-query-builder
## Walk-through

Welcome to the walk-through! The goal of this document is to explain how the query builder works and provide examples for all available functionality.

1. [Intro](#intro)
2. [Pros](#pros)
3. [Cons](#cons)
4. [Sources](#sources)
5. [Select](#select)
6. [Insert](#insert)
7. [Update](#update)
8. [Delete](#delete)


## Intro

At it's core TQB allows you to build an abstract syntax tree (AST). Each node in the AST is referred to as an Expr (short for expression). 
This AST can represent a SELECT, DELETE, UPDATE, or INSERT.

A built AST can be transformed with the following transformers:

- @typed-query-builder/run: Run expressions against a local JSON database
- @typed-query-builder/mssql: Run expressions against a SQL Server connection
- @typed-query-builder/pgsql: Run expressions against a Postgres connection
- @typed-query-builder/sql: The base SQL generator
- @typed-query-builder/sql-mssql: Generates SQL Server query strings
- @typed-query-builder/sql-pgsql: Generates Postgres query strings

## Pros

- If you are familiar with SQL there is very little learning to do.
- Type safe building & output types.
- Common interface allows supporting multiple databases and non-native functionality.
- Customizable (custom functions, expressions, operations, data types)
- Reduces repetition of complex expressions

## Cons

- TypeScript has limitations and sometimes you need to use // @ts-ignore
- The builder syntax doesn't follow SQL syntax order.
- When trying to build queries generically (for an unknown table) there will be type issues and casting as any may be necessary.
- When trying to build queries dynamically (joining and selecting based on conditions) it can be a challenge, luckily `maybe` can be used.
