import { Lock } from '@typed-query-builder/builder';
import { DialectFeatures } from '../Features';
import { DialectOutput } from '../Output';


export function getLock(lock: Lock, out: DialectOutput): string
{
  out.dialect.requireSupport(DialectFeatures.LOCK);

  const { sources, strength, rowLock } = lock;

  let x = '';

  x += 'FOR ';
  x += out.dialect.getAlias(out.dialect.lockStrengthAlias, strength);

  if (sources.length > 0)
  {
    out.dialect.requireSupport(DialectFeatures.LOCK_TABLE);

    x += ' OF ';
    x += sources.map( s => s.table ).join(', ');
  }

  if (rowLock)
  {
    out.dialect.requireSupport(DialectFeatures.LOCK_ROW);

    x += ' ';
    x += out.dialect.getAlias(out.dialect.lockRowAlias, rowLock);
  }
  
  return x;
}