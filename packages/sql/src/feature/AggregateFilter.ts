import { ExprScalar, _Boolean } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getPredicate } from '../helpers/Predicate';


export function addAggregateFilterFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.AGGREGATE_FILTER] = (filter: ExprScalar<_Boolean>, transform, out) => 
  {
    return `FILTER (WHERE ${getPredicate(filter, transform, out)})`;
  }; 
}