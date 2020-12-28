import { Selects } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getSelects } from '../helpers/Selects';


export function addUpdateReturningFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.UPDATE_RETURNING] = (value: Selects, transform, out) => 
  {
    let x = '';

    x += 'RETURNING ';
    x += getSelects(value, out);
    
    return x;
  };

}