import { NamedSource, Selects } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addWithFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.WITH] = (value: NamedSource<any, any>, transform, out) => 
  {
    let x = '';

    x += 'WITH ';
    x += value.getName();
    x += ' (';
    x += (value.getSource().getSelects() as Selects).map( s => s.alias ).join(', ');
    x += ') AS (';
    x += transform(value.getSource(), out);
    x += ') '

    return x;
  };
}