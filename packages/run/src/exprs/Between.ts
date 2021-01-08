import { ExprBetween } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { compare } from '../util';


RunTransformers.setTransformer(
  ExprBetween, 
  (v, transform) => {
    const value = transform(v.value);
    const low = transform(v.low);
    const high = transform(v.high);

    return (sources, params, state) => {
      const v = value(sources, params, state);

      return compare(v, low(sources, params, state)) >= 0 && compare(v, high(sources, params, state)) <= 0;
    };
  }
);