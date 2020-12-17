
export type Name = string | number | symbol;


export type JsonScalar = number | string | boolean | null;

export type JsonObject = { [key: string]: JsonScalar | JsonObject | JsonArray; };

export type JsonArray = Array<JsonScalar | JsonObject | JsonArray>;

export type Json = JsonScalar | JsonObject | JsonArray;


export type Scalars = number | string | boolean | null | undefined | Date;

export type OperationUnaryType = '-' | 'BITNOT';

export type OperationBinaryType = '%' | '*' | '+' | '/' | '-' | '^' | 'BITAND' | 'BITXOR' | 'BITOR' | 'BITNOT' | 'BITLEFT' | 'BITRIGHT';

export type ConditionUnaryType = 'NULL' | 'NOT NULL' | 'TRUE' | 'FALSE';

export type ConditionBinaryType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>' | '<=>' | 'LIKE' | 'ILIKE' | 'NOT LIKE' | 'NOT ILIKE';

export type ConditionsType = 'AND' | 'OR';

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

export type OrderDirection = 'ASC' | 'DESC';

export type AggregateType = 'COUNT' | 'AVG' | 'SUM'| 'MIN' | 'MAX' | 'STDEV' | 'VAR';

export type SetOperation = 'UNION' | 'INTERSECT' | 'EXCEPT';

export type LockType = 'update' | 'share' | 'none';

export type ConditionBinaryListType = '>' | '>=' | '<' | '<=' | '=' | '!=' | '<>';

export type ConditionBinaryListPass = 'ANY' | 'ALL';
