import { isArray, isDate, isString, PredicateBinaryType } from '@typed-query-builder/builder';



const typeOrdering = {
  'string'    : 1,
  'number'    : 2,
  'bigint'    : 3,
  'boolean'   : 4,
  'symbol'    : 5,
  'object'    : 6,
  'function'  : 7,
  'undefined' : 8,
};

export function compare(a: any, b: any, ignoreCase: boolean = false, nullsLast: boolean = true, forSort: boolean = false): number
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

  const at = typeof a;
  const bt = typeof b;

  if (at !== bt)
  {
    return at === 'undefined' && !nullsLast
      ? forSort ? -1 : Number.NaN
      : bt === 'undefined' && !nullsLast
        ? forSort ? 1 : Number.NaN
        : typeOrdering[at] - typeOrdering[bt];
  }

  if (at === 'string')
  {
    return (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b);
  }

  if (at === 'number' || at === 'bigint')
  {
    return a - b;
  }

  if (at === 'boolean') 
  {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }

  if (at === 'object')
  {
    const ad = isDate(a);
    const bd = isDate(b);

    if (ad && bd) 
    {
      return a.getTime() - b.getTime();
    }
    else if (ad !== bd)
    {
      return forSort ? 0 : Number.NaN;
    }

    const aa = isArray(a);
    const ba = isArray(b);

    if (aa && ba)
    {
      const dl = a.length - b.length;

      if (dl !== 0)
      {
        return dl;
      }

      for (let i = 0; i < a.length; i++)
      {
        const d = compare(a[i], b[i], ignoreCase, nullsLast);

        if (d !== 0)
        {
          return d;
        }
      }

      return 0;
    }
    else if (aa !== ba)
    {
      return forSort ? 0 : Number.NaN;
    }

    for (const prop in a)
    {
      if (!(prop in b))
      {
        return 1;
      }
    }

    for (const prop in b)
    {
      if (!(prop in a))
      {
        return -1;
      }
    }

    for (const prop in a)
    {
      const d = compare(a[prop], b[prop], ignoreCase, nullsLast);

      if (d !== 0)
      {
        return d;
      }
    }

    return 0;
  }

  return forSort ? 0 : Number.NaN;
};


export function predicate(type: PredicateBinaryType, a: any, b: any, ignoreCase: boolean = false, nullsLast: boolean = true): boolean
{
  switch (type) 
  {
    case 'DISTINCT':
    case '!=':
    case '<>': return compare(a, b, ignoreCase, nullsLast) !== 0;
    case 'NOT DISTINCT':
    case '=': return compare(a, b, ignoreCase, nullsLast) === 0;
    case '<': return compare(a, b, ignoreCase, nullsLast) < 0;
    case '<=': return compare(a, b, ignoreCase, nullsLast) <= 0;
    case '>': return compare(a, b, ignoreCase, nullsLast) > 0;
    case '>=': return compare(a, b, ignoreCase, nullsLast) >= 0;
    case 'LIKE':
      if (!isString(a) || !isString(b)) {
        return false;
      }
      return new RegExp('^' + b.replace(/%/g, '.*') + '$', ignoreCase ? 'i' : undefined).test(a);
    case 'NOT LIKE': 
      if (!isString(a) || !isString(b)) {
        return true;
      }
      return !new RegExp('^' + String(b).replace(/%/g, '.*') + '$', ignoreCase ? 'i' : undefined).test(String(a));
  }
}