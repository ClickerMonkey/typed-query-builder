import { Tuple, Name, ObjectKeys } from './internal';



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

export function isTuple<T = any>(x: any): x is Tuple<T>
{
  return Array.isArray(x);
}

export function isFunction<T extends (...args: any[]) => any>(x: any): x is T 
{
  return typeof x === 'function';
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

