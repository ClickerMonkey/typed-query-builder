import { isValue } from '@typed-query-builder/builder';
import { addAggregate } from '../Aggregates';
import { initializeWindowless } from './base';


addAggregate('lag', (expr, [getValue, getOffset, getDefault], compiler) => 
{
  return (state) => 
  {
    initializeWindowless(expr, state);
    
    const offset = getOffset ? getOffset(state) || 1 : 1;
    const absoluteIndex = state.resultIndex - offset;
    const result = state.results[absoluteIndex];

    state.result = result;
    state.resultIndex = absoluteIndex;
    state.row = result.row;

    const value = getValue(state);

    return isValue(value) 
      ? value 
      : getDefault
        ? getDefault(state)
        : undefined;
  };
});