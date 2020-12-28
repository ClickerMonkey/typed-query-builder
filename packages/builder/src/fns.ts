import { TextModifyType, Tuple, Name, ObjectKeys, TextModify } from './internal';



export function isString(x: any): x is string 
{
  return typeof x === 'string';
}

export function isName(x: any): x is Name
{
  return isString(x) || isNumber(x) || typeof x === 'symbol';
}

export function isNumber(x: any): x is number 
{
  return typeof x === 'number' && isFinite(x);
}

export function isDate(x: any): x is Date 
{
  return x instanceof Date;
}

export function isBoolean(x: any): x is boolean 
{
  return typeof x === 'boolean';
}

export function isArray<T = any>(x: any): x is T[] 
{
  return Array.isArray(x);
}

export function isObject<T = any>(x: any): x is Record<string, any>
{
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function isTuple<T = any>(x: any): x is Tuple<T>
{
  return Array.isArray(x);
}

export function isFunction<T extends (...args: any[]) => any>(x: any): x is T 
{
  return typeof x === 'function';
}

export function compileFormat(format: string)
{
  const SECTION_TYPES = 2;
  const SECTION_INDEX_CONSTANT = 0;

  const sections = format.split(/[\{\}]/).map((section, index) => {
    return index % SECTION_TYPES === SECTION_INDEX_CONSTANT
      ? (_source: any) => section
      : (source: any) => source && section in source ? source[section] : '';
  });

  return (params: any) =>
  {
    return params
        ? sections.reduce((out, section) => out + section(params), '')
        : '';
  };
}

export function isEmpty(x: any): boolean
{
  if (isArray(x))
  {
    return x.length === 0;
  }
  else if (isObject(x))
  {
    for (const _ in x)
    {
      return false;
    }

    return true;
  }
  else if (isString(x))
  {
    return x.length === 0;
  }
  else if (isNumber(x))
  {
    return x === 0;
  }

  return false;
}

export function mapRecord<M, O>(map: M, mapper: <K extends keyof M>(value: M[K], key: K) => O): { [P in keyof M]: O } 
{
  const mapped = Object.create(null);

  for (const prop in map) 
  {
    mapped[prop] = mapper(map[prop], prop);
  }
  
  return mapped;
}

export function keys<T>(object: T): ObjectKeys<T>
{
  return Object.keys(object) as ObjectKeys<T>;
}

export function modifyText<S extends string, T extends TextModifyType>(text: S, type: T): TextModify<S, T>
{
  return type === 'CAPITAL'
    ? text.substring(0, 1).toUpperCase() + text.substring(1)
    : type === 'UNCAPITAL'
      ? text.substring(0, 1).toLowerCase() + text.substring(1)
      : type === 'LOWER'
        ? text.toLowerCase()
        : type === 'UPPER'
          ? text.toUpperCase()
          : text as any;
}