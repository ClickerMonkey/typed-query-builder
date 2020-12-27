import { Selects, SourceRecursive } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addWithRecursive(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.WITH_RECURSIVE] = (value: SourceRecursive<any, any>, transform, out) => {
    let x = '';

    x += 'WITH RECURSIVE ';
    x += value.getName();
    x += ' (';
    x += (value.getSource().getSelects() as Selects).map( s => s.alias ).join(', ');
    x += ') AS (';
    x += transform(value.source, out);
    x += ' UNION ';
    if (value.all) {
      x += 'ALL ';
    }
    x += transform(value.recursive, out);
    x += ') '

    return x;
  };
}