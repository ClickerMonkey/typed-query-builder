import { Expr, AggregateFunctions, ExprAggregate } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer<ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>>(
  ExprAggregate, 
  (v, transform) => {
    const getValues = (v._values as Expr<any>[]).map( transform );
    
    return (sources, params, state) => {
      if (!state) {
        return 0;
      }

      if (state.group.length === 0) {
        switch (v._type) {
          case 'avg':
          case 'max':
          case 'min':
          case 'deviation':
          case 'variance':
            return undefined;
          case 'count':
          case 'sum':
            return 0;
        }
      }

      if (getValues.length == 0) {
        if (v._type === 'count') {
          return state.group.length;
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