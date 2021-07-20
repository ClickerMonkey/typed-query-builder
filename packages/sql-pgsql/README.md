# @typed-query-builder/sql-pgsql

See [typed-query-builder README](https://github.com/ClickerMonkey/typed-query-builder/blob/master/README.md) for more details.  

Features: functions, operations, clauses, data types, etc.

The following query builder features are non-natively supported through this library:
- `MEDIUMINT`, `TINYINT`, `BIT` geometric data types
- `regexGet, iif, dateAdd, dateDiff, timestampToSeconds, datesOverlap, timestampsOverlap` functions
- `boolAnd, boolOr, countIf` aggregate functions

The following query builder features are added to support more PostgreSQL functionality.
- `SERIAL`, `SMALLSERIAL`, `BIGSERIAL` data types
- `minScale, scale, trimScale, widthBudget, bitLength, toHex, octetLength, sha256, sha512, encode, decode, age` functions.

The following query builder features are not supported on SQL Server:
- `UNSIGNED` data types
- `NAMED` parameters
- `geomPoint, geomPointX, geomPointY` geometric functions
- `variance` aggregate function