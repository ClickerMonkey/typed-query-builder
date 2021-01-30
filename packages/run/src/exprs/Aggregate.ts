import { Expr, AggregateFunctions, ExprAggregate } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


/**
 * When multiple window functions are used, all the window functions having syntactically equivalent PARTITION BY and ORDER BY clauses in their window definitions are guaranteed to be evaluated in a single pass over the data. Therefore they will see the same sort ordering, even if the ORDER BY does not uniquely determine an ordering. However, no guarantees are made about the evaluation of functions having different PARTITION BY or ORDER BY specifications. (In such cases a sort step is typically required between the passes of window function evaluations, and the sort is not guaranteed to preserve ordering of rows that its ORDER BY sees as equivalent.)
 * 
 * Currently, window functions always require presorted data, and so the query output will be ordered according to one or another of the window functions' PARTITION BY/ORDER BY clauses. It is not recommended to rely on this, however. Use an explicit top-level ORDER BY clause if you want to be sure the results are sorted in a particular way.
 */

RunTransformers.setTransformer<ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>>(
  ExprAggregate,
  (v, transform, compiler) => {
    const getValues = (v._values as Expr<any>[]).map( e => compiler.eval(e) );
    
    return (state) => {
    
      if (state.result.group.length === 0) {
        switch (v._type) {
          case 'avg':
          case 'max':
          case 'min':
          case 'deviation':
          case 'variance':
          case 'string':
          case 'lag':
          case 'lead':
          case 'firstValue':
          case 'lastValue':
          case 'nthValue':
            return undefined;
          case 'array':
            return [];
          case 'boolAnd':
          case 'bitOr':
            return false;
          default:
            return 0;
        }
      }

      if (getValues.length == 0) {
        if (v._type === 'count') {
          return state.result.group.length;
        } else {
          return 0;
        }
      }

      const previousRow = state.row;
      const values: any[] = state.group.map((row) => {
        state.row = row;

        return getValue(sources, params, state);
      });
      state.row = previousRow;

      const numbers: number[] = values.filter(isNumber);

      if (v._distinct) {
        for (let i = 0; i < numbers.length; i++) {
          for (let k = numbers.length - 1; k > i; k--) {
            if (numbers[k] === numbers[i]) {
              numbers.splice(k, 1);
            }
          }
        }
      }
      
      switch (v._type) {
        case 'count':
          return values.reduce((count, v) => Boolean(v) ? count + 1 : count, 0);
        case 'avg':
          return numbers.reduce((sum, v) => sum + v, 0) / numbers.length;
        case 'sum':
          return numbers.reduce((sum, v) => sum + v, 0);
        case 'max':
          return numbers.reduce((max, v) => Math.max(max, v));
        case 'min':
          return numbers.reduce((min, v) => Math.min(min, v));
        case 'deviation':
        case 'variance':
          return 0;
      }
    };
  }
);