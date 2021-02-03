import { addAggregate } from '../Aggregates';
import { getAggregateValues } from './base';


addAggregate('array', (expr, [value], compiler) => 
{
  return getAggregateValues(expr, value, compiler);
});