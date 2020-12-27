import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addDefaultFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.DEFAULT] = (filter: null, transform, out) => {
    return 'DEFAULT';
  };
}