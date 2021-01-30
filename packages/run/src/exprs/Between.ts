import { ExprBetween } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { compare } from '../util';


RunTransformers.setTransformer(
  ExprBetween, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);
    const low = compiler.eval(v.low);
    const high = compiler.eval(v.high);

    return (state) => {
      const v = value.get(state);

      return compare(v, low.get(state)) >= 0 && compare(v, high.get(state)) <= 0;
    };
  }
);