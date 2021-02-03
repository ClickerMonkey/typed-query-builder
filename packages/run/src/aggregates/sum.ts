import { isNumber } from '@typed-query-builder/builder';
import { addAggregate } from '../Aggregates';
import { getAggregateValues } from './base';


addAggregate('sum', (expr, [value], compiler) => 
{
  const getValues = getAggregateValues(expr, value, compiler);

  return (state) =>
  {
    const values = getValues(state);
    const numbers = values.filter( isNumber );

    return numbers.reduce((a, b) => a + b);
  };
});