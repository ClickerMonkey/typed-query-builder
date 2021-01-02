import { NamedSource } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addWithFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.WITH] = (value: NamedSource<any, any>, transform, out) => 
  {
    let x = '';

    x += 'WITH ';
    x += out.dialect.quoteName(value.getName());
    // x += ' (';
    // x += (value.getSelects() as Selects).map( s => s.alias ).join(', ');
    // x += ') AS (';
    x += ' AS (';
    x += transform(value.getSource(), out);
    x += ')'

    return x;
  };
}