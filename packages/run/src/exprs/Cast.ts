import { isArray, isNumber, isString, DataTypeTypes, ExprCast, getDataTypeFromInput, getDataTypeMeta, DataPoint, DataLine, DataSegment, DataPath, DataPolygon, DataBox, DataCircle, DataGeometry, DataInterval } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { parseBuffer, parseTemporal, parseGeometry, parseInterval } from '../util';

interface QueryDataTypeConfigObject<T> {
  parser: (value: any) => T,
  isValid: (value: T) => boolean;
  clamp?: (value: T, length?: number, precision?: number) => T | undefined,
}

const QueryDataTypeConfig: {
  [K in keyof DataTypeTypes]: QueryDataTypeConfigObject<DataTypeTypes[K]>
} = {
  'BIGINT': {
    parser: parseInt,
    isValid: isFinite,
  },
  'INT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-2147483648, Math.min(2147483647, x)),
  },
  'MEDIUMINT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-8388608, Math.min(8388607, x)),
  },
  'SMALLINT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-32768, Math.min(32767, x)),
  },
  'TINYINT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-128, Math.min(127, x)),
  },
  'BITS': {
    parser: parseInt,
    isValid: isFinite,
  },
  'BIT': {
    parser: (x: any) => !/^(0|false)$/i.test(String(x)),
    isValid: () => true,
  },
  'BOOLEAN': {
    parser: (x: any) => !/^(0|false)$/i.test(String(x)),
    isValid: () => true,
  },
  'FLOAT': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'NUMERIC': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'DECIMAL': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'DOUBLE': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'MONEY': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'DATE': {
    parser: parseTemporal,
    isValid: (t) => t.hasDate && !t.hasTime,
  },
  'TIME': {
    parser: parseTemporal,
    isValid: (t) => !t.hasDate && t.hasTime,
  },
  'TIMESTAMP': {
    parser: parseTemporal,
    isValid: (t) => t.hasDate && t.hasTime,
  },
  'CHAR': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'VARCHAR': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'TEXT': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'XML': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'INET': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'CIDR': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'MACADDR': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'UUID': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'BINARY': {
    parser: (x) => parseBuffer(x)!,
    isValid: (x) => x instanceof Buffer && x.length > 0,
    clamp: (x, length) => isNumber(length)
      ? x.slice(0, length)
      : x,
  },
  'VARBINARY': {
    parser: (x) => parseBuffer(x)!,
    isValid: (x) => x instanceof Buffer && x.length > 0,
    clamp: (x, length) => isNumber(length)
      ? x.slice(0, length)
      : x,
  },
  'BLOB': {
    parser: (x) => parseBuffer(x)!,
    isValid: (x) => x instanceof Buffer && x.length > 0,
  },
  'JSON': {
    parser: (x) => isString(x) ? JSON.parse(x) : x,
    isValid: () => true,
  },
  'NULL': {
    parser: (x) => x,
    isValid: () => true,
  },
  'ANY': {
    parser: (x) => x,
    isValid: (x) => true,
  },
  'ARRAY': {
    parser: (x) => x,
    isValid: (x) => isArray(x),
  },
  'POINT': {
    parser: parseGeometry(DataPoint),
    isValid: (x) => x instanceof DataPoint && x.isValid(),
  },
  'LINE': {
    parser: parseGeometry(DataLine),
    isValid: (x) => x instanceof DataLine && x.isValid(),
  },
  'SEGMENT': {
    parser: parseGeometry(DataSegment),
    isValid: (x) => x instanceof DataSegment && x.isValid(),
  },
  'PATH': {
    parser: parseGeometry(DataPath),
    isValid: (x) => x instanceof DataPath && x.isValid(),
  },
  'POLYGON': {
    parser: parseGeometry(DataPolygon),
    isValid: (x) => x instanceof DataPolygon && x.isValid(),
  },
  'BOX': {
    parser: parseGeometry(DataBox),
    isValid: (x) => x instanceof DataBox && x.isValid(),
  },
  'CIRCLE': {
    parser: parseGeometry(DataCircle),
    isValid: (x) => x instanceof DataCircle && x.isValid(),
  },
  'GEOMETRY': {
    parser: (x) => x,
    isValid: (x) => x instanceof DataGeometry && x.isValid(),
  },
  'GEOGRAPHY': {
    parser: (x) => x,
    isValid: (x) => x instanceof DataGeometry && x.isValid() && x.srid !== 0,
  },
  'INTERVAL': {
    parser: parseInterval,
    isValid: (x) => x instanceof DataInterval && x.isValid(),
  },
};

// @ts-ignore
RunTransformers.setTransformer(
  ExprCast, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);

    return (state) => {
      const result = value.get(state);
      const typeName = getDataTypeFromInput(v.type);
      const typeMeta = getDataTypeMeta(v.type);
      const typeConfig: QueryDataTypeConfigObject<any> = QueryDataTypeConfig[typeName];
      const cast = typeConfig.parser(result);

      return typeConfig.isValid(cast)
        ? typeConfig.clamp
          ? typeConfig.clamp(cast, typeMeta.length, typeMeta.fractionDigits)
          : cast
        : undefined;
    };
  }
);