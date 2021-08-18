import { DataTypeMeta, DataTypeNames, DataTypeInputs, getDataTypeMeta, getDataTypeFromInput, isFunction, DataPoint, DataPath, DataPolygon, DataSegment, DataBox, isString, DataLine, isNumber, DataTypePoint, DataCircle, DataInterval } from '@typed-query-builder/builder';
import { Client, types, Pool } from 'pg';
import TypeOverrides from 'pg/lib/type-overrides';
import array from 'postgres-array';
import Interval from 'postgres-interval';
import wkx, { Geometry } from 'wkx';
import { Buffer } from 'buffer';



export interface PgsqlTypeDefinition {
  oid?: number;
  native: string;
  meta?: DataTypeMeta;
  format?: 'text' | 'binary';
  parser?: (value: any) => any;
  load?: boolean;
}

// bpchar=1042

export const PgsqlTypes: Record<DataTypeNames, PgsqlTypeDefinition[]> = {
  BOOLEAN   : [
    { oid: 1000, native: '_bool', meta: { array: true } }, 
    { oid: 16, native: 'bool' }
  ],
  BIT       : [
    { oid: 1561, native: '_bit', meta: { array: true } }, 
    { oid: 1560, native: 'bit' }
  ],
  BITS      : [
    { oid: 1563, native: '_varbit', meta: { array: true } }, 
    { oid: 1562, native: 'varbit' }
  ],
  TINYINT   : [
    { oid: 1005, native: '_int2', meta: { array: true } },
    { oid: 21, native: 'int2' }
  ],
  SMALLINT  : [
    { oid: 1005, native: '_int2', meta: { array: true } }, 
    { oid: 21, native: 'int2' }
  ],
  MEDIUMINT : [
    { oid: 1007, native: '_int4', meta: { array: true } }, 
    { oid: 23, native: 'int4' }
  ],
  INT       : [
    { oid: 1007, native: '_int4', meta: { array: true } }, 
    { oid: 23, native: 'int4' }
  ],
  BIGINT    : [
    { oid: 1016, native: '_int8', meta: { array: true } }, 
    { oid: 20, native: 'int8', format: 'text', parser: parseInteger, load: true }
  ],
  NUMERIC   : [
    { oid: 1231, native: '_numeric', meta: { array: true } }, 
    { oid: 1700, native: 'numeric', format: 'text', parser: parseNumeric, load: true }
  ],
  DECIMAL   : [
    { oid: 1231, native: '_numeric', meta: { array: true } }, 
    { oid: 1700, native: 'numeric', format: 'text', parser: parseNumeric, load: true }
  ],
  FLOAT     : [
    { oid: 1021, native: '_float4', meta: { array: true } }, 
    { oid: 700, native: 'float4' }
  ],
  DOUBLE    : [
    { oid: 1022, native: '_float8', meta: { array: true } }, 
    { oid: 701, native: 'float8' }
  ],
  MONEY     : [
    { oid: 791, native: '_money', meta: { array: true } }, 
    { oid: 790, native: 'money' }
  ],
  DATE      : [
    { oid: 1182, native: '_date', meta: { array: true } }, 
    { oid: 1082, native: 'date' }
  ],
  TIME      : [
    { oid: 1270, native: '_timetz', meta: { array: true, timezoned: true } }, 
    { oid: 1266, native: 'timetz', meta: { timezoned: true } }, 
    { oid: 1183, native: '_time', meta: { array: true } }, 
    { oid: 1083, native: 'time' }
  ],
  TIMESTAMP : [
    { oid: 1185, native: '_timestamptz', meta: { array: true, timezoned: true } }, 
    { oid: 1184, native: 'timestamptz', meta: { timezoned: true } }, 
    { oid: 1115, native: '_timestamp', meta: { array: true } }, 
    { oid: 1114, native: 'timestamp' }
  ],
  INTERVAL  : [
    { oid: 1187, native: '_interval', meta: { array: true } }, 
    { oid: 1186, native: 'interval', format: 'text', parser: parseInterval, load: true }
  ],
  CHAR      : [
    { oid: 1002, native: '_char', meta: { array: true } }, 
    { oid: 18, native: 'char' }
  ],
  VARCHAR   : [
    { oid: 1015, native: '_varchar', meta: { array: true } }, 
    { oid: 1043, native: 'varchar' }
  ],
  TEXT      : [
    { oid: 1009, native: '_text', meta: { array: true } }, 
    { oid: 25, native: 'text', format: 'text', parser: v => v, load: true }
  ],
  UUID      : [
    { oid: 2951, native: '_uuid', meta: { array: true } }, 
    { oid: 2950, native: 'uuid' }
  ],
  INET      : [
    { oid: 1041, native: '_inet', meta: { array: true } }, 
    { oid: 869, native: 'inet' }
  ],
  CIDR      : [
    { oid: 651, native: '_cidr', meta: { array: true } }, 
    { oid: 650, native: 'cidr' }
  ],
  MACADDR   : [
    { oid: 1040, native: '_macaddr', meta: { array: true } }, 
    { oid: 829, native: 'macaddr' }
  ],
  BINARY    : [
    { oid: 1001, native: '_bytea', meta: { array: true } }, 
    { oid: 17, native: 'bytea' }
  ],
  VARBINARY : [
    { oid: 1001, native: '_bytea', meta: { array: true } }, 
    { oid: 17, native: 'bytea' }
  ],
  BLOB      : [
    { oid: 1001, native: '_bytea', meta: { array: true } }, 
    { oid: 17, native: 'bytea' }
  ],
  JSON      : [
    { oid: 199, native: '_json', meta: { array: true } }, 
    { oid: 114, native: 'json' }
  ],
  XML       : [
    { oid: 143, native: '_xml', meta: { array: true } }, 
    { oid: 142, native: 'xml' }
  ],
  POINT     : [
    { oid: 1017, native: '_point', meta: { array: true } }, 
    { oid: 600, native: 'point', format: 'text', parser: parsePoint, load: true }
  ],
  LINE      : [
    { oid: 629, native: '_line', meta: { array: true } }, 
    { oid: 628, native: 'line', format: 'text', parser: parseLine, load: true }
  ],
  SEGMENT   : [
    { oid: 1018, native: '_lseg', meta: { array: true } }, 
    { oid: 601, native: 'lseg', format: 'text', parser: parseSegment, load: true }
  ],
  BOX       : [
    { oid: 1020, native: '_box', meta: { array: true } }, 
    { oid: 603, native: 'box', format: 'text', parser: parseBox, load: true }
  ],
  POLYGON   : [
    { oid: 1027, native: '_polygon', meta: { array: true } }, 
    { oid: 604, native: 'polygon', format: 'text', parser: parsePolygon, load: true }
  ],
  PATH      : [
    { oid: 1019, native: '_path', meta: { array: true } }, 
    { oid: 602, native: 'path', format: 'text', parser: parsePath, load: true }
  ],
  CIRCLE    : [
    { oid: 719, native: '_circle', meta: { array: true } }, 
    { oid: 718, native: 'circle', format: 'text', parser: parseCircle, load: true }
  ],
  GEOMETRY  : [
    { native: '_geometry', meta: { array: true } }, 
    { native: 'geometry', format: 'text', parser: parseGeometry, load: true }
  ],
  GEOGRAPHY : [
    { native: '_geography', meta: { array: true } }, 
    { native: 'geography', format: 'text', parser: parseGeometry, load: true }
  ],
  ANY       : [
    { oid: 2276, native: 'any' },
  ],
  ARRAY     : [],
  NULL      : [],
  SMALLSERIAL : [],
  SERIAL    : [],
  BIGSERIAL : [],
};

// Populate default parsers
for (const dataTypeName in PgsqlTypes) 
{
  const defs: PgsqlTypeDefinition[] = PgsqlTypes[dataTypeName];

  for (const def of defs)
  {
    if (def.oid !== undefined && !def.parser)
    {
      const binaryParser = types.getTypeParser(def.oid, 'binary');

      if (binaryParser && String(binaryParser).indexOf('noParse') === -1) 
      {
        def.format = 'binary';
        def.parser = binaryParser;
      } 
      else 
      {
        const textParser = types.getTypeParser(def.oid, 'text');

        if (textParser && String(textParser).indexOf('noParse') === -1) 
        {
          def.format = 'text';
          def.parser = textParser;
        }
      }
    }
  }

  // Go back through and populate array parsers if they don't exist.
  for (const def of defs)
  {
    if (!def.parser && def.meta?.array)
    {
      const element = defs.find(d => 
        !d.meta?.timezoned === !def.meta?.timezoned &&
        !d.meta?.array !== !def.meta?.array
      );

      if (element && element.format && element.parser)
      {
        def.load = true;
        def.format = element.format;
        def.parser = (value: any) => {
          if (value === null || value === undefined) {
            return value;
          }
          return array.parse(value, element.parser!);
        };
      }
    }
  }
}

export type PgsqlTypeParser = ((x: any) => any) | DataTypeInputs;

export type PgsqlTypeOptions = Map<DataTypeInputs, PgsqlTypeParser>;

export function getTypeDefinition(type: DataTypeInputs): PgsqlTypeDefinition | undefined
{
  const key = getDataTypeFromInput(type);
  const meta = getDataTypeMeta(type);
  const defs = PgsqlTypes[key];

  if (!defs)
  {
    return undefined;
  }

  return defs.find(d => 
    !d.meta?.array === !meta?.array && 
    !d.meta?.timezoned === !meta?.timezoned
  );
}

export function setTypes(options: PgsqlTypeOptions): void
{
  for (const [key, parser] of options.entries())
  {
    const def = getTypeDefinition(key);

    if (!def || !def.oid)
    {
      throw new Error(`Type ${JSON.stringify(key)} did not have a matching definition in PgsqlTypes.`);
    }

    def.load = true;

    if (isFunction(parser))
    {
      types.setTypeParser(def.oid, parser);

      def.format = 'text';
      def.parser = parser;
    }
    else
    {
      const like = getTypeDefinition(parser);

      if (!like || !like.format || !like.parser)
      {
        throw new Error(`Type ${JSON.stringify(key)} did not have a matching definition ${JSON.stringify(parser)} in PgsqlTypes.`);
      }

      types.setTypeParser(def.oid, like.format, like.parser);

      def.format = like.format;
      def.parser = like.parser;
    }
  }
}

export async function loadTypes(conn: Client | Pool): Promise<void>
{
  const dynamicDefs = Object.values(PgsqlTypes)
    .reduce((all, defs) => all.concat(defs), [])
    .filter(def => def.oid === undefined)
  ;

  const dynamicNames = dynamicDefs.map(d => d.native);

  const typeProvider: TypeOverrides = (conn as any)._types
    ? (conn as any)._types
    : (conn as any).options.types
      ? (conn as any).options.types
      : (conn as any).options.types = new TypeOverrides();

  const systemTypes = await conn.query<{id: number, name: string}>(
    `SELECT oid AS "id", typname AS "name" from pg_catalog.pg_type WHERE typname IN (
      ${dynamicNames.map(n => `'${n}'`).join(', ')}
    )`
  );

  for (const { id, name } of systemTypes.rows) {
    const def = dynamicDefs.find(d => d.native === name);
    if (def && def.format && def.parser) {
      typeProvider.setTypeParser(id, def.format, def.parser);
    }
  }

  for (const dataTypeName in PgsqlTypes) {
    for (const def of PgsqlTypes[dataTypeName]) {
      if (def.load && def.oid && def.format && def.parser) {
        typeProvider.setTypeParser(def.oid, def.format, def.parser);
      }
    }
  }
}

function parseGeometry(value: string): any
{
  if (value === null || value === undefined) 
  {
    return value;
  }

  const buffer = Buffer.from(value, 'hex');
  const geom = wkx.Geometry.parse(buffer);

  return translateGeometry(geom, geom.srid);
}

function translateGeometry(geom: Geometry, srid: number): any
{
  if (geom instanceof wkx.Point)
  {
    return new DataPoint(geom.x, geom.y, srid);
  }

  if (geom instanceof wkx.LineString)
  {
    if (geom.points.length === 2)
    {
      const [ p1, p2 ] = geom.points;

      return new DataSegment(p1.x, p1.y, p2.x, p2.y, srid);
    }

    return new DataPath(geom.points, srid);
  }

  if (geom instanceof wkx.Polygon)
  {
    const points = geom.exteriorRing;

    if (points.length === 4)
    {
      const pointsX = points.map(p => p.x);
      const pointsY = points.map(p => p.y);
      const minX = pointsX.reduce((a, b) => Math.min(a, b));
      const maxX = pointsX.reduce((a, b) => Math.max(a, b));
      const minY = pointsY.reduce((a, b) => Math.min(a, b));
      const maxY = pointsY.reduce((a, b) => Math.max(a, b));
      const minXSide = pointsX.filter(x => x === minX).length === 2;
      const maxXSide = pointsX.filter(x => x === maxX).length === 2;
      const minYSide = pointsY.filter(x => x === minY).length === 2;
      const maxYSide = pointsY.filter(x => x === maxY).length === 2;

      if (minXSide && maxXSide && minYSide && maxYSide)
      {
        return new DataBox(minX, minY, maxX, maxY, srid);
      }
    }

    return new DataPolygon(points, srid);
  }

  if (geom instanceof wkx.MultiPoint)
  {
    return geom.points.map(g => translateGeometry(g, srid)!);
  }

  if (geom instanceof wkx.MultiLineString)
  {
    return geom.lineStrings.map(g => translateGeometry(g, srid)!);
  }

  if (geom instanceof wkx.MultiPolygon)
  {
    return geom.polygons.map(g => translateGeometry(g, srid)!);
  }

  return null;
}

function parseGeometryString(value: string | null | undefined): number[]
{
  if (!isString(value))
  {
    return [];
  }

  return value
    .replace(/[\s(){}<>[\]]+/g, '')
    .split(',')
    .map(parseFloat)
  ;
}

function parsePoint(value: string | null | undefined): any
{
  const [x, y] = parseGeometryString(value);

  if (isNumber(x) && isNumber(y))
  {
    return new DataPoint(x, y);
  }

  return value;
}

function parseLine(value: string | null | undefined): any
{
  const [a, b, c] = parseGeometryString(value);

  if (isNumber(a) && isNumber(b) && isNumber(c))
  {
    return new DataLine(a, b, c);
  }

  return value;
}

function parseSegment(value: string | null | undefined): any
{
  const [x1, y1, x2, y2] = parseGeometryString(value);

  if (isNumber(x1) && isNumber(y1) && isNumber(x2) && isNumber(y2))
  {
    return new DataSegment(x1, y1, x2, y2);
  }
  
  return value;
}

function parseBox(value: string | null | undefined): any
{
  const [x1, y1, x2, y2] = parseGeometryString(value);

  if (isNumber(x1) && isNumber(y1) && isNumber(x2) && isNumber(y2))
  {
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);

    return new DataBox(minX, minY, maxX, maxY);
  }
  
  return value;
}

function parsePath(value: string | null | undefined): any
{
  const coords = parseGeometryString(value);

  if (coords.length === 0)
  {
    return value;
  }

  const points: DataTypePoint[] = [];

  for (let i = 0; i < coords.length; i += 2)
  {
    points.push(new DataPoint(coords[i], coords[i + 1]));
  }

  return new DataPath(points);
}

function parsePolygon(value: string | null | undefined): any
{
  const coords = parseGeometryString(value);

  if (coords.length === 0)
  {
    return value;
  }

  const corners: DataTypePoint[] = [];

  for (let i = 0; i < coords.length; i += 2)
  {
    corners.push(new DataPoint(coords[i], coords[i + 1]));
  }

  return new DataPolygon(corners);
}

function parseCircle(value: string | null | undefined): any
{
  const [x, y, r] = parseGeometryString(value);

  if (isNumber(x) && isNumber(y) && isNumber(r))
  {
    return new DataCircle(x, y, r);
  }

  return value;
}

function parseInterval(value: string | null | undefined): any
{
  if (value === null || value === undefined)
  {
    return value;
  }

  const int = Interval(value);

  return new DataInterval(int.seconds, int.minutes, int.hours, int.days, int.months, int.years);
}

function parseInteger(value: string | null | undefined): any
{
  const parsed = parseInt(value!, 10);

  return isFinite(parsed) ? parsed : value;
}

function parseNumeric(value: string | null | undefined): any
{
  const parsed = parseFloat(value!);

  return isFinite(parsed) ? parsed : value;
}