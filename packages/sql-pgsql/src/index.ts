
import { getDataTypeMeta, DataTypeInputs, isString, QueryJson, QueryFirst, QuerySelect, QueryList } from '@typed-query-builder/builder';
import { Dialect, addExprs, addFeatures, addQuery, ReservedWords, addSources, DialectFeatures } from '@typed-query-builder/sql';

import './types';


export const DialectPgsql = new Dialect();

DialectPgsql.removeSupport(
  DialectFeatures.UNSIGNED | 
  DialectFeatures.NAMED_PARAMETERS
);

DialectPgsql.addReservedWords(ReservedWords);

DialectPgsql.implicitPredicates = true;

DialectPgsql.predicateBinary.alias('!=', '<>');

DialectPgsql.predicateBinaryList.alias('!=', '<>');

DialectPgsql.operationBinary.aliases({
  BITAND: '&',
  BITOR: '|',
  BITXOR: '^',
  BITLEFT: '<<',
  BITRIGHT: '>>',
});

DialectPgsql.operationUnary.alias('BITNOT', '~');

DialectPgsql.predicateUnary.setFormats({
  FALSE: '{value} IS FALSE',
  TRUE: '{value}',
});

DialectPgsql.joinType.aliases({
  INNER: 'INNER JOIN',
  LEFT: 'LEFT JOIN',
  RIGHT: 'RIGHT JOIN',
  FULL: 'FULL JOIN',
});

// =========================================================
// Data Types
// =========================================================
DialectPgsql.setDataTypeUnsupported('LINE');

DialectPgsql.valueFormatterMap.BOOLEAN = Dialect.FormatBoolean;

DialectPgsql.setDataTypeFormat('BIT', { constant: 'BIT(1)' });
DialectPgsql.setDataTypeFormat('BITS', { constant: 'BITS(1)', tuple: 'BITS({1})' });
DialectPgsql.setDataTypeFormat('MEDIUMINT', { constant: 'INT', tuple: 'INT' });
DialectPgsql.setDataTypeFormat('TINYINT', { constant: 'SMALLINT', tuple: 'SMALLINT' });
DialectPgsql.valueFormatterMap.BIT = FormatInteger;
DialectPgsql.valueFormatterMap.TINYINT = FormatInteger;
DialectPgsql.valueFormatterMap.SMALLINT = FormatInteger;
DialectPgsql.valueFormatterMap.MEDIUMINT = FormatInteger;
DialectPgsql.valueFormatterMap.INT = FormatInteger;
DialectPgsql.valueFormatterMap.BIGINT = FormatInteger;
DialectPgsql.valueFormatterMap.BITS = FormatInteger;

DialectPgsql.setDataTypeFormat('FLOAT', { constant: 'REAL' });
DialectPgsql.valueFormatterMap.FLOAT = FormatFloat;

DialectPgsql.setDataTypeFormat('DOUBLE', { constant: 'DOUBLE PRECISION' });
DialectPgsql.valueFormatterMap.DOUBLE = FormatFloat;

DialectPgsql.valueFormatterMap.NUMERIC = FormatDecimal;
DialectPgsql.valueFormatterMap.DECIMAL = FormatDecimal;

DialectPgsql.valueFormatterMap.MONEY  = FormatDecimal;

DialectPgsql.valueFormatterMap.CHAR = Dialect.FormatString;

DialectPgsql.valueFormatterMap.VARCHAR = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('TEXT', { constant: 'VARCHAR(MAX)' });
DialectPgsql.valueFormatterMap.TEXT = Dialect.FormatString;

DialectPgsql.valueFormatterMap.TIMESTAMP = (v, d, t) => `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
DialectPgsql.valueFormatterMap.DATE = (v, d, t) => `'${v.toISOString().substring(0, 10)}'`;
DialectPgsql.valueFormatterMap.TIME = (v, d, t) => `'${v.toISOString().substring(11, 19)}'`;

DialectPgsql.valueFormatterMap.UUID = Dialect.FormatString;

DialectPgsql.valueFormatterMap.CIDR = Dialect.FormatString;
DialectPgsql.valueFormatterMap.INET = Dialect.FormatString;
DialectPgsql.valueFormatterMap.MACADDR = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('BINARY', { constant: 'BYTEA' });
DialectPgsql.valueFormatterMap.BINARY = FormatBinary;

DialectPgsql.setDataTypeFormat('VARBINARY', { constant: 'BYTEA' });
DialectPgsql.valueFormatterMap.VARBINARY = FormatBinary;

DialectPgsql.setDataTypeFormat('VARBINARY', { constant: 'BYTEA', tuple: 'BYTEA' });
DialectPgsql.valueFormatterMap.BLOB = Dialect.FormatString;

DialectPgsql.valueFormatterMap.JSON = (v) => "'" + JSON.stringify(v) + "'::json";

DialectPgsql.valueFormatterMap.XML = Dialect.FormatString;

DialectPgsql.valueFormatterMap.POINT = ({x, y}, d, t) => `point (${x}, ${y})`;

DialectPgsql.setDataTypeFormat('SEGMENT', { constant: 'LSEG' });
DialectPgsql.valueFormatterMap.SEGMENT = ({x1, y1, x2, y2}, d, t) => `lseg [(${x1}, ${y1}), (${x2}, ${y2})]`;

DialectPgsql.valueFormatterMap.CIRCLE = ({ x, y, r}, d, t) => `circle <(${x}, ${y}), ${r}>`;
DialectPgsql.valueFormatterMap.PATH = ({ points }, d, t) => `path [${points.map(({x, y}: any) => `(${x}, ${y})`).join(', ')}]`;
DialectPgsql.valueFormatterMap.POLYGON = ({ corners }, d, t) => `polygon (${corners.map(({x, y}: any) => `(${x}, ${y})`).join(', ')})`;

DialectPgsql.setDataTypeFormat('BOX', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.BOX = ({ l, t, r, b }, d, i) => `box ((${l}, ${t}), (${r}, ${b}))`;


function FormatDecimal(value: number, dialect: Dialect, dataType?: DataTypeInputs)
{
  return value.toFixed(getDataTypeMeta(dataType).fractionDigits || 0);
}

function FormatInteger(value: number)
{
  return value.toFixed(0);
}

function FormatFloat(value: number)
{
  return value.toString();
}

function FormatBinary(value: any, dialect: Dialect)
{
  if (isString(value))
  {
    return dialect.quoteValue(value.split('').map(escapeBinary).join('')) + '::bytea';
  }

  return value;
}

function escapeBinary(x: string)
{
  if (x === '\\')
  {
    return '\\\\';
  }

  const code = x.codePointAt(0)!;

  if (code <= 31 || code >= 127)
  {
    const octal = code.toString(8);

    return '\\000'.substring(0, 4 - octal.length) + octal;
  }

  return x;
}

// Fallbacks
DialectPgsql.valueFormatter.push(
  Dialect.FormatBoolean,
  Dialect.FormatDate,
  Dialect.FormatString,
  Dialect.FormatNumber,
  Dialect.FormatNull,
);

// =========================================================
// Functions
// =========================================================
DialectPgsql.functions.setUnsupported([
  'geomPoint', 'geomPointX', 'geomPointY'
]);
DialectPgsql.aggregates.setUnsupported([
  'variance'
]);

DialectPgsql.functions.aliases({
  minScale: 'MIN_SCALE',
  trimScale: 'TRIM_SCALE',
  truncate: 'TRUNC',
  widthBucket: 'WIDTH_BUCKET',
  bitLength: 'BIT_LENGTH',
  toHex: 'TO_HEX',
  octetLength: 'OCTET_LENGTH',
  getBit: 'GET_BIT',
  getByte: 'GET_BYTE',
  setBit: 'SET_BIT',
  setByte: 'SET_BYTE',
  trimLeft: 'LTRIM',
  trimRight: 'RTRIM',
  padLeft: 'LPAD',
  padRight: 'RPAD',
  indexOf: 'STRPOS',
  substring: 'SUBSTR',
  startsWith: 'STARTS_WITH',
  regexReplace: 'REGEXP_REPLACE',
  char: 'CHR',
  join: 'CONCAT_WS',
  dateParse:'TO_DATE',
  timestampParse: 'TO_TIMESTAMP',
  dateFormat: 'TO_CHAR',
  dateGet: 'DATE_PART',
  dateTruncate: 'DATE_TRUNC',
  createDate: 'MAKE_DATE',
  createTime: 'MAKE_TIME',
  createTimestamp: 'MAKE_TIMESTAMP',
  timestampFromSeconds: 'TO_TIMESTAMP',
  geomCenter: 'CENTER',
  geomLength: 'LENGTH',
  geomPoints: 'NPOINTS',
  uuid: 'GEN_RANDOM_UUID',
});

DialectPgsql.functions.setFormats({
  regexGet: 'REGEXP_MATCH({0}, {1})[1]',
  currentTime: 'CURRENT_TIME',
  currentTimestamp: 'CURRENT_TIMESTAMP',
  currentDate: 'CURRENT_DATE',
  iif: '(CASE WHEN {0} THEN {1} ELSE {2} END)',
  dateAdd: `({2} + interval '{1} {0}')`,
  dateDiff: `(date_part({0}, {2}) - date_part({0}, {1}))`,
  timestampToSeconds: 'EXTRACT(EPOCH FROM {0})',
  datesOverlap: '(({0}, {1}) OVERLAPS ({2}, {3}))',
  timestampsOverlap: '(({0}, {1}) OVERLAPS ({2}, {3}))',
  geomContains: '(({0})@>({1}))',
  geomDistance: '(({0})<->({1}))',
  geomIntersection: '(({0})#({1}))',
  geomIntersects: '(({0})?#({1}))',
  geomTouches: '(({0})&&({1}))',
  geomWithinDistance: '(({0})<->({1})) <= {2}',
  geomTranslate: '(({0})+({1}))',
  geomPathConcat: '(({0})+({1}))',
  geomScale: '(({0})*({1}))',
  geomDivide: '(({0})/({1}))',
  geomSame: '(({0})~=({1}))',
});

DialectPgsql.aggregates.aliases({
  bitAnd: 'BIT_AND',
  bitOr: 'BIT_OR',
  boolAnd: 'BOOL_AND',
  boolOr: 'BOOL_OR',
  string: 'STRING_AGG',
  rowNumber: 'ROW_NUMBER',
  denseRank: 'DENSE_RANK',
  percentRank: 'PERCENT_RANK',
  culmulativeDistribution: 'CUME_DIST',
  firstValue: 'FIRST_VALUE',
  lastValue: 'LAST_VALUE',
  nthValue: 'NTH_VALUE',
});

DialectPgsql.aggregates.setFormats({
  countIf: 'COUNT({distinct}CASE WHEN ({0}) = 1 THEN 1 ELSE NULL END){over}',
});

DialectPgsql.functions.setCascadings({
  random: [
    [1, '(random() * (({0}) - ({1})) + ({1}))'],
    [0, '(random() * ({0}))'],
    ['*', 'random()'],
  ],
});

DialectPgsql.functionsRawArguments.dateAdd = { 0: true };


// =========================================================
// Expressions
// =========================================================
addExprs(DialectPgsql);
addFeatures(DialectPgsql);
addQuery(DialectPgsql);
addSources(DialectPgsql);

DialectPgsql.transformer.setTransformer<QueryJson<any, any>>(
  QueryJson,
  (expr, transform, out) => 
  {
    const { json } = expr;

    const subquery = out.modify({ includeSelectAlias: true }, () => transform(json, out));

    if (json instanceof QueryFirst)
    {
      return `SELECT row_to_json(t) FROM (${subquery}) as t`;
    }
    else if (json instanceof QuerySelect)
    {
      return `SELECT json_agg(row_to_json(t)) FROM (${subquery}) as t`;
    }
    else if (json instanceof QueryList)
    {
      return `SELECT json_agg(t.item) FROM (${subquery}) as t`;
    }
    else
    {
      throw new Error('Converting the request operation to JSON is not supported.');
    }
  }
);
