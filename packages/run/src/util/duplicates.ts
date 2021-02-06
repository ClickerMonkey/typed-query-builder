
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
