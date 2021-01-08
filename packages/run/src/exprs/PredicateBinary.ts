import { ExprPredicateBinary } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { predicate } from '../util';


RunTransformers.setTransformer(
  ExprPredicateBinary, 
  (v, transform) => {
    const value = transform(v.value);
    const test = transform(v.test);

    return (sources, params, state) => {
      const a = value(sources, params, state);
      const b = test(sources, params, state);

      if (a === undefined || b === undefined) {
        return false;
      }

      return predicate(v.type, a, b);
    }
  }
);