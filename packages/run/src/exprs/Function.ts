import { Expr, ExprFunction, Functions } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer<ExprFunction<keyof Functions, Functions>>(
  ExprFunction,
  (v, transform, compiler) => {
    const args = (v.args as Expr<any>[]).map( e => compiler.eval(e) );

    return (state) => {
      const values = args.map(p => p.get(state));

      if (v.func in RunFunctions) {
        return RunFunctions[v.func].apply(values);
      }

      return undefined;
    }
  }
);