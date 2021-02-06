import { addAggregate } from '../Aggregates';
import { getWindowFrame, initializeWindowless } from './base';


addAggregate('lastValue', (expr, [getValue], compiler) => 
{
  const win = expr._overWindow
    ? expr._windows[expr._overWindow as any]
    : expr._overWindowDefinition;

  return (state) => 
  {
    initializeWindowless(expr, state);

    const { result, resultIndex } = state;
    const [ , end ] = getWindowFrame(result, win);
    const absoluteIndex = end + resultIndex - result.partitionIndex;
    const absoluteResult = state.results[absoluteIndex];

    state.result = absoluteResult;
    state.resultIndex = absoluteIndex;
    state.row = absoluteResult.row;

    return state.getRowValue(getValue);
  };
});