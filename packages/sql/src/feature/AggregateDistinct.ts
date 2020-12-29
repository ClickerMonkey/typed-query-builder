import { NamedSource } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addAggregateDistinctFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.AGGREGATE_DISTINCT] = (value: NamedSource<any, any>, transform, out) => 
  {
    return 'DISTINCT';
  };
}