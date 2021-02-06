
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