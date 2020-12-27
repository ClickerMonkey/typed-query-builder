
export const enum ExprKind {
    AGGREGATE               = 'agg',
    BETWEEN                 = 'btwn',
    CASE                    = 'case',
    CAST                    = 'cast',   
    PREDICATE_BINARY        = 'a?b',
    PREDICATE_BINARY_LIST   = 'a?l',
    PREDICATES              = 'andor',
    PREDICATE_UNARY         = 'a?',
    PREDICATE_ROW           = 'row?',
    CONSTANT                = 'const',
    DEFAULT                 = 'def',
    NULL                    = 'null',
    EXISTS                  = 'exist',
    FIELD                   = 'field',
    FUNCTION                = 'func',
    IN                      = 'in',
    NOT                     = 'not',
    OPERATION_BINARY        = 'a+b',
    OPERATION_UNARY         = '-a',
    PARAM                   = 'param',
    RAW                     = 'raw',
    ROW                     = 'row',
    JSON                    = 'json',
    JOIN                    = 'join',
    VALUES                  = 'values',
    TABLE                   = 'table',
    TABLE_UNSPECIFIED       = 'table?',
    QUERY_SELECT            = 'sel',
    QUERY_EXISTENTIAL       = '1',
    QUERY_FIRST             = 'first',
    QUERY_FIRST_VALUE       = 'value',
    QUERY_LIST              = 'list',
    QUERY_RECURSIVE         = 'recur',
    QUERY_SET_OPERATION     = 'set',
    STATEMENT_INSERT        = 'ins',
    STATEMENT_UPDATE        = 'upd',
    STATEMENT_DELETE        = 'del',
    USER_DEFINED_0          = 'user0',
    USER_DEFINED_1          = 'user1',
    USER_DEFINED_2          = 'user2',
    USER_DEFINED_3          = 'user3',
    USER_DEFINED_4          = 'user4',
    USER_DEFINED_5          = 'user5',
    USER_DEFINED_6          = 'user6',
    USER_DEFINED_7          = 'user7',
    USER_DEFINED_8          = 'user8',
    USER_DEFINED_9          = 'user9',
}