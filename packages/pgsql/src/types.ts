import pg from 'pg';


export const PgsqlTypes =
{
  BOOL: 16,
  BYTEA: 17,
  CHAR: 18,
  NAME: 19,
  INT8: 20,
  INT2: 21,
  INT2VECTOR: 22,
  INT4: 23,
  TEXT: 25,
  JSON: 114,
  XML: 142,
  POINT: 600,
  LSEG: 601,
  PATH: 602,
  BOX: 603,
  POLYGON: 604,
  LINE: 628,
  CIDR: 650,
  FLOAT4: 700,
  FLOAT8: 701,
  CIRCLE: 718,
  MACADDR8: 774,
  MONEY: 790,
  MACADDR: 829,
  INET: 869,
  VARCHAR: 1043,
  DATE: 1082,
  TIME: 1083,
  TIMETZ: 1266,
  TIMESTAMP: 1114,
  TIMESTAMPZ: 1184,
  INTERVAL: 1186,
  BIT: 1560,
  NUMERIC: 1700,
  ANY: 2276,
  UUID: 2950,
  GEOMETRY: 17476,
  GEOGRAPHY: 18132,
}

export type PgsqlTypeParser = ((x: any) => any) | 'string' | 'boolean' | 'float' | 'int' | 'date' | 'json';

export type PgsqlTypeOptions = Partial<Record<keyof typeof PgsqlTypes, PgsqlTypeParser>>

export function setTypes(options: PgsqlTypeOptions): void
{
  for (const typeName in options)
  {
    const parser = getTypeParser(options[typeName]);

    pg.types.setTypeParser(PgsqlTypes[typeName], parser);
  }
}

export function getTypeParser(parser: PgsqlTypeParser): (x: any) => any
{
  switch (parser) {
    case 'string':
      return (x) => x !== null && x !== undefined ? String(x) : x;
    case 'float':
      return (x) => {
        const p = parseFloat(x);

        return isFinite(p) ? p : x;
      };
    case 'int':
      return (x) => {
        const p = parseInt(x);

        return isFinite(p) ? p : x;
      };
    case 'boolean':
      return (x) => Boolean(String(x).match(/^(true|1|x|y|yes)$/i));
    case 'date':
      return (x) => {
        const p = new Date(x);

        return isFinite(p.getTime()) ? p : x;
      }
    case 'json':
      return (x) => {
        if (typeof x === 'string') {
          try {
            return JSON.parse(x);
          } catch (e) {}
        }

        return x;
      };
    default: 
      return parser;
  }
}