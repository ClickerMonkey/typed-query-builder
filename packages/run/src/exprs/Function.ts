import { Expr, ExprFunction, Functions } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer<ExprFunction<keyof Functions, Functions>>(
  ExprFunction, 
  (v, transform) => {
    const args = (v.args as Expr<any>[]).map(transform);

    return (sources, params, state) => {
      const values = args.map(p => p(sources, params, state));

      if (v.func in RunFunctions) {
        return RunFunctions[v.func].apply(values);
      }

      return undefined;
    }
  }
);