import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addDefaultFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.DEFAULT] = (_: null, transform, out) => 
  {
    return 'DEFAULT';
  };
}