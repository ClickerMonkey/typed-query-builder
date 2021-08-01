
import { getDataTypeMeta, DataTypeInputs, isNumber, isString, OrderBy, compileFormat, QueryJson, NamedSource, Selects, QueryFirst, QuerySelect, QueryList, QueryFirstValue, ExprAggregate, SourceKind, SourceRecursive, QueryExistential, QuerySet, Select, Name } from '@typed-query-builder/builder';
import { Dialect, addExprs, addFeatures, addQuery, ReservedWords, addSources, DialectFeatures, getOrder, getSelects, getNamedSource, getCriteria, getLock } from '@typed-query-builder/sql';

import './types';


export const DialectMssql = new Dialect();

DialectMssql.removeSupport(
  DialectFeatures.UNSIGNED | 
  DialectFeatures.AGGREGATE_FILTER | 
  DialectFeatures.SELECT_DISTINCT_ON |
  DialectFeatures.ROW_CONSTRUCTOR | 
  DialectFeatures.INSERT_PRIORITY | 
  DialectFeatures.INSERT_IGNORE_DUPLICATE | 
  DialectFeatures.INSERT_SET_ON_DUPLICATE
);

DialectMssql.addReservedWords(ReservedWords);

DialectMssql.selectLimitOnly = compileFormat('OFFSET 0 ROWS FETCH NEXT {limit} ROWS ONLY');
DialectMssql.selectOffsetOnly = compileFormat('OFFSET {offset} ROWS');
DialectMssql.selectOffsetLimit = compileFormat('OFFSET {offset} ROWS FETCH NEXT {limit} ROWS ONLY');

DialectMssql.insertOrder = ['with', 'INSERT', 'top', 'INTO', 'table', 'columns', 'returning', 'values', 'option'];
DialectMssql.deleteOrder = ['with', 'DELETE', 'top', 'FROM', 'table', 'returning', 'using', 'where', 'option'];
DialectMssql.updateOrder = ['with', 'UPDATE', 'top', 'ONLY', 'table', 'set', 'returning', 'from', 'where', 'option'];
DialectMssql.selectOrder = ['with', 'SELECT', 'top', 'distinct', 'selects', 'into', 'from', 'joins', 'where', 'group', 'having', 'windows', 'order', 'paging', 'locks', 'option'];

DialectMssql.nameQuotesOptional = /^#?\w+$/;
DialectMssql.recursiveKeyword = false;
DialectMssql.trueIdentifier = '1';
DialectMssql.falseIdentifier = '0';
DialectMssql.paramPrefix = '@';

DialectMssql.predicateBinary.alias('!=', '<>');
DialectMssql.predicateBinary.setFormat('DISTINCT', 'NOT EXISTS(SELECT {first} INTERSECT SELECT {second})');
DialectMssql.predicateBinary.setFormat('NOT DISTINCT', 'EXISTS(SELECT {first} INTERSECT SELECT {second})');

DialectMssql.predicateBinaryList.alias('!=', '<>');

DialectMssql.operationBinary.aliases({
  BITAND: '&',
  BITOR: '|',
  BITXOR: '^',
});

DialectMssql.operationBinary.setFormats({
  BITLEFT: 'CAST(CAST({first} * POWER(CAST(2 AS BIGINT), {second} & 0x1F) AS BINARY(4)) AS INT)',
  BITRIGHT: '(CASE WHEN {first} >= 0 THEN CAST({first} / POWER(CAST(2 AS BIGINT), {second} & 0x1F) AS INT) ELSE CAST(~(~{first} / POWER(CAST(2 AS BIGINT), {second} & 0x1F)) AS INT) END)',
});

DialectMssql.operationUnary.alias('BITNOT', '~');

DialectMssql.predicateUnary.setFormats({
  FALSE: '{value} = 0',
  TRUE: '{value} = 1',
});

DialectMssql.joinType.aliases({
  INNER: 'INNER JOIN',
  LEFT: 'LEFT JOIN',
  RIGHT: 'RIGHT JOIN',
  FULL: 'FULL JOIN',
});

DialectMssql.aggregates.setDefaultFormat('{name}({distinct}{args}){order}{over}');

// =========================================================
// Data Types
// =========================================================
DialectMssql.setDataTypeUnsupported('BITS');
DialectMssql.setDataTypeUnsupported('LINE');

DialectMssql.setDataTypeFormat('BOOLEAN', { constant: 'BIT' });
DialectMssql.valueFormatterMap.BOOLEAN = Dialect.FormatBoolean;

DialectMssql.setDataTypeFormat('MEDIUMINT', { constant: 'INT', tuple: 'INT({1})' });
DialectMssql.valueFormatterMap.BIT = FormatInteger;
DialectMssql.valueFormatterMap.TINYINT = FormatInteger;
DialectMssql.valueFormatterMap.SMALLINT = FormatInteger;
DialectMssql.valueFormatterMap.MEDIUMINT = FormatInteger;
DialectMssql.valueFormatterMap.INT = FormatInteger;
DialectMssql.valueFormatterMap.BIGINT = FormatInteger;

DialectMssql.setDataTypeFormat('FLOAT', { constant: 'FLOAT(24)' });
DialectMssql.valueFormatterMap.FLOAT = FormatFloat;

DialectMssql.setDataTypeFormat('DOUBLE', { constant: 'FLOAT(53)' });
DialectMssql.valueFormatterMap.DOUBLE = FormatFloat;

DialectMssql.valueFormatterMap.NUMERIC = FormatDecimal;
DialectMssql.valueFormatterMap.DECIMAL = FormatDecimal;

DialectMssql.valueFormatterMap.MONEY  = FormatDecimal;

DialectMssql.setDataTypeFormat('NCHAR', { tuple: 'NCHAR({1})' });
DialectMssql.valueFormatterMap.NCHAR = (v, d, t) => `N${d.quoteValue(v)}`;
DialectMssql.valueFormatterMap.CHAR = Dialect.FormatString;

DialectMssql.setDataTypeFormat('NVARCHAR', { tuple: 'NVARCHAR({1})' });
DialectMssql.valueFormatterMap.NVARCHAR = (v, d, t) => `N${d.quoteValue(v)}`;
DialectMssql.valueFormatterMap.VARCHAR = Dialect.FormatString;

DialectMssql.setDataTypeFormat('TEXT', { constant: 'VARCHAR(MAX)' });
DialectMssql.valueFormatterMap.TEXT = Dialect.FormatString;
DialectMssql.setDataTypeFormat('NTEXT', { constant: 'NVARCHAR(MAX)' });
DialectMssql.valueFormatterMap.NTEXT = (v, d, t) => `N${d.quoteValue(v)}`;

DialectMssql.setDataTypeFormat('TIMESTAMP', { constant: 'DATETIME2' });
DialectMssql.valueFormatterMap.TIMESTAMP = (v, d, t) => `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
DialectMssql.valueFormatterMap.DATE = (v, d, t) => `'${v.toISOString().substring(0, 10)}'`;
DialectMssql.valueFormatterMap.TIME = (v, d, t) => `'${v.toISOString().substring(11, 19)}'`;

DialectMssql.setDataTypeFormat('UUID', { constant: 'UNIQUEIDENTIFIER' });
DialectMssql.valueFormatterMap.UUID = Dialect.FormatString;

DialectMssql.setDataTypeFormat('CIDR', { constant: 'VARCHAR(45)' });
DialectMssql.valueFormatterMap.CIDR = Dialect.FormatString;
DialectMssql.setDataTypeFormat('INET', { constant: 'VARCHAR(45)' });
DialectMssql.valueFormatterMap.INET = Dialect.FormatString;
DialectMssql.setDataTypeFormat('MACADDR', { constant: 'VARCHAR(17)' });
DialectMssql.valueFormatterMap.MACADDR = Dialect.FormatString;

DialectMssql.valueFormatterMap.BINARY = FormatBinary;
DialectMssql.valueFormatterMap.VARBINARY = FormatBinary;

DialectMssql.setDataTypeFormat('BLOB', { constant: 'VARBINARY(MAX)' });
DialectMssql.valueFormatterMap.BLOB = Dialect.FormatString;

DialectMssql.setDataTypeFormat('JSON', { constant: 'NVARCHAR(MAX)' });
DialectMssql.valueFormatterMap.JSON = (v) => JSON.stringify(v);

DialectMssql.setDataTypeFormat('XML', { constant: 'NVARCHAR(MAX)' });
DialectMssql.valueFormatterMap.XML = Dialect.FormatString;

DialectMssql.setDataTypeFormat('GEOMETRY', { constant: 'GEOMETRY' });

DialectMssql.setDataTypeFormat('POINT', { constant: 'GEOMETRY' });
DialectMssql.valueFormatterMap.POINT = ({x, y}, d, t) => `geometry::Point(${x}, ${y}, ${getDataTypeMeta(t).srid})`;

DialectMssql.setDataTypeFormat('SEGMENT', { constant: 'GEOMETRY' });
DialectMssql.valueFormatterMap.SEGMENT = ({x1, y1, x2, y2}, d, t) => 
  `geometry::STGeomFromText('LINESTRING (${textEmbed(x1)} ${textEmbed(y1)}, ${textEmbed(x2)} ${textEmbed(y2)})', ${getDataTypeMeta(t).srid})`;

DialectMssql.setDataTypeFormat('CIRCLE', { constant: 'GEOMETRY' });
DialectMssql.valueFormatterMap.CIRCLE = ({ x, y, r}, d, t) => 
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

DialectMssql.setDataTypeFormat('PATH', { constant: 'GEOMETRY' });
DialectMssql.valueFormatterMap.PATH = ({ points }, d, t) => points.length
  ? `geometry::STGeomFromText('LINESTRING (${points.map( ({x, y}: any) => `${textEmbed(x)} ${textEmbed(y)}` ).join(', ')})', ${getDataTypeMeta(t).srid})`
  : `geometry::STGeomFromText('LINESTRING EMPTY', ${getDataTypeMeta(t).srid})`;

DialectMssql.setDataTypeFormat('POLYGON', { constant: 'GEOMETRY' });
DialectMssql.valueFormatterMap.POLYGON = ({ corners }, d, t) => corners.length
  ? `geometry::STGeomFromText('POLYGON ((${corners.map( ({ x, y }: any) => `${textEmbed(x)} ${textEmbed(y)}` ).join(', ')}))', ${getDataTypeMeta(t).srid})`
  : `geometry::STGeomFromText('POLYGON EMPTY', ${getDataTypeMeta(t).srid})`;

DialectMssql.setDataTypeFormat('BOX', { constant: 'GEOMETRY' });
DialectMssql.valueFormatterMap.BOX = ({ l, t, r, b }, d, i) => 
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
DialectMssql.valueFormatter.push(
  Dialect.FormatBoolean,
  Dialect.FormatDate,
  Dialect.FormatString,
  Dialect.FormatNumber,
  Dialect.FormatNull,
);

// =========================================================
// Functions
// =========================================================
DialectMssql.functions.setUnsupported([
  'cbrt', 'gcd', 'lcm',
  'regexReplace', 'regexGet'
]);
DialectMssql.aggregates.setUnsupported([
  'bitAnd', 'bitOr', 'nthValue'
]);

DialectMssql.functions.aliases({
  ceil: 'CEILING',
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

DialectMssql.functions.setFormats({
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
  geomPointY: '({0}).STY',
  geomArea: '({0}).STArea()',
  geomText: '({0}).STAsText()',
  geomBoundary: '({0}).STBoundary()',
  geomWithBuffer: '({0}).STBuffer({1})',
  geomConvexHull: '({0}).STConvexHull()',
  geomCrosses: '({0}).STCrosses({1})',
  geomDimension: '({0}).STDimension()',
  geomDisjoint: '({0}).STDisjoint({1})',
  geomEnd: '({0}).STEndPoint()',
  geomStart: '({0}).STStartPoint()',
  geomBoundingBox: '({0}).STEnvelope()',
  geomEquals: '({0}).STEquals({1})',
  geomClosed: '({0}).STIsClosed()',
  geomEmpty: '({0}).STIsEmpty()',
  geomRing: '({0}).STISRing()',
  geomSimple: '({0}).STIsSimple()',
  geomValid: '({0}).STIsValid()',
  geomOverlaps: '({0}).STOverlaps({1})',
  geomSrid: '({0}).STSrid',
  geomRandomPoint: '({0}).STPointOnSurface()',
  geomSymmetricDifference: '({0}).STSymDifference({1})',
  geomWithin: '({0}).STWithin({1})',
  geomWithinDistance: '(({0}).STDistance({1}) <= {2})'
});

DialectMssql.aggregates.aliases({
  string: 'STRING_AGG',
  rowNumber: 'ROW_NUMBER',
  denseRank: 'DENSE_RANK',
  percentRank: 'PERCENT_RANK',
  cumulativeDistribution: 'CUME_DIST',
  firstValue: 'FIRST_VALUE',
  lastValue: 'LAST_VALUE',
  variance: 'VAR',
  deviation: 'STDEV',
});

DialectMssql.functionsRawArguments.dateGet = { 0: true };
DialectMssql.functionsRawArguments.dateTruncate = { 0: true };
DialectMssql.functionsRawArguments.dateAdd = { 0: true };
DialectMssql.functionsRawArguments.dateDiff = { 0: true };
DialectMssql.functionsRawArguments.convert = { 0: true };

DialectMssql.functions.setFormats({
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

DialectMssql.aggregates.setFormats({
  boolAnd: '(1 - MIN({distinct}{0})){over}',
  boolOr: 'MAX({distinct}{0}){over}',
  countIf: 'COUNT({distinct}CASE WHEN ({0}) = 1 THEN 1 ELSE NULL END){over}',
});

DialectMssql.functions.setCascadings({
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

DialectMssql.functions.sets({
  greatest: (params) => `(SELECT MAX(i) FROM (VALUES ${params.argList?.map( a => `(${a})`).join(', ')}) AS T(i))`,
  least: (params) => `(SELECT MIN(i) FROM (VALUES ${params.argList?.map( a => `(${a})`).join(', ')}) AS T(i))`,
});


// =========================================================
// Expressions
// =========================================================
addExprs(DialectMssql);
addFeatures(DialectMssql);
addQuery(DialectMssql);
addSources(DialectMssql);

DialectMssql.featureFormatter[DialectFeatures.AGGREGATE_ORDER] = (_order: OrderBy[], transform, out) =>
{
  return 'WITHIN GROUP (ORDER BY ' + _order.map( (o) => getOrder(o, out) ).join(', ') + ')';
};

DialectMssql.featureFormatter[DialectFeatures.INSERT_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
{
  return 'OUTPUT ' + out.modify({ tableOverrides: { [table]: 'INSERTED' }}, () => getSelects(selects, out));
};

DialectMssql.featureFormatter[DialectFeatures.UPDATE_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
{
  return 'OUTPUT ' + out.modify({ tableOverrides: { [table]: 'INSERTED' }}, () => getSelects(selects, out));
};

DialectMssql.featureFormatter[DialectFeatures.DELETE_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
{
  return 'OUTPUT ' + out.modify({ tableOverrides: { [table]: 'DELETED' }}, () => getSelects(selects, out));
};

DialectMssql.featureFormatter[DialectFeatures.DELETE_USING] = (froms: NamedSource<any, any>[], transform, out) => 
{
  return 'FROM ' + froms.map( f => 
  {
    const s = getNamedSource(f, out);

    out.sources.push(f);

    return s;
  }).join(', ');
};

const withRecursive = DialectMssql.featureFormatter[DialectFeatures.WITH_RECURSIVE];

DialectMssql.featureFormatter[DialectFeatures.WITH_RECURSIVE] = (value: SourceRecursive<any, any>, transform, out) => 
{
  value.all = true;

  return withRecursive(value, transform, out);
};

DialectMssql.featureFormatter[DialectFeatures.WITH] = (value: NamedSource<any, any>, transform, out) => 
{
  const source = value.getSource();

  if (source instanceof QuerySelect || source instanceof QuerySet)
  {
    if (!source._criteria.limit && !source._criteria.offset && source._criteria.orderBy.length > 0)
    {
      source._criteria.offset = 0;
    }
  }

  let x = '';

  x += out.dialect.quoteName(value.getName());
  x += ' AS (';
  x += transform(source, out);
  x += ')';

  return x;
};

DialectMssql.transformer.setTransformer<QuerySelect<any, any, any>>(
  QuerySelect,
  (expr, transform, out) => 
  {
    const { _criteria, _distinct, _distinctOn, _locks } = expr;

    const params = getCriteria(_criteria, transform, out, true);

    const saved = out.saveSources();

    if (_distinctOn.length > 0)
    {
      const allSources = _criteria.sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

      params.distinct = () => out.addSources(allSources, () => out.dialect.getFeatureOutput(DialectFeatures.SELECT_DISTINCT_ON, _distinctOn, out));
    }
    else if (_distinct)
    {
      params.distinct = () => 'DISTINCT';
    }

    if (_locks.length > 0)
    {
      params.locks = () => _locks.map( l => getLock( l, out ) ).join(' ');
    }

    if (params.paging && !params.order)
    {
      params.order = () => 'ORDER BY (SELECT NULL)';
    }

    const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

    out.restoreSources(saved);

    return sql;
  }
);

DialectMssql.transformer.setTransformer<QueryJson<any, any>>(
  QueryJson,
  (expr, transform, out) => 
  {
    const { json } = expr;

    if (json instanceof QuerySelect)
    {
      (json._criteria.selects as Select<Name, any>[]).sort((a, b) => String(a.alias).localeCompare(String(b.alias)));
    }

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

DialectMssql.transformer.setTransformer<QueryFirst<any, any, any>>(
  QueryFirst,
  (expr, transform, out) => 
  {
    const { criteria } = expr;

    const params = getCriteria(criteria, transform, out, true);
    const top = criteria.selects.length === 1 && criteria.selects[0].getExpr() instanceof ExprAggregate ? '' : 'TOP 1 ';
    const selects = params.selects;

    if (selects)
    {
      params.selects = () => top + selects();
    }

    delete params.paging;

    const saved = out.saveSources();

    const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

    out.restoreSources(saved);

    return sql;
  }
);

DialectMssql.transformer.setTransformer<QueryFirstValue<any, any, any, any>>(
  QueryFirstValue,
  (expr, transform, out) => 
  {
    const { criteria, value, defaultValue } = expr;

    const params = getCriteria(criteria, transform, out, false);
    const top = value instanceof ExprAggregate ? '' : 'TOP 1 ';
    const allSources = criteria.sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

    if (defaultValue)
    {
      params.selects = () => top + out.addSources(allSources, () =>
        `COALESCE(${transform(value, out)}, ${transform(defaultValue, out)})`
      );
    }
    else
    {
      params.selects = () => top + out.addSources(allSources, () => out.wrap(value));
    }

    delete params.paging;

    const saved = out.saveSources();

    const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

    out.restoreSources(saved);

    return sql;
  }
);

DialectMssql.transformer.setTransformer<QueryExistential<any, any, any>>(
  QueryExistential,
  (expr, transform, out) => 
  {
    const { criteria } = expr;

    const params = getCriteria(criteria, transform, out, false);

    params.selects = () => 'TOP 1 1';
    
    delete params.paging;
    delete params.order;
    delete params.windows;

    const saved = out.saveSources();

    const sql = out.dialect.formatOrdered(out.dialect.selectOrder, params);

    out.restoreSources(saved);

    return sql;
  }
);