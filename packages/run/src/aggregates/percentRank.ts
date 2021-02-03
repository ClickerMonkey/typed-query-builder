import { addAggregate } from '../Aggregates';
import { initializeWindowless } from './base';


addAggregate('percentRank', (expr, [], compiler) => 
{
  return (state) => 
  {
    initializeWindowless(expr, state);
    
    return state.result.partitionIndex / (state.result.partitionSize - 1);
  };
});