import { isNumber, isString, isDate, PredicateBinaryType, isArray } from '@typed-query-builder/builder';


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

export function removeDuplicates<T>(rows: T[], isMatch: (a: T, b: T) => boolean): number
{
  let duplicates =0;

  for (let i = rows.length - 1; i > 0; i--)
  {
    const last = rows[i];

    for (let j = i - 1; j >= 0; j--)
    {
      if (isMatch(last, rows[j]))
      {
        rows.splice( i, 1 );
        duplicates++;

        continue;
      }
    }
  }

  return duplicates;
}

export interface SortFuncs<T>
{
  compare(a: T, b: T): number;
  equals(a: T, b: T): boolean;
  setGroup(a: T, group: number): void;
  setGroupIndex(a: T, groupIndex: number): void;
  setGroupSize?(a: T, groupSize: number): void;
}

export interface SortFuncsInput<T>
{
  compare(a: T, b: T): number;
  equals?(a: T, b: T): boolean;
  setGroup?(a: T, group: number): void;
  setGroupIndex?(a: T, groupIndex: number): void;
  setGroupSize?(a: T, groupSize: number): void;
}

export const SortFuncNone: SortFuncs<any> = 
{
  compare: (a, b) => 0,
  equals: (a, b) => true,
  setGroup: () => {},
  setGroupIndex: () => {},
};

export function sort<T>(items: T[], primaryInput: SortFuncsInput<T>, secondaryInput: SortFuncsInput<T> = SortFuncNone): void
{
  if (items.length <= 1)
  {
    return;
  }

  const primary: SortFuncs<T> = {
    ...SortFuncNone,
    equals: (a, b) => primaryInput.compare(a, b) === 0,
    ...primaryInput,
  };

  const secondary: SortFuncs<T> = {
    ...SortFuncNone,
    equals: (a, b) => secondaryInput.compare(a, b) === 0,
    ...secondaryInput,
  };

  const n = items.length;

  items.sort((a, b) =>
  {
    let d = primary.compare(a, b);

    if (d === 0)
    {
      d = secondary.compare(a, b);
    }
    
    return d;
  });

  let prev = items[0];

  let primaryGroup = 0;
  let primaryGroupIndex = 0;
  let primaryGroupStart = 0;

  primary.setGroup(prev, primaryGroup);
  primary.setGroupIndex(prev, primaryGroupIndex);
  
  let secondGroup = 0;
  let secondGroupIndex = 0;
  let secondGroupStart = 0;

  secondary.setGroup(prev, secondGroup);
  secondary.setGroupIndex(prev, secondGroupIndex);

  const applySize = (funcs: SortFuncs<T>, index: number, start: number, end: number) => 
  {
    if (funcs.setGroupSize)
    {
      const groupSize = index + 1;

      for (let k = start; k < end; k++)
      {
        funcs.setGroupSize(items[k], groupSize);
      }
    }
  };

  for (let i = 1; i < n; i++)
  {
    const curr = items[i];

    if (primary.equals(prev, curr))
    {
      primaryGroupIndex++;

      if (secondary.equals(prev, curr))
      {
        secondGroupIndex++;
      }
      else
      {
        applySize(secondary, secondGroupIndex, secondGroupStart, i);
        secondGroup++;
        secondGroupIndex = 0;
        secondGroupStart = i;
      }
    }
    else
    {
      applySize(primary, primaryGroupIndex, primaryGroupStart, i);
      primaryGroup++;
      primaryGroupIndex = 0;
      primaryGroupStart = i;

      applySize(secondary, secondGroupIndex, secondGroupStart, i);
      secondGroup = 0;
      secondGroupIndex = 0;
      secondGroupStart = i;
    }

    primary.setGroup(curr, primaryGroup);
    primary.setGroupIndex(curr, primaryGroupIndex);

    secondary.setGroup(curr, secondGroup);
    secondary.setGroupIndex(curr, secondGroupIndex);

    prev = curr;
  }

  applySize(secondary, secondGroupIndex, secondGroupStart, n);
  applySize(primary, primaryGroupIndex, primaryGroupStart, n);
}