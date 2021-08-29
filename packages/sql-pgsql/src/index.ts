
import { getDataTypeMeta, DataTypeInputs, isString, QueryJson, QueryFirst, QuerySelect, QueryList, ExprCast, DataTemporal, DataGeometry, DataTypeGeometryBase, Expr, DataTypePoint, DataTypeSegment, DataTypePath, DataTypePolygon, DataTypeBox, isNumber, DataTypeCircle, DataInterval } from '@typed-query-builder/builder';
import { Dialect, addExprs, addFeatures, addQuery, ReservedWords, addSources, DialectFeatures } from '@typed-query-builder/sql';

import './types';


class PostgresDialect extends Dialect {
  public gis: boolean = false;
  public colonCasting: boolean = false;
}

export const DialectPgsql = new PostgresDialect();

DialectPgsql.removeSupport(
  DialectFeatures.UNSIGNED | 
  DialectFeatures.NAMED_PARAMETERS
);

DialectPgsql.addReservedWords(ReservedWords);

DialectPgsql.implicitPredicates = true;

DialectPgsql.aliasQuotesOptional = /^[a-z\d_]+$/;
DialectPgsql.nameQuotesOptional = /^[a-z\d_]+$/;

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
DialectPgsql.lateralJoinType.aliases({
  INNER: 'INNER JOIN LATERAL',
  LEFT: 'LEFT JOIN LATERAL',
  RIGHT: 'RIGHT JOIN LATERAL',
  FULL: 'FULL JOIN LATERAL',
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
DialectPgsql.valueFormatterMap.BIT = formatInteger;
DialectPgsql.valueFormatterMap.TINYINT = formatInteger;
DialectPgsql.valueFormatterMap.SMALLINT = formatInteger;
DialectPgsql.valueFormatterMap.MEDIUMINT = formatInteger;
DialectPgsql.valueFormatterMap.INT = formatInteger;
DialectPgsql.valueFormatterMap.BIGINT = formatInteger;
DialectPgsql.valueFormatterMap.BITS = formatInteger;

DialectPgsql.setDataTypeFormat('FLOAT', { constant: 'REAL' });
DialectPgsql.valueFormatterMap.FLOAT = formatFloat;

DialectPgsql.setDataTypeFormat('DOUBLE', { constant: 'DOUBLE PRECISION' });
DialectPgsql.valueFormatterMap.DOUBLE = formatFloat;

DialectPgsql.valueFormatterMap.NUMERIC = formatDecimal;
DialectPgsql.valueFormatterMap.DECIMAL = formatDecimal;

DialectPgsql.valueFormatterMap.MONEY  = formatDecimal;

DialectPgsql.valueFormatterMap.CHAR = Dialect.FormatString;

DialectPgsql.valueFormatterMap.VARCHAR = Dialect.FormatString;

DialectPgsql.valueFormatterMap.TEXT = Dialect.FormatString;

DialectPgsql.valueFormatterMap.TIMESTAMP = (v: DataTemporal, d, t) => d.quoteValue(v.text) + '::timestamp' + (v.hasTimeZone ? 'tz' : '');
DialectPgsql.valueFormatterMap.DATE = (v: DataTemporal, d, t) => d.quoteValue(v.text) + '::date';
DialectPgsql.valueFormatterMap.TIME = (v: DataTemporal, d, t) => d.quoteValue(v.text) + '::time' + (v.hasTimeZone ? 'tz' : '');

DialectPgsql.valueFormatterMap.UUID = Dialect.FormatString;

DialectPgsql.valueFormatterMap.CIDR = Dialect.FormatString;
DialectPgsql.valueFormatterMap.INET = Dialect.FormatString;
DialectPgsql.valueFormatterMap.MACADDR = Dialect.FormatString;

DialectPgsql.setDataTypeFormat('BINARY', { constant: 'BYTEA' });
DialectPgsql.valueFormatterMap.BINARY = formatBinary;

DialectPgsql.setDataTypeFormat('VARBINARY', { constant: 'BYTEA' });
DialectPgsql.valueFormatterMap.VARBINARY = formatBinary;

DialectPgsql.setDataTypeFormat('BLOB', { constant: 'BYTEA', tuple: 'BYTEA' });
DialectPgsql.valueFormatterMap.BLOB = formatBinary;

DialectPgsql.valueFormatterMap.JSON = (v, d) => d.quoteValue(JSON.stringify(v)) + '::json';

DialectPgsql.valueFormatterMap.XML = (v, d) => d.quoteValue(String(v)) + '::xml';

DialectPgsql.valueFormatterMap.INTERVAL = (v, d) => {
  if (v instanceof DataInterval) {
    return 'interval ' + d.quoteValue(v.toString());
  }
  const i = DataInterval.from(v);
  if (!i.isValid()){ 
    return String(v);
  } else {
    return 'interval ' + d.quoteValue(i.toString());
  }
};

DialectPgsql.valueFormatterMap.POINT = (v, d) => 
  formatGeometry<DataTypePoint>(v, d, 
    (g, s) => `ST_Point(${g(s.x)}, ${g(s.y)})`,
    (g, s) => `point(${g(s.x)}, ${g(s.y)})`,
  )
;

DialectPgsql.setDataTypeFormat('SEGMENT', { constant: 'LSEG' });
DialectPgsql.valueFormatterMap.SEGMENT = (v, d, t) => 
  formatGeometry<DataTypeSegment>(v, d, 
    (g, s) => `ST_MakeLine(ST_Point(${g(s.x1)}, ${g(s.y1)}), ST_Point(${g(s.x2)}, ${g(s.y2)}))`,
    (g, s) => `lseg('[(${g(s.x1, true)}, ${g(s.y1, true)}), (${g(s.x2, true)}, ${g(s.y2, true)})]')`,
  )
;

DialectPgsql.valueFormatterMap.CIRCLE = (v, d, t) => 
  formatGeometry<DataTypeCircle>(v, d, 
    (g, s) => `ST_Buffer(ST_Point(${g(s.x)}, ${g(s.y)}), ${g(s.r)}, 'quad_segs=32')`,
    (g, s) => `circle('<(${g(s.x, true)}, ${g(s.y, true)}), ${g(s.r, true)}>')`,
  )
;


DialectPgsql.valueFormatterMap.PATH = (v, d, t) => 
  formatGeometry<DataTypePath>(v, d, 
    (g, s) => `ST_MakeLine(ARRAY[${s.points.map(({x, y}: any) => `ST_Point(${g(x)}, ${g(y)})`).join(', ')}])`,
    (g, s) => `path('[${s.points.map(({x, y}: any) => `(${g(x, true)}, ${g(y, true)})`).join(', ')}]')`,
  )
;

DialectPgsql.valueFormatterMap.POLYGON = (v, d, t) => 
  formatGeometry<DataTypePolygon>(v, d, 
    (g, s) => `ST_MakePolygon(ST_MakeLine(ARRAY[${s.corners.map(({x, y}: any) => `ST_Point(${g(x)}, ${g(y)})`).join(', ')}]))`,
    (g, s) => `polygon('(${s.corners.map(({x, y}: any) => `(${g(x, true)}, ${g(y, true)})`).join(', ')})')`,
  )
;

DialectPgsql.valueFormatterMap.BOX = (v, d, i) => 
  formatGeometry<DataTypeBox>(v, d, 
    (g, s) => `ST_MakePolygon(ST_MakeLine(ARRAY[ ST_Point(${g(s.minX)}, ${g(s.minY)}), ST_Point(${g(s.maxX)}, ${g(s.minY)}), ST_Point(${g(s.maxX)}, ${g(s.maxY)}), ST_Point(${g(s.minX)}, ${g(s.maxY)}) ]))`,
    (g, s) => `box('((${g(s.minX, true)}, ${g(s.minY, true)}), (${g(s.maxX, true)}, ${g(s.maxY, true)}))')`,
  )
;


DialectPgsql.dataTypeFormatter.POINT = formatGeometryType;
DialectPgsql.dataTypeFormatter.PATH = formatGeometryType;
DialectPgsql.dataTypeFormatter.POLYGON = formatGeometryType;
DialectPgsql.dataTypeFormatter.LINE = formatGeometryType;
DialectPgsql.dataTypeFormatter.SEGMENT = formatGeometryType;
DialectPgsql.dataTypeFormatter.BOX = formatGeometryType;
DialectPgsql.dataTypeFormatter.CIRCLE = formatGeometryType;


DialectPgsql.dataTypeFormatter.GEOGRAPHY = (dataType: DataTypeInputs) => {
  return dataType === 'GEOGRAPHY' || dataType[0] === 'GEOGRAPHY'
    ? 'GEOGRAPHY'
    : dataType[1] && dataType[1] !== 4326
      ? `GEOGRAPHY(${dataType[0]}, ${dataType[1]})`
      : `GEOGRAPHY(${dataType[0]})`;
};

function formatDecimal(value: number, dialect: Dialect, dataType?: DataTypeInputs)
{
  return value.toFixed(getDataTypeMeta(dataType).fractionDigits || 0);
}

function formatInteger(value: number)
{
  return value.toFixed(0);
}

function formatFloat(value: number)
{
  return value.toString();
}

function formatBinary(value: any, dialect: Dialect)
{
  if (isString(value))
  {
    return 'E' + dialect.quoteValue('\\\\x' + value.split('').map(escapeBinary).join(''));
  }

  if (value instanceof Buffer)
  {
    const hex = value.toString('hex');

    return 'E' + dialect.quoteValue('\\\\x' + hex);
  }

  return value;
}

function formatGeometry<T extends DataTypeGeometryBase>(
  value: DataGeometry<T>, 
  dialect: Dialect,
  getGis: (get: (value: any, inQuote?: boolean) => string, source: T) => string,
  getNormal: (get: (value: any, inQuote?: boolean) => string, source: T) => string,
): string {
  const source: any = value.deep || value;
  const get = value.deep
    ? (value: any, inQuote: boolean = false) => {
      if (value instanceof Expr) {
        const query = dialect.output()(value).query;

        return inQuote
          ? `'||${query}||'`
          : query;
      } else {
        return String(value);
      }
    }
    : (value: any, inQuote: boolean = false) => {
      return isNumber(value) || !inQuote 
        ? String(value)
        : `'||${value}||'`;
    }
  ;

  return DialectPgsql.gis
    ? value.srid
      ? `ST_SetSRID(${getGis(get, source)}, ${value.srid})`
      : getGis(get, source)
    : getNormal(get, source);
}

function formatGeometryType(type: any)
{
  if (!DialectPgsql.gis)
  {
    return type;
  }

  return typeof type === 'string' || !Array.isArray(type)
    ? type
    : typeof type[1] !== 'number' || type[1] === 4326
      ? `GEOGRAPHY(${type[0]})`
      : `GEOGRAPHY(${type[0]}, ${type[1]})`;
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
  uuid: 'GEN_RANDOM_UUID',
  getAge: 'AGE',
  intervalGet: 'DATE_PART',
  intervalTruncate: 'DATE_TRUNC',
  createInterval: 'MAKE_INTERVAL',
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
  geomTranslate: '(({0})+({1}))',
  geomPathConcat: '(({0})+({1}))',
  geomDivide: '(({0})/({1}))',
  geomSame: '(({0})~=({1}))',
  dateAddInterval: '({0}+{1})',
  dateSubInterval: '({0}-{1})',
  timestampAddInterval: '({0}+{1})',
  timestampSubInterval: '({0}-{1})',
  timestampInterval: '({0}-{1})',
  timeSubInterval: '({0}-{1})',
  timeInterval: '({0}-{1})',
  intervalAdd: '({0}+{1})',
  intervalSub: '({0}-{1})',
  intervalNegate: '(-{0})',
  intervalMultiply: '(({0})*({1}))',
  intervalDivide: '(({0})/({1}))',
});

DialectPgsql.functions.formats.geomContains = ([a, b]: any) => DialectPgsql.gis
  ? `ST_Contains(${a}, ${b})`
  : `((${a})@>(${b}))`
;
DialectPgsql.functions.formats.geomDistance = ([a, b]: any) => DialectPgsql.gis
  ? `ST_Distance(${a}, ${b})`
  : `((${a})<->(${b}))`
;
DialectPgsql.functions.formats.geomIntersection = ([a, b]: any) => DialectPgsql.gis
  ? `ST_Intersection(${a}, ${b})`
  : `((${a})#(${b}))`
;
DialectPgsql.functions.formats.geomIntersects = ([a, b]: any) => DialectPgsql.gis
  ? `ST_Intersects(${a}, ${b})`
  : `((${a})?#(${b}))`
;
DialectPgsql.functions.formats.geomTouches = ([a, b]: any) => DialectPgsql.gis
  ? `ST_Touches(${a}, ${b})`
  : `((${a})&&(${b}))`
;
DialectPgsql.functions.formats.geomWithinDistance = ([a, b, c]: any) => DialectPgsql.gis
  ? `ST_DWithin(${a}, ${b}, ${c})`
  : `((${a})<->(${b})) <= ${c}`
;
DialectPgsql.functions.formats.geomScale = ([a, b]: any) => DialectPgsql.gis
  ? `ST_Scale(${a}, ${b})`
  : `((${a})*(${b}))`
;
DialectPgsql.functions.formats.geomPointX = ([a]: any) => DialectPgsql.gis
  ? `ST_X(${a})`
  : `${a}[0]`
;
DialectPgsql.functions.formats.geomPointY = ([a]: any) => DialectPgsql.gis
  ? `ST_Y(${a})`
  : `${a}[1]`
;
DialectPgsql.functions.formats.geomPoints = ([a]: any) => DialectPgsql.gis
  ? `ST_NPoints(${a})`
  : `NPOINTS(${a})`
;
DialectPgsql.functions.formats.geomPoint = ([a, b]: any) => DialectPgsql.gis
  ? `ST_PointN(${a}, ${b})`
  : `ST_PointN(${a}, ${b})`
;
DialectPgsql.functions.formats.geomLength = ([a]: any) => DialectPgsql.gis
  ? `ST_Length(${a})`
  : `LENGTH(${a})`
;
DialectPgsql.functions.formats.geomCenter = ([a]: any) => DialectPgsql.gis
  ? `ST_Centroid(${a})`
  : `CENTER(${a})`
;

DialectPgsql.aggregates.aliases({
  bitAnd: 'BIT_AND',
  bitOr: 'BIT_OR',
  boolAnd: 'BOOL_AND',
  boolOr: 'BOOL_OR',
  string: 'STRING_AGG',
  rowNumber: 'ROW_NUMBER',
  denseRank: 'DENSE_RANK',
  percentRank: 'PERCENT_RANK',
  cumulativeDistribution: 'CUME_DIST',
  firstValue: 'FIRST_VALUE',
  lastValue: 'LAST_VALUE',
  nthValue: 'NTH_VALUE',
  deviation: 'STDDEV',
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
      return `SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) FROM (${subquery}) as t`;
    }
    else if (json instanceof QueryList)
    {
      return `SELECT coalesce(json_agg(t.item), '[]'::json) FROM (${subquery}) as t`;
    }
    else
    {
      throw new Error('Converting the request operation to JSON is not supported.');
    }
  }
);

DialectPgsql.transformer.setTransformer<ExprCast<any>>(
  ExprCast,
  (expr, transform, out) => 
  {
    const { value, type } = expr;

    let x = '';
    const v = out.wrap(value);
    const t = out.dialect.getDataTypeString(type);

    if (DialectPgsql.colonCasting)
    {
      x += v;
      x += '::';
      x += t;
    }
    else
    {
      x += 'CAST(';
      x += v;
      x += ' AS ';
      x += t;
      x += ')';
    }

    return x;
  }
);