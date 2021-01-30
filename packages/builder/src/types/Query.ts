
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

/**
 * 
 * BY = [a, b, c] = [ [a, b, c] ]
 * GROUPING SET = [ [a, b], [a], [c], [] ]
 * CUBE = [a, b, c] = [ [a, b, c], [a, b], [a, c], [a], [b, c], [b], [c], [] ]
 * ROLLUP = [a, b, c] = [ [a, b, c], [a, b], [a], [] ]
 * 
 * # Composite
 * ROLLUP = [[a, b], c] = [ [a, b, c], [a, b], [] ]
 * ROLLUP = [a, [b, c], d] = [ [a, b, c, d], [a, b, c], [a], [] ]
 * 
 * # Concatenate
 * BY + ROLLUP = [a] + [b, c] = [ [a, b, c], [a, b], [a] ]
 * SET + SET = [a, b] + [c, d] = [ [a, c], [a, d], [b, c], [b, d] ]
 * BY + CUBE + SET = [a] + CUBE[b, c] + SET[[d], [e]] 
 *    = [ [a] ] + [ [b, c], [b], [c], [] ] + [ [d], [e] ]
 *    = [ [a, b, c, d], [a, b, c, e], [a, b, d], [a, b, e], [a, c, d], [a, c, e], [a, d], [a, e]]
 */
export type GroupingSetType = 'BY' | 'GROUPING SET' | 'ROLLUP' | 'CUBE';

export type InsertPriority = 'LOW' | 'HIGH' | 'DELAYED';

export type LockStrength = 'UPDATE' | 'SHARE' | 'NO KEY UPDATE' | 'KEY SHARE';

export type LockRowLock = 'NOWAIT' | 'SKIP LOCKED';