import { ExprScalar } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addAggregateFilterFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.AGGREGATE_DISTINCT] = (filter: ExprScalar<boolean>, transform, out) => 
  {
    return `FILTER (WHERE ${transform(filter, out)})`;
  };
}