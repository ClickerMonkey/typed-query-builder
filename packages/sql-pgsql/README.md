# @typed-query-builder/sql-pgsql

See [typed-query-builder README](https://github.com/ClickerMonkey/typed-query-builder/blob/master/README.md) for more details.  

Features: functions, operations, clauses, data types, etc.

The following query builder features are non-natively supported through this library:
- `CIRCLE`, `BOX` geometric data types
- `greatest, least, factorial, truncate, div, startsWith, dateWithTime, dateAddDays, dateSubDays, daysBetween, createTimestamp, currentDate, timestampToSeconds, timestampFromSeconds, datesoverlap, timestampsOverlap, padLeft, padRight` functions
- `boolAnd, boolOr, countIf` aggregate functions

The following query builder features are added to support more SQL Server functionality.
- `SMALLMONEY`, `NCHAR`, `NTEXT`, `NVARCHAR` data types
- `top`, `option` clauses for INSERT, SELECT, UPDATE
- `square, choose, nchar, soundexDifference, soundex, split, jsonTest, jsonValue, jsonQuery, jsonModify, dateName, day, month, year, geomArea, geomText, geomBoundary, geomWithBuffer, geomConvexHull, geomCrosses, geomDimension, geomDisjoint, geomEnd, geomStart, geomBoundingBox, geomEquals, geomClosed geomEmpty, geomRing, geomSimple, geomValid, geomOverlaps, geomSrid, geomRandomPoint, geomSymmetricDifference, geomWithin` functions.

The following query builder features are not supported on SQL Server:
- `UNSIGNED` data types
- `FILTER` clause in aggregate functions
- `DISTINCT ON` clause in SELECT
- `ROW` constructor, comparison, and updating
- `INSERT` priority
- `INSERT` on duplicate ignore or set
- `BITS` data type
- `LINE` data type (not to be confused with SEGMENT)
- `CBRT, GCD, LCM, REGEX_REPLACE, REGEX_GET` functions
- `BIT_AND, BIT_OR, NTHVALUE` aggregate functions



TODO

- Geometry types
- Functions
- Aggregates