import { addAggregate } from '../Aggregates';
import { initializeWindowless } from './base';


addAggregate('denseRank', (expr, [], compiler) => 
{
  return (state) => 
  {
    initializeWindowless(expr, state);

    return state.result.peer + 1;
  }
});