import { ExprPredicateBinary } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { predicate } from '../util';


RunTransformers.setTransformer(
  ExprPredicateBinary, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);
    const test = compiler.eval(v.test);

    return (state) => {
      const a = value.get(state);
      const b = test.get(state);

      if (a === undefined || b === undefined) {
        return false;
      }

      return predicate(v.type, a, b);
    }
  }
);