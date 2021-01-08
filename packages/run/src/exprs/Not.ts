import { ExprNot } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprNot, 
  (v, transform) => {
    const value = transform(v.predicate);

    return (sources, params, state) => !value(sources, params, state);
  }
);