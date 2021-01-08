import { ExprParam } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprParam, 
  (v) => (_, params) => {
    const result = params?.[v.param];

    return result === null ? undefined : result;
  }
);