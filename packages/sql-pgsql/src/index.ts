
import { getDataTypeMeta, DataTypeInputs, isNumber, isString, OrderBy, QueryJson, NamedSource, Selects, QueryFirst, QuerySelect, QueryList, QueryFirstValue, ExprAggregate, SourceKind, SourceRecursive } from '@typed-query-builder/builder';
import { Dialect, addExprs, addFeatures, addQuery, ReservedWords, addSources, DialectFeatures, getOrder, getSelects, getNamedSource, getCriteria } from '@typed-query-builder/sql';

import './types';


export const DialectPgsql = new Dialect();

DialectPgsql.removeSupport(
  DialectFeatures.UNSIGNED | 
  DialectFeatures.NAMED_PARAMETERS
);

DialectPgsql.addReservedWords(ReservedWords);

DialectPgsql.insertOrder = ['with', 'INSERT', 'top', 'INTO', 'table', 'columns', 'returning', 'values', 'option'];
DialectPgsql.deleteOrder = ['with', 'DELETE', 'top', 'FROM', 'table', 'returning', 'using', 'where', 'option'];
DialectPgsql.updateOrder = ['with', 'UPDATE', 'top', 'ONLY', 'table', 'set', 'returning', 'from', 'where', 'option'];
DialectPgsql.selectOrder = ['with', 'SELECT', 'top', 'distinct', 'selects', 'into', 'from', 'joins', 'where', 'group', 'having', 'windows', 'order', 'paging', 'locks', 'option'];

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
DialectPgsql.setDataTypeUnsupported('BITS');
DialectPgsql.setDataTypeUnsupported('LINE');

DialectPgsql.setDataTypeFormat('BOOLEAN', { constant: 'BIT' });
DialectPgsql.valueFormatterMap.BOOLEAN = Dialect.FormatBoolean;

DialectPgsql.setDataTypeFormat('MEDIUMINT', { constant: 'INT', tuple: 'INT({1})' });
DialectPgsql.valueFormatterMap.BIT = FormatInteger;
DialectPgsql.valueFormatterMap.TINYINT = FormatInteger;
DialectPgsql.valueFormatterMap.SMALLINT = FormatInteger;
DialectPgsql.valueFormatterMap.MEDIUMINT = FormatInteger;
DialectPgsql.valueFormatterMap.INT = FormatInteger;
DialectPgsql.valueFormatterMap.BIGINT = FormatInteger;

DialectPgsql.setDataTypeFormat('FLOAT', { constant: 'FLOAT(24)' });
DialectPgsql.valueFormatterMap.FLOAT = FormatFloat;

DialectPgsql.setDataTypeFormat('DOUBLE', { constant: 'FLOAT(53)' });
DialectPgsql.valueFormatterMap.DOUBLE = FormatFloat;

DialectPgsql.valueFormatterMap.NUMERIC = FormatDecimal;
DialectPgsql.valueFormatterMap.DECIMAL = FormatDecimal;

DialectPgsql.valueFormatterMap.MONEY  = FormatDecimal;

DialectPgsql.valueFormatterMap.CHAR = Dialect.FormatString;

DialectPgsql.valueFormatterMap.VARCHAR = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('TEXT', { constant: 'VARCHAR(MAX)' });
DialectPgsql.valueFormatterMap.TEXT = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('TIMESTAMP', { constant: 'DATETIME2' });
DialectPgsql.valueFormatterMap.TIMESTAMP = (v, d, t) => `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
DialectPgsql.valueFormatterMap.DATE = (v, d, t) => `'${v.toISOString().substring(0, 10)}'`;
DialectPgsql.valueFormatterMap.TIME = (v, d, t) => `'${v.toISOString().substring(11, 19)}'`;

DialectPgsql.setDataTypeFormat('UUID', { constant: 'UNIQUEIDENTIFIER' });
DialectPgsql.valueFormatterMap.UUID = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('CIDR', { constant: 'VARCHAR(45)' });
DialectPgsql.valueFormatterMap.CIDR = Dialect.FormatString;
DialectPgsql.setDataTypeFormat('INET', { constant: 'VARCHAR(45)' });
DialectPgsql.valueFormatterMap.INET = Dialect.FormatString;
DialectPgsql.setDataTypeFormat('MACADDR', { constant: 'VARCHAR(17)' });
DialectPgsql.valueFormatterMap.MACADDR = Dialect.FormatString;

DialectPgsql.valueFormatterMap.BINARY = FormatBinary;
DialectPgsql.valueFormatterMap.VARBINARY = FormatBinary;

DialectPgsql.setDataTypeFormat('BLOB', { constant: 'VARBINARY(MAX)' });
DialectPgsql.valueFormatterMap.BLOB = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('JSON', { constant: 'NVARCHAR(MAX)' });
DialectPgsql.valueFormatterMap.JSON = (v) => JSON.stringify(v);

DialectPgsql.setDataTypeFormat('XML', { constant: 'NVARCHAR(MAX)' });
DialectPgsql.valueFormatterMap.XML = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('GEOMETRY', { constant: 'GEOMETRY' });

DialectPgsql.setDataTypeFormat('POINT', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.POINT = ({x, y}, d, t) => `geometry::Point(${x}, ${y}, ${getDataTypeMeta(t).srid})`;

DialectPgsql.setDataTypeFormat('SEGMENT', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.SEGMENT = ({x1, y1, x2, y2}, d, t) => 
  `geometry::STGeomFromText('LINESTRING (${textEmbed(x1)} ${textEmbed(y1)}, ${textEmbed(x2)} ${textEmbed(y2)})', ${getDataTypeMeta(t).srid})`;

DialectPgsql.setDataTypeFormat('CIRCLE', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.CIRCLE = ({ x, y, r}, d, t) => 
  `geometry::STGeomFromText('CIRCULARSTRING (${
    textEmbedEquation([x, r], () => x + r, () => `(${x}) + (${r})`)
  } ${textEmbed(y)}, ${textEmbed(x)} ${
    textEmbedEquation([y, r], () => y + r, () => `(${y}) + (${r})`)
  }, ${
    textEmbedEquation([x, r], () => x - r, () => `(${x}) - (${r})`)
  } ${textEmbed(y)}, ${textEmbed(x)} ${
    textEmbedEquation([y, r], () => y - r, () => `(${y}) - (${r})`)
  }, ${
    textEmbedEquation([x, r], () => x + r, () => `(${x}) + (${r})`)
  } ${textEmbed(y)})', ${getDataTypeMeta(t).srid})`;

DialectPgsql.setDataTypeFormat('PATH', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.PATH = ({ points }, d, t) => points.length
  ? `geometry::STGeomFromText('LINESTRING (${points.map( ({x, y}: any) => `${textEmbed(x)} ${textEmbed(y)}` ).join(', ')})', ${getDataTypeMeta(t).srid})`
  : `geometry::STGeomFromText('LINESTRING EMPTY', ${getDataTypeMeta(t).srid})`;

DialectPgsql.setDataTypeFormat('POLYGON', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.POLYGON = ({ corners }, d, t) => corners.length
  ? `geometry::STGeomFromText('POLYGON ((${corners.map( ({ x, y }: any) => `${textEmbed(x)} ${textEmbed(y)}` ).join(', ')}))', ${getDataTypeMeta(t).srid})`
  : `geometry::STGeomFromText('POLYGON EMPTY', ${getDataTypeMeta(t).srid})`;

DialectPgsql.setDataTypeFormat('BOX', { constant: 'GEOMETRY' });
DialectPgsql.valueFormatterMap.BOX = ({ l, t, r, b }, d, i) => 
  `geometry::STGeomFromText('POLYGON ((${textEmbed(l)} ${textEmbed(t)}, ${textEmbed(r)} ${textEmbed(t)}, ${textEmbed(r)} ${textEmbed(b)}, ${textEmbed(l)} ${textEmbed(b)}))', ${getDataTypeMeta(i).srid})`;


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
  if (isNumber(value))
  {
    return `0x${value.toString(16)}`;
  }

  if (isString(value))
  {
    return dialect.quoteValue(value);
  }

  return '0x' + Array.prototype.map.call(value, (n: number) => ("0" + n.toString(16)).slice(-2)).join('');
}

function isEmbeddable(x: any): boolean
{
  return /^([\d]+)$/i.test(String(x));
}

function textEmbed(x: any): string
{
  return isEmbeddable(x)
    ? String(x)
    : `'+CONVERT(NVARCHAR(MAX), ${x})+'`;
}

function textEmbedEquation(vars: any[], solve: () => any, asString: () => string): string
{
  return !vars.some( v => !isEmbeddable(v) )
    ? String(solve())
    : `'+CONVERT(NVARCHAR(MAX), ${asString()})+'`;
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
  // 'cbrt', 'gcd', 'lcm',
  // 'regexReplace', 'regexGet'
]);
DialectPgsql.aggregates.setUnsupported([
  // 'bitAnd', 'bitOr', 'nthValue'
]);

DialectPgsql.functions.aliases({
  ln: 'LOG',
  join: 'CONCAT_WS',
  trimLeft: 'LTRIM',
  trimRight: 'RTRIM',
  char: 'CHAR',
  nchar: 'NCHAR',
  regexReplace: 'REPLACE',
  length: 'LEN',
  split: 'STRING_SPLIT',
  repeat: 'REPLICATE',
  soundexDifference: 'DIFFERENCE',
  jsonTest: 'ISJSON',
  jsonValue: 'JSON_VALUE',
  jsonQuery: 'JSON_QUERY',
  jsonModify: 'JSON_MODIFY',
  dateFormat: 'FORMAT',
  dateGet: 'DATEPART',
  createDate: 'DATEFROMPARTS',
});

DialectPgsql.functions.setFormats({
  geomCenter: '({0}).STCentroid()',
  geomContains: '({0}).STContains({1})',
  geomDistance: '({0}).STDistance({1})',
  geomIntersection: '({0}).STIntersection({1})',
  geomIntersects: '({0}).STIntersects({1})',
  geomTouches: '({0}).STTouches({1})',
  geomLength: '({0}).STLength()',
  geomPoints: '({0}).STNumPoints()',
  geomPoint: '({0}).STPointN({1})',
  geomPointX: '({0}).STX',
  geomPointY: '({0}).STY'
});

DialectPgsql.aggregates.aliases({
  string: 'STRING_AGG',
  rowNumber: 'ROW_NUMBER',
  denseRank: 'DENSE_RANK',
  percentRank: 'PERCENT_RANK',
  culmulativeDistribution: 'CUME_DIST',
  firstValue: 'FIRST_VALUE',
  lastValue: 'LAST_VALUE',
  variance: 'VAR',
  deviation: 'STDEV',
});

DialectPgsql.functionsRawArguments.dateGet = { 0: true };
DialectPgsql.functionsRawArguments.dateTruncate = { 0: true };
DialectPgsql.functionsRawArguments.dateAdd = { 0: true };
DialectPgsql.functionsRawArguments.dateDiff = { 0: true };
// DialectPgsql.functionsRawArguments.convert = { 0: true };

DialectPgsql.functions.setFormats({
  factorial: '(WITH factorial(num, ans) AS (SELECT {0}, {0} UNION ALL SELECT num - 1, ans * (num - 1) FROM factorial WHERE num > 1) SELECT TOP 1 ans FROM factorial ORDER BY ans DESC)',
  truncate: 'ROUND({0}, 0, 1)',
  mod: '(({0}) % ({1}))',
  div: 'ROUND(({0}) / ({1}), 0, 1)',
  indexOf: 'PATINDEX({1}, {0})',
  md5: `HASHBYTES('MD5', {0})`,
  startsWith: '(LEFT({0}, LEN({1})) = {1})',
  dateParse: 'TRY_CAST({0} AS DATE)',
  timestampParse: 'TRY_CAST({0} AS DATETIME2)',
  dateAddDays: 'DATEADD(DAY, {1}, {0})',
  dateWithTime: 'DATETIME2FROMPARTS(DATEPART(YEAR, {0}), DATEPART(MONTH, {0}), DATEPART(DAY, {0}), DATEPART(HOUR, {1}), DATEPART(MINUTE, {1}), DATEPART(SECOND, {1}), 0, 0)',
  dateSubDays: 'DATEADD(DAY, -({1}), {0})',
  daysBetween: 'DATEDIFF(DAY, {0}, {1})',
  currentTime: 'CONVERT(TIME, CURRENT_TIMESTAMP)',
  currentTimestamp: 'CURRENT_TIMESTAMP',
  currentDate: 'CONVERT(DATE, CURRENT_TIMESTAMP)',
  createTime: 'TIMEFROMPARTS({0}, {1}, {2}, 0, 0)',
  createTimestamp: 'DATETIME2FROMPARTS({0}, {1}, {2}, {3}, {4}, {5}, 0, 0)',
  timestampToSeconds: `DATEDIFF(SECOND, '1970-01-01 00:00:00', {0})`,
  timestampFromSeconds: `DATEADD(SECOND, {0}, '1970-01-01 00:00:00')`,
  datesOverlap: 'NOT({2} > {1} OR {3} < {0})',
  timestampsOverlap: 'NOT({2} > {1} OR {3} < {0})',
});

DialectPgsql.aggregates.setFormats({
  boolAnd: '(1 - MIN({distinct}{0})){over}',
  boolOr: 'MAX({distinct}{0}){over}',
  countIf: 'COUNT({distinct}CASE WHEN ({0}) = 1 THEN 1 ELSE NULL END){over}',
});

DialectPgsql.functions.setCascadings({
  round: [
    [1, 'ROUND({0}, {1})'],
    [0, 'ROUND({0}, 0)'],
  ],
  padLeft: [
    [2,  `CONCAT(REPLICATE({2}, LEN({0}) - ({1})), {0})`],
    [1,  `CONCAT(REPLICATE(' ', LEN({0}) - ({1})), {0})`],
  ],
  padRight: [
    [2, `CONCAT({0}, REPLICATE({2}, LEN({0}) - ({1})))`],
    [1, `CONCAT({0}, REPLICATE(' ', LEN({0}) - ({1})))`],
  ],
  random: [
    [1, '(RAND() * (({0}) - ({1})) + ({1}))'],
    [0, '(RAND() * ({0}))'],
    ['*', 'RAND()'],
  ],
});

DialectPgsql.functions.sets({
  greatest: (params) => `(SELECT MAX(i) FROM (VALUES ${params.argList?.map( a => `(${a})`).join(', ')}) AS T(i))`,
  least: (params) => `(SELECT MIN(i) FROM (VALUES ${params.argList?.map( a => `(${a})`).join(', ')}) AS T(i))`,
});


// =========================================================
// Expressions
// =========================================================
addExprs(DialectPgsql);
addFeatures(DialectPgsql);
addQuery(DialectPgsql);
addSources(DialectPgsql);

DialectPgsql.featureFormatter[DialectFeatures.AGGREGATE_ORDER] = (_order: OrderBy[], transform, out) =>
{
  return 'WITHIN GROUP (ORDER BY ' + _order.map( (o) => getOrder(o, out) ).join(', ') + ')';
};

DialectPgsql.featureFormatter[DialectFeatures.INSERT_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
{
  return 'OUTPUT ' + out.modify({ tableOverrides: { [table]: 'INSERTED' }}, () => getSelects(selects, out));
};

DialectPgsql.featureFormatter[DialectFeatures.UPDATE_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
{
  return 'OUTPUT ' + out.modify({ tableOverrides: { [table]: 'INSERTED' }}, () => getSelects(selects, out));
};

DialectPgsql.featureFormatter[DialectFeatures.DELETE_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
{
  return 'OUTPUT ' + out.modify({ tableOverrides: { [table]: 'DELETED' }}, () => getSelects(selects, out));
};

DialectPgsql.featureFormatter[DialectFeatures.DELETE_USING] = (froms: NamedSource<any, any>[], transform, out) => 
{
  return 'FROM ' + froms.map( f => 
  {
    const s = getNamedSource(f, out);

    out.sources.push(f);

    return s;
  }).join(', ');
};

const withRecursive = DialectPgsql.featureFormatter[DialectFeatures.WITH_RECURSIVE];

DialectPgsql.featureFormatter[DialectFeatures.WITH_RECURSIVE] = (value: SourceRecursive<any, any>, transform, out) => 
{
  value.all = true;

  return withRecursive(value, transform, out);
};

DialectPgsql.transformer.setTransformer<QueryJson<any, any>>(
  QueryJson,
  (expr, transform, out) => 
  {
    const { json } = expr;

    const subquery = out.modify({ includeSelectAlias: true }, () => transform(json, out));

    if (json instanceof QueryFirst)
    {
      return subquery + ' FOR JSON PATH, WITHOUT_ARRAY_WRAPPER';
    }
    else if (json instanceof QuerySelect)
    {
      return subquery + ' FOR JSON PATH';
    }
    else if (json instanceof QueryList)
    {
      return `REPLACE( REPLACE( (${subquery} FOR JSON PATH),'{"item":','' ), '"}','"' )`
    }
    else
    {
      throw new Error('Converting the request operation to JSON is not supported.');
    }
  }
);

DialectPgsql.transformer.setTransformer<QueryFirst<any, any, any>>(
  QueryFirst,
  (expr, transform, out) => 
  {
    const { criteria } = expr;

    const params = getCriteria(criteria, transform, out, true);

    params.paging = () => out.dialect.selectLimitOnly({ limit: 1 });

    if (!params.order)
    {
      params.order = () => 'ORDER BY (SELECT NULL)';
    }

    const saved = out.saveSources();

    const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

    out.restoreSources(saved);

    return sql;
  }
);

DialectPgsql.transformer.setTransformer<QueryFirstValue<any, any, any, any>>(
  QueryFirstValue,
  (expr, transform, out) => 
  {
    const { criteria, value, defaultValue } = expr;

    const params = getCriteria(criteria, transform, out, false);

    if (!(value instanceof ExprAggregate))
    {
      params.paging = () => out.dialect.selectLimitOnly({ limit: 1 });

      if (!params.order)
      {
        params.order = () => 'ORDER BY (SELECT NULL)';
      }
    }

    const allSources = criteria.sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

    if (defaultValue)
    {
      params.selects = () => out.addSources(allSources, () =>
        `COALESCE(${transform(value, out)}, ${transform(defaultValue, out)})`
      );
    }
    else
    {
      params.selects = () => out.addSources(allSources, () => out.wrap(value));
    }

    const saved = out.saveSources();

    const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

    out.restoreSources(saved);

    return sql;
  }
);