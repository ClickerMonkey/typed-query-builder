
export type Name = string | number | symbol;


export type JsonScalar = number | string | boolean | null;

export type JsonObject = { [key: string]: JsonScalar | JsonObject | JsonArray; };

export type JsonArray = Array<JsonScalar | JsonObject | JsonArray>;

export type Json = JsonScalar | JsonObject | JsonArray;


export type Scalars = number | string | boolean | null | undefined | Date;

export type OperationUnaryType = '-' | 'BITNOT';

export type OperationBinaryType = '%' | '*' | '+' | '/' | '-' | '^' | 'BITAND' | 'BITXOR' | 'BITOR' | 'BITLEFT' | 'BITRIGHT';

export type PredicateUnaryType = 'NULL' | 'NOT NULL' | 'TRUE' | 'FALSE';

export type PredicateBinaryType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>' | 'DISTINCT' | 'NOT DISTINCT' | 'LIKE' | 'NOT LIKE';

export type PredicatesType = 'AND' | 'OR';

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

export type OrderDirection = 'ASC' | 'DESC';

export type SetOperation = 'UNION' | 'INTERSECT' | 'EXCEPT';

export type PredicateBinaryListType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>';

export type PredicateBinaryListPass = 'ANY' | 'ALL';

export type PredicateRowType = '=' | '!=' | '<>' | '<' | '<=' | '>' | '>=' | 'DISTINCT' | 'NOT DISTINCT';

export type WindowFrameMode = 'RANGE' | 'ROWS' | 'GROUPS';

export type WindowFrameExclusion = 'CURRENT ROW' | 'GROUP' | 'TIES' | 'NO OTHERS';

export type GroupingSetType = 'BY' | 'GROUPING SET' | 'ROLLUP' | 'CUBE';

export type InsertPriority = 'LOW' | 'HIGH' | 'DELAYED';

export type LockStrength = 'UPDATE' | 'SHARE' | 'NO KEY UPDATE' | 'KEY SHARE';

export type LockRowLock = 'NOWAIT' | 'SKIP LOCKED';