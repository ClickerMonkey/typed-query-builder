import { isNumber, isString, isDate, isBoolean, PredicateBinaryType } from '@typed-query-builder/builder';



export function compare(a: any, b: any, ignoreCase: boolean = false): number
{
  if (a === null) 
  {
    a = undefined;
  }

  if (b === null)
  { 
    b = undefined;
  }

  if (a === b) 
  {
    return 0;
  }

  if (isString(a) && isString(b)) 
  {
    return (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b);
  }

  if (isNumber(a) && isNumber(b)) 
  {
    return a - b;
  }

  if (isDate(a) && isDate(b)) 
  {
    return a.getTime() - b.getTime();
  }

  if (isBoolean(a) && isBoolean(b)) 
  {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }

  return 0;
};


export function predicate(type: PredicateBinaryType, a: any, b: any, ignoreCase: boolean = false): boolean
{
  switch (type) 
  {
    case 'DISTINCT':
    case '!=':
    case '<>': return compare(a, b, ignoreCase) !== 0;
    case 'NOT DISTINCT':
    case '=': return compare(a, b, ignoreCase) === 0;
    case '<': return compare(a, b, ignoreCase) < 0;
    case '<=': return compare(a, b, ignoreCase) <= 0;
    case '>': return compare(a, b, ignoreCase) > 0;
    case '>=': return compare(a, b, ignoreCase) >= 0;
    case 'LIKE': return new RegExp('^' + String(b).replace(/%/g, '.*') + '$', ignoreCase ? 'i' : undefined).test(String(a));
    case 'NOT LIKE': return !new RegExp('^' + String(b).replace(/%/g, '.*') + '$', ignoreCase ? 'i' : undefined).test(String(a));
  }
}

export function parseDate(x: any) 
{
  if (isDate(x)) 
  {
    return x;
  }

  if (isNumber(x)) 
  {
    return new Date(x);
  }

  if (isString(x)) 
  {
    return new Date(Date.parse(x));
  }
  
  return new Date();
}

export function distance(x1: number, y1: number, x2: number, y2: number): number
{
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
}