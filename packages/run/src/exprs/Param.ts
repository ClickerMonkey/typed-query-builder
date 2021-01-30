import { ExprParam } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprParam, 
  (v) => (state) => {
    const result = state.params[v.param];

    return result === null ? undefined : result;
  }
);