import { addAggregate } from '../Aggregates';
import { initializeWindowless } from './base';


addAggregate('rowNumber', (expr, [], compiler) => 
{
  return (state) => 
  {
    initializeWindowless(expr, state);
    
    return state.result.partitionIndex + 1;
  };
});