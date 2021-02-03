import { isNumber } from '@typed-query-builder/builder';
import { addAggregate } from '../Aggregates';
import { getAggregateValues } from './base';


addAggregate('deviation', (expr, [value], compiler) => 
{
  const getValues = getAggregateValues(expr, value, compiler);

  return (state) =>
  {
    const values = getValues(state);
    const numbers = values.filter( isNumber );
    const avg = numbers.reduce((a, b) => a + b) / numbers.length;
    const diffs = numbers.map((a) => (a - avg) * (a - avg));
    const variance = diffs.reduce((a, b) => a + b) / diffs.length;

    return Math.sqrt(variance);
  };
});