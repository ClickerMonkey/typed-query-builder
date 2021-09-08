import { Selects } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getSelects } from '../helpers/Selects';


export function addInsertReturningFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.INSERT_RETURNING] = ([table, alias, selects]: [string, string, Selects], transform, out) => 
  {
    return 'RETURNING ' + out.modify({ excludeSource: true }, () => getSelects(selects, out));
  };
}