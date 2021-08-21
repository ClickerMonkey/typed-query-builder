import { Selects } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getSelects } from '../helpers/Selects';


export function addUpdateReturningFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.UPDATE_RETURNING] = ([table, selects]: [string, Selects], transform, out) => 
  {
    return 'RETURNING ' + out.modify({ excludeSource: true }, () => getSelects(selects, out));
  };
}