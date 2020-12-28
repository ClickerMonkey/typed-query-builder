import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addInsertIgnoreDuplicateFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.INSERT_IGNORE_DUPLICATE] = (_: null, transform, out) => 
  {
    return 'ON CONFLICT DO NOTHING';
  };
}