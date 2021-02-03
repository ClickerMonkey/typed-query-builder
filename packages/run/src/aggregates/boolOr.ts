import { addAggregate } from '../Aggregates';
import { getAggregateValues } from './base';


addAggregate('boolOr', (expr, [value], compiler) => 
{
  const getValues = getAggregateValues(expr, value, compiler);

  return (state) =>
  {
    const values = getValues(state);

    return values.reduce((a, b) => a || b) || false;
  };
});