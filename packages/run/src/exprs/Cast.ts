import { isArray, isNumber, isString, DataTypeTypes, ExprCast, getDataTypeFromInput, getDataTypeFromValue, getDataTypeMeta } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { parseDate } from '../util';

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
    parser: parseDate,
    isValid: (d) => isFinite(d.getTime()),
  },
  'TIME': {
    parser: parseDate,
    isValid: () => true,
  },
  'TIMESTAMP': {
    parser: parseDate,
    isValid: (d) => isFinite(d.getTime()),
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
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'VARBINARY': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'BLOB': {
    parser: (x) => String(x),
    isValid: isString,
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
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'POINT',
  },
  'LINE': {
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'LINE',
  },
  'SEGMENT': {
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'SEGMENT',
  },
  'PATH': {
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'PATH',
  },
  'POLYGON': {
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'POLYGON',
  },
  'BOX': {
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'BOX',
  },
  'CIRCLE': {
    parser: (x) => x,
    isValid: (x) => getDataTypeFromValue(x) === 'CIRCLE',
  },
  'GEOMETRY': {
    parser: (x) => x,
    isValid: (x) => ['POINT', 'LINE', 'SEGMENT', 'PATH', 'POLYGON', 'BOX'].includes(getDataTypeFromValue(x) as any),
  },
  'GEOGRAPHY': {
    parser: (x) => x,
    isValid: () => true,
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