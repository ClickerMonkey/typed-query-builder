import { addAggregate } from '../Aggregates';
import { initializeWindowless } from './base';


addAggregate('rank', (expr, [], compiler) => 
{
  return (state) => 
  {
    initializeWindowless(expr, state);

    return state.result.partitionIndex - state.result.peerIndex + 1;
  };
});