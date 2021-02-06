import { addAggregate } from '../Aggregates';
import { initializeWindowless } from './base';


addAggregate('ntile', (expr, [getBuckets], compiler) => 
{
  return (state) => 
  {
    initializeWindowless(expr, state);

    const buckets = state.getRowValue(getBuckets);

    return Math.floor(state.result.partitionIndex / Math.ceil(state.result.partitionSize / buckets)) + 1;
  };
});