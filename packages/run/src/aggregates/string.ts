import { addAggregate } from '../Aggregates';
import { getAggregateValues } from './base';


addAggregate('string', (expr, [value, getDelimiter], compiler) => 
{
  const getValues = getAggregateValues(expr, value, compiler);

  return (state) =>
  {
    const delimiter = getDelimiter(state);
    const values = getValues(state);

    return values.join(delimiter);
  };
});