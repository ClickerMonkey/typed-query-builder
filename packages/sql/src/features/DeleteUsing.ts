import { NamedSource } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getNamedSource } from '../helpers/NamedSource';


export function addDeleteUsing(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.DELETE_USING] = (value: NamedSource<any, any>, transform, out) => {
    let x = '';

    x += 'USING ';
    x += getNamedSource(value, out);
    
    return x;
  };

}