import { addAggregate } from '../Aggregates';
import { getWindowFrame, initializeWindowless } from './base';


addAggregate('nthValue', (expr, [getValue, getNth], compiler) => 
{
  const win = expr._overWindow
    ? expr._windows[expr._overWindow as any]
    : expr._overWindowDefinition;

  return (state) => 
  {
    initializeWindowless(expr, state);
    
    const { result, resultIndex } = state;
    const [ start ] = getWindowFrame(result, win);
    const nth = state.getRowValue( getNth ) - 1;
    const absoluteIndex = start + resultIndex - result.partitionIndex + nth;
    const absoluteResult = state.results[absoluteIndex];

    state.result = absoluteResult;
    state.resultIndex = absoluteIndex;
    state.row = absoluteResult.row;

    return state.getRowValue(getValue);
  };
});