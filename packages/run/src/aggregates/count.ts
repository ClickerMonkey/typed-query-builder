import { isValue } from '@typed-query-builder/builder';
import { addAggregate } from '../Aggregates';
import { getAggregateFiltered, getAggregateValues } from './base';


addAggregate('count', (expr, [value], compiler) => 
{
  const getValues = Boolean(value)
    ? getAggregateValues(expr, value, compiler)
    : getAggregateFiltered(expr, compiler);

  return (state) =>
  {
    const values = getValues(state);

    return Boolean(value)
      ? values.reduce((sum, v) => sum + (isValue(v) ? 1 : 0), 0)
      : values.length;
  };
});