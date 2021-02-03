import { addAggregate } from '../Aggregates';
import { getAggregateValues } from './base';


addAggregate('countIf', (expr, [condition], compiler) => 
{
  const getConditions = getAggregateValues(expr, condition, compiler);

  return (state) =>
  {
    const conditions = getConditions(state);

    return conditions.reduce((sum, pass) => sum + (pass ? 1 : 0), 0);
  };
});