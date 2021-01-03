import { NamedSource } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addWithFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.WITH] = (value: NamedSource<any, any>, transform, out) => 
  {
    let x = '';

    x += out.dialect.quoteName(value.getName());
    x += ' AS (';
    x += transform(value.getSource(), out);
    x += ')'

    return x;
  };
}